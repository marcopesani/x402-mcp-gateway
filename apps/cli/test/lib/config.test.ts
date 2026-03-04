import { expect } from "chai";

import { getApiKey, getBackendUrl } from "../../src/lib/config.js";

describe("config helpers", () => {
  const originalBackend = process.env.BREVET_BACKEND_URL;
  const originalApiKey = process.env.BREVET_API_KEY;

  afterEach(() => {
    process.env.BREVET_BACKEND_URL = originalBackend;
    process.env.BREVET_API_KEY = originalApiKey;
  });

  it("prefers explicit backend url", () => {
    process.env.BREVET_BACKEND_URL = "http://localhost:9999";
    expect(getBackendUrl("http://localhost:1111")).to.equal("http://localhost:1111");
  });

  it("uses backend env var when explicit value missing", () => {
    process.env.BREVET_BACKEND_URL = "http://localhost:9999";
    expect(getBackendUrl()).to.equal("http://localhost:9999");
  });

  it("prefers explicit api key", () => {
    process.env.BREVET_API_KEY = "env_key";
    expect(getApiKey("flag_key")).to.equal("flag_key");
  });

  it("uses api key env fallback", () => {
    process.env.BREVET_API_KEY = "env_key";
    expect(getApiKey()).to.equal("env_key");
  });
});
