export const API_ROUTES = {
  accounts: "/api/accounts",
  strategies: "/api/strategies",
  uploads: "/api/uploads",
  gumloopWebhook: "/api/gumloop/webhook",
  health: "/api/health",
} as const;

export type ApiRouteKey = keyof typeof API_ROUTES;

export const getApiRoute = (key: ApiRouteKey): string => {
  return API_ROUTES[key];
};

