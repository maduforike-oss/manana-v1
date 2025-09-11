export function sanitizeUsername(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, '') // Remove spaces
    .replace(/[^a-z0-9_]/g, '') // Keep only letters, numbers, underscore
    .slice(0, 20); // Max 20 characters
}

export function validateUsername(username: string): {
  isValid: boolean;
  error?: string;
} {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 20) {
    return { isValid: false, error: 'Username must be 20 characters or less' };
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  if (username.startsWith('_') || username.endsWith('_')) {
    return { isValid: false, error: 'Username cannot start or end with underscore' };
  }

  return { isValid: true };
}