import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("ai.chat", () => {
  it("rejects an unsupported mode before calling the model", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.ai.chat({
        mode: "unknown" as "daily",
        messages: [{ role: "user", content: "Halo" }],
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects an empty message before calling the model", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.ai.chat({
        mode: "business",
        messages: [{ role: "user", content: "" }],
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects an unsupported knowledge domain before calling the model", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.ai.chat({
        mode: "daily",
        domain: "biology" as "general",
        messages: [{ role: "user", content: "Apa itu?" }],
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects an unsupported model preference before calling the model", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.ai.chat({
        mode: "daily",
        modelPreference: "claude-instant" as "auto",
        messages: [{ role: "user", content: "Halo" }],
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("requires local provider configuration when local model is selected", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.ai.chat({
        mode: "daily",
        modelPreference: "local",
        messages: [{ role: "user", content: "Halo" }],
      })
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });
});
