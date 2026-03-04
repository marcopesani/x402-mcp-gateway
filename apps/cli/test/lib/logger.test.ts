import { expect } from "chai";

import { logCliBackendRequestFailure } from "../../src/lib/logger.js";

describe("logger", () => {
  const originalWrite = process.stderr.write.bind(process.stderr);

  afterEach(() => {
    process.stderr.write = originalWrite;
    delete process.env.BREVET_LOG_JSON;
    delete process.env.BREVET_LOG_LEVEL;
  });

  it("emits normalized json error payload", () => {
    process.env.BREVET_LOG_JSON = "1";
    process.env.BREVET_LOG_LEVEL = "info";

    let written = "";
    process.stderr.write = ((chunk: string | Uint8Array) => {
      written += chunk.toString();
      return true;
    }) as typeof process.stderr.write;

    logCliBackendRequestFailure({
      backendUrl: "http://backend.test",
      errorMessage: "Authentication failed: backend returned 401",
      path: "/auth/whoami",
      requestId: "request-1",
      status: 401,
    });

    const payload = JSON.parse(written.trim()) as Record<string, unknown>;
    expect(payload["event.name"]).to.equal("cli.backend.request.failed");
    expect(payload["event.outcome"]).to.equal("failure");
    expect(payload["request.id"]).to.equal("request-1");
    expect(payload.status).to.equal(401);
  });
});
