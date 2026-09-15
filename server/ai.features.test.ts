import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("Sahabat AI 2.0 feature contracts", () => {
  it("rejects an empty image prompt", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.ai.generateImage({ prompt: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects oversized news topics", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.ai.newsBriefing({ topic: "x".repeat(161) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects coding requests without code or error", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.ai.codeHelp({ language: "typescript", code: "", error: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
