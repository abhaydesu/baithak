"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  COOKIE,
  SESSION_SECONDS,
  createSession,
  keyMatches,
} from "@/lib/analytics/auth";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export async function login(formData: FormData) {
  const key = String(formData.get("key") ?? "");
  const ip = clientIp(await headers());
  // 10 attempts per 15 minutes per address.
  if (!rateLimit(`login:${ip}`, 10, 15 * 60_000) || !keyMatches(key)) {
    redirect("/admin/analytics?error=1");
  }
  (await cookies()).set(COOKIE, createSession()!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_SECONDS,
  });
  redirect("/admin/analytics");
}

export async function logout() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
  redirect("/admin/analytics");
}
