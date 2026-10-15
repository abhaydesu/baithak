import { beforeEach, describe, expect, it } from "vitest";

import { clientIp, rateLimit, resetRateLimits } from "./rateLimit";

beforeEach(resetRateLimits);

describe("rateLimit", () => {
  it("allows up to the limit then blocks", () => {
    expect([1, 2, 3, 4].map(() => rateLimit("k", 3, 1000, 0))).toEqual([true, true, true, false]);
  });
  it("tracks keys separately and resets after the window", () => {
    rateLimit("a", 1, 1000, 0);
    expect(rateLimit("a", 1, 1000, 500)).toBe(false);
    expect(rateLimit("b", 1, 1000, 500)).toBe(true);
    expect(rateLimit("a", 1, 1000, 1000)).toBe(true);
  });
  it("stays bounded under many distinct keys", () => {
    for (let i = 0; i < 6000; i++) expect(rateLimit(`k${i}`, 1, 1000, 0)).toBe(true);
    expect(rateLimit("fresh", 1, 1000, 5000)).toBe(true);
  });
});

describe("clientIp", () => {
  it("prefers the first forwarded address", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("1.1.1.1");
    expect(clientIp(new Headers({ "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
