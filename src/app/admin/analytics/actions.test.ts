import { beforeEach, describe, expect, it, vi } from "vitest";

const set = vi.fn();
const del = vi.fn();
let ip = "1.1.1.1";
vi.mock("next/headers", () => ({
  cookies: async () => ({ set, delete: del }),
  headers: async () => new Headers({ "x-forwarded-for": ip }),
}));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`redirect:${to}`);
  },
}));

import { sessionValid } from "@/lib/analytics/auth";
import { resetRateLimits } from "@/lib/rateLimit";
import { login, logout } from "./actions";

const form = (key: string) => {
  const f = new FormData();
  f.set("key", key);
  return f;
};

beforeEach(() => {
  process.env.ANALYTICS_KEY = "right-key";
  resetRateLimits();
  ip = "1.1.1.1";
});

describe("admin actions", () => {
  it("logs in with a signed session, not the key", async () => {
    await expect(login(form("right-key"))).rejects.toThrow("redirect:/admin/analytics");
    const [name, value, opts] = set.mock.calls[0];
    expect(name).toBe("vybrid-admin");
    expect(value).not.toBe("right-key");
    expect(sessionValid(value)).toBe(true);
    expect(opts).toMatchObject({ httpOnly: true, sameSite: "strict", path: "/admin" });
  });
  it("rejects a wrong key", async () => {
    await expect(login(form("wrong"))).rejects.toThrow("error=1");
    expect(set).not.toHaveBeenCalled();
  });
  it("locks out after repeated attempts, even with the right key", async () => {
    for (let i = 0; i < 10; i++) await expect(login(form("wrong"))).rejects.toThrow("error=1");
    await expect(login(form("right-key"))).rejects.toThrow("error=1");
    expect(set).not.toHaveBeenCalled();
    ip = "2.2.2.2";
    await expect(login(form("right-key"))).rejects.toThrow("redirect:/admin/analytics");
  });
  it("logs out", async () => {
    await expect(logout()).rejects.toThrow("redirect:/admin/analytics");
    expect(del).toHaveBeenCalledWith({ name: "vybrid-admin", path: "/admin" });
  });
});
