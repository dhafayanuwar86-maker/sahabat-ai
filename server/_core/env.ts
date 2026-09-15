export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  llmProvider: process.env.LLM_PROVIDER === "local" ? "local" : "forge",
  localLlmBaseUrl: process.env.LOCAL_LLM_BASE_URL ?? "http://127.0.0.1:11434/v1",
  localLlmApiKey: process.env.LOCAL_LLM_API_KEY ?? "",
  localLlmModel: process.env.LOCAL_LLM_MODEL ?? "llama3.1:8b",
};
