import { PostgrestError } from '@supabase/supabase-js';

/**
 * Custom error class for Supabase operation errors
 */
export class SupabaseOperationError extends Error {
  code?: string;
  details?: string;
  hint?: string;
  
  constructor(message: string, postgrestError?: PostgrestError) {
    super(message);
    this.name = 'SupabaseOperationError';
    
    if (postgrestError) {
      this.code = postgrestError.code;
      this.details = postgrestError.details;
      this.hint = postgrestError.hint;
    }
  }
}

/**
 * Handles Supabase operation errors consistently
 */
export const handleSupabaseError = (
  error: unknown, 
  defaultMessage = 'An error occurred with the database operation'
): SupabaseOperationError => {
  console.error('Supabase operation error:', error);
  
  if (error instanceof PostgrestError) {
    return new SupabaseOperationError(
      error.message || defaultMessage,
      error
    );
  }
  
  if (error instanceof Error) {
    return new SupabaseOperationError(error.message || defaultMessage);
  }
  
  return new SupabaseOperationError(defaultMessage);
};

/**
 * Type guard to check if an error is a PostgrestError
 */
export const isPostgrestError = (error: unknown): error is PostgrestError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'details' in error &&
    'hint' in error &&
    'message' in error
  );
}; 