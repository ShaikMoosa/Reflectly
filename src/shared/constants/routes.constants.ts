export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  PROJECT: (id: string) => `/projects/${id}`,
  TRANSCRIPT: (id: string) => `/projects/${id}/transcript`,
  CHAT: (id: string) => `/projects/${id}/chat`,
  WHITEBOARD: (id: string) => `/projects/${id}/whiteboard`,
  NOTES: (id: string) => `/projects/${id}/notes`,
  KANBAN: (id: string) => `/projects/${id}/kanban`,
  SETTINGS: '/settings',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
} as const;
