/**
 * Environment variable validator for Supabase integration
 */
export const validateSupabaseEnv = (): boolean => {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingVars = requiredVars.filter(
    varName => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.error(
      `Missing required Supabase environment variables: ${missingVars.join(', ')}.`
    );
    console.error(
      'Please check your .env.local file and ensure all required variables are set.'
    );
    return false;
  }
  
  return true;
};

/**
 * Gets a validated value for an environment variable
 * @throws Error if the environment variable is not set
 */
export const getEnvVar = (name: string): string => {
  const value = process.env[name];
  
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  
  return value;
};

/**
 * Validated Supabase environment variables
 */
export const supabaseEnv = {
  url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
}; 