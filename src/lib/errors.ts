import { AuthError } from '@supabase/supabase-js';

export class ProfileError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ProfileError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please try again.';
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link.';
      case 'User already registered':
        return 'An account with this email already exists.';
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    // Handle Supabase RLS errors
    if (error.message.includes('new row violates row-level security policy')) {
      return 'You do not have permission to perform this action.';
    }

    // Handle unique constraint violations
    if (error.message.includes('duplicate key value violates unique constraint')) {
      if (error.message.includes('username')) {
        return 'This username is already taken. Please choose another.';
      }
      return 'This value already exists. Please choose another.';
    }

    // Handle storage errors
    if (error.message.includes('storage')) {
      return 'Failed to upload file. Please try again.';
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function handleAsyncError<T>(
  promise: Promise<T>,
  fallback?: T
): Promise<[T | undefined, string | null]> {
  return promise
    .then<[T, null]>((data: T) => [data, null])
    .catch<[T | undefined, string]>((error: unknown) => [
      fallback,
      getErrorMessage(error)
    ]);
}