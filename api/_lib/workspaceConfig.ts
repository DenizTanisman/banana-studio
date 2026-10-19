import { validateCloudPublicConfig } from '../../publicConfig.js';
export const getCloudWorkspaceConfig = (env = process.env) => validateCloudPublicConfig({
  mode: 'cloud', supabaseUrl: env.SUPABASE_URL,
  supabasePublishableKey: env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY,
});
