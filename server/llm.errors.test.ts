import { describe, expect, it } from "vitest";
import { isRetryableStatus, isUsageExhaustedError, LLMUpstreamError } from "./_core/llm";

describe("LLM upstream error handling", () => {
  it("does not retry a usage-exhausted precondition error", () => {
    const error = new LLMUpstreamError(
      "LLM invoke failed: 412 Precondition Failed",
      412,
      '{"code":9,"message":"your account has hit a usage exhausted"}',
    );
    expect(isRetryableStatus(412)).toBe(false);
    expect(isUsageExhaustedError(error)).toBe(true);
  });

  it("retries transient and rate-limit statuses only", () => {
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(408)).toBe(true);
    expect(isRetryableStatus(400)).toBe(false);
    expect(isRetryableStatus(401)).toBe(false);
  });

  it("does not classify unrelated upstream errors as quota exhaustion", () => {
    const error = new LLMUpstreamError("bad request", 400, '{"message":"invalid model"}');
    expect(isUsageExhaustedError(error)).toBe(false);
  });
});
