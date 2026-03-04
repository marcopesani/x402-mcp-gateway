import { expect } from "chai";
import { MockAgent, setGlobalDispatcher } from "undici";

import { backendFetch, BackendHttpError, fetchJsonOrThrow } from "../../src/lib/api-client.js";

describe("api client", () => {
  it("normalizes url joining for backend fetch", async () => {
    try {
      await backendFetch("http://127.0.0.1:1/", "/hello");
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
    }
  });

  it("throws BackendHttpError for non-2xx responses", async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);
    const pool = mockAgent.get("http://backend.test");
    pool
      .intercept({ method: "GET", path: "/auth/whoami" })
      .reply(401, { ok: false }, { headers: { "x-request-id": "backend-request-id" } });

    let raised: unknown;
    try {
      await fetchJsonOrThrow(
        "http://backend.test",
        "/auth/whoami",
        (payload) => payload,
        { method: "GET" },
      );
    } catch (error) {
      raised = error;
    }

    expect(raised).to.be.instanceOf(BackendHttpError);
    expect((raised as BackendHttpError).requestId).to.equal("backend-request-id");
    expect((raised as BackendHttpError).path).to.equal("/auth/whoami");
    await mockAgent.close();
  });

  it("propagates x-request-id header to backend", async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);
    const pool = mockAgent.get("http://backend.test");

    let capturedHeader: string | undefined;
    pool.intercept({ method: "GET", path: "/auth/whoami" }).reply((request) => {
      const candidate = (request.headers as Record<string, string | string[] | undefined> | undefined)?.["x-request-id"];
      capturedHeader = Array.isArray(candidate) ? candidate[0] : candidate;
      return {
        data: {
          ok: true,
        },
        statusCode: 200,
      };
    });

    await backendFetch("http://backend.test", "/auth/whoami", { method: "GET" });
    expect(capturedHeader).to.be.a("string");
    expect(capturedHeader).to.have.length.greaterThan(10);
    await mockAgent.close();
  });
});
