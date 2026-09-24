import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "linknamu_admin";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7일

// 비밀번호에서 파생한 세션 토큰. 비밀번호를 바꾸면 기존 세션은 모두 무효가 된다.
function sessionToken(password: string) {
  return createHmac("sha256", password).update("linknamu-admin-session").digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return safeEqual(sessionToken(input), sessionToken(password));
}

export function isAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!password || !token) return false;
  return safeEqual(token, sessionToken(password));
}

export function startSession() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return;
  cookies().set(SESSION_COOKIE, sessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function endSession() {
  cookies().delete(SESSION_COOKIE);
}
