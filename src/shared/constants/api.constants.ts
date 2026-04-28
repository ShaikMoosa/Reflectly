export const API_ENDPOINTS = {
  PROJECTS: '/api/projects',
  TRANSCRIPT: '/api/transcribe',
  CHAT: '/api/chat',
  NOTES: '/api/notes',
  PLANNER: '/api/planner',
  SUBSCRIPTION: '/api/subscription',
  ACCOUNT: '/api/account',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;
