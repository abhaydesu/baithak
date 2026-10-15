import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const connect = vi.fn();
vi.mock("mongoose", () => ({ default: { connect: (...a: unknown[]) => connect(...a) } }));

beforeEach(() => {
  vi.resetModules();
  connect.mockReset();
  delete (global as { mongoose?: unknown }).mongoose;
});
afterEach(() => vi.unstubAllEnvs());

describe("connectToDatabase", () => {
  it("returns null and warns without MONGODB_URI", async () => {
    vi.stubEnv("MONGODB_URI", "");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { connectToDatabase } = await import("./mongoose");
    expect(await connectToDatabase()).toBeNull();
    expect(warn).toHaveBeenCalled();
  });
  it("connects once and caches", async () => {
    vi.stubEnv("MONGODB_URI", "mongodb://x");
    const conn = { id: 1 };
    connect.mockResolvedValue(conn);
    const { connectToDatabase } = await import("./mongoose");
    expect(await connectToDatabase()).toBe(conn);
    expect(await connectToDatabase()).toBe(conn);
    expect(connect).toHaveBeenCalledTimes(1);
    expect(connect).toHaveBeenCalledWith("mongodb://x", { dbName: "vybrid" });
  });
  it("shares one in-flight connection", async () => {
    vi.stubEnv("MONGODB_URI", "mongodb://x");
    connect.mockResolvedValue({ id: 2 });
    const { connectToDatabase } = await import("./mongoose");
    await Promise.all([connectToDatabase(), connectToDatabase()]);
    expect(connect).toHaveBeenCalledTimes(1);
  });
});
