import { isLocalWorkspace } from '../runtimeConfig';
import { getSession, supabase } from './authService';
import { createTaskDeadline, waitForTask } from '../asyncTask';
import { configureTextModelPreferences, GEMINI_THINKING_LEVELS, resolveTextModelPreferences, type TextModelPreferences } from '../textModels';
import { TEXT_MODEL_OPTIONS } from '../types';
import { isOpenAIReasoningEffort } from '../openaiText';
import { OPENROUTER_TEXT_MODEL } from '../openrouterText';
import { OPENAI_TEXT_MODEL } from '../openaiText';

export type SavedTextPreferences = TextModelPreferences & { source: 'personal' | 'all'; revision: number; canSaveAll: boolean;
  preferredModel?: TextModelPreferences['model']; openRouterConfigured?: boolean };
export type TextPreferenceScope = 'me' | 'all';

async function requestPreferences(scope?: TextPreferenceScope, preferences?: TextModelPreferences, expectedUserId?: string): Promise<SavedTextPreferences> {
  const task = createTaskDeadline(10_000, undefined, 'Model settings could not be loaded. Please try again.');
  try {
    const session = await waitForTask(getSession(), task.signal);
    if (!session || (expectedUserId && session.user.id !== expectedUserId)) throw new Error('Session changed. Please sign in again.');
    const { data, error } = await waitForTask(scope
      ? supabase.rpc('save_text_model_preferences', { p_expected_user_id: session.user.id, p_scope: scope, p_model: preferences?.model,
        p_gemini_thinking: preferences?.thinkingLevel, p_openai_reasoning: preferences?.reasoningEffort }).abortSignal(task.signal)
      : supabase.rpc('get_text_model_preferences').abortSignal(task.signal), task.signal);
    if (error) throw new Error(error.code === '42501' ? 'You do not have permission to save these settings.' : 'Model settings are unavailable. Please try again.');
    const current = await waitForTask(getSession(), task.signal);
    if (current?.user.id !== session.user.id) throw new Error('Session changed. Please try again.');
    if (!data || !TEXT_MODEL_OPTIONS.some(option => option.value === data.model)
      || !GEMINI_THINKING_LEVELS.includes(data.thinkingLevel) || !isOpenAIReasoningEffort(data.reasoningEffort)
      || !['personal', 'all'].includes(data.source) || typeof data.canSaveAll !== 'boolean'
      || !Number.isSafeInteger(data.revision) || data.revision < 1) throw new Error('Invalid model settings response. Please try again.');
    if (data.model !== OPENROUTER_TEXT_MODEL) return data as SavedTextPreferences;
    // Roll out the global preference safely before the owner installs the key.
    // Recheck on EVERY new task so adding the key activates Opus for all users
    // without another save, and running requests keep their actual model.
    const status = await waitForTask(fetch('/api/gemini-status', {
      cache: 'no-store', headers: { Authorization: `Bearer ${session.access_token}` }, signal: task.signal,
    }), task.signal);
    if (!status.ok) throw new Error('Model configuration could not be loaded. Please try again.');
    const config = await waitForTask(status.json(), task.signal);
    if (typeof config?.openRouterConfigured !== 'boolean') throw new Error('Invalid model configuration. Please try again.');
    const latest = await waitForTask(getSession(), task.signal);
    if (latest?.user.id !== session.user.id) throw new Error('Session changed. Please try again.');
    return { ...data, preferredModel: data.model, openRouterConfigured: config.openRouterConfigured,
      model: config.openRouterConfigured || isLocalWorkspace() ? OPENROUTER_TEXT_MODEL : OPENAI_TEXT_MODEL } as SavedTextPreferences;
  } finally { task.dispose(); }
}

export const loadTextPreferences = () => requestPreferences();
export const saveTextPreferences = (scope: TextPreferenceScope, preferences: TextModelPreferences) => requestPreferences(scope, preferences);

/** Every new creative task reads the server before capturing its immutable settings. */
export const startTextPreferencesSync = (userId: string): (() => void) => {
  const stop = configureTextModelPreferences(() => requestPreferences(undefined, undefined, userId));
  void Promise.resolve(resolveTextModelPreferences()).catch(() => { /* The next action or Settings surfaces a retryable error. */ });
  return stop;
};
