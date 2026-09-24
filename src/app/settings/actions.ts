"use server";

import { revalidatePath } from "next/cache";
import type { LinkItem, Profile } from "@/data/profile";
import { checkPassword, endSession, isAdmin, startSession } from "@/lib/auth";
import { saveProfile } from "@/lib/profile";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function login(password: string): Promise<ActionResult> {
  if (typeof password !== "string" || !checkPassword(password)) {
    return { ok: false, error: "비밀번호가 올바르지 않아요." };
  }
  startSession();
  return { ok: true };
}

export async function logout() {
  endSession();
}

const MAX_LINKS = 50;
const MAX_IMAGE_LENGTH = 400_000; // data URL 기준 약 300KB
const DATA_IMAGE_RE = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*$/;
const LINK_ID_RE = /^[a-z0-9-]{1,40}$/;

function text(value: unknown, max: number) {
  return typeof value === "string" && value.trim().length <= max ? value.trim() : null;
}

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

// 서버 액션 인자는 누구나 임의로 보낼 수 있으므로 전부 다시 검증한다.
function validateProfile(input: unknown): Profile | string {
  if (typeof input !== "object" || input === null) return "잘못된 요청이에요.";
  const raw = input as Record<string, unknown>;

  const name = text(raw.name, 50);
  if (!name) return "이름은 1~50자로 입력해 주세요.";

  const bio = text(raw.bio, 160);
  if (bio === null) return "소개글은 160자 이하로 입력해 주세요.";

  const image = typeof raw.image === "string" ? raw.image : "";
  const isLocalPath = image.startsWith("/") && !image.startsWith("//");
  const isDataImage = image.length <= MAX_IMAGE_LENGTH && DATA_IMAGE_RE.test(image);
  if (!isLocalPath && !isDataImage) return "프로필 사진이 올바르지 않거나 너무 커요.";

  if (!Array.isArray(raw.links) || raw.links.length > MAX_LINKS) {
    return `링크는 최대 ${MAX_LINKS}개까지 등록할 수 있어요.`;
  }

  const links: LinkItem[] = [];
  const seenIds = new Set<string>();
  for (const rawLink of raw.links as (Record<string, unknown> | null)[]) {
    const id = typeof rawLink?.id === "string" ? rawLink.id : "";
    if (!rawLink || !LINK_ID_RE.test(id) || seenIds.has(id)) return "링크 정보가 올바르지 않아요.";
    seenIds.add(id);

    const title = text(rawLink.title, 60);
    if (!title) return "링크 제목은 1~60자로 입력해 주세요.";

    const url = text(rawLink.url, 2000);
    if (!url || !isHttpUrl(url)) return `"${title}" 링크의 주소는 http(s)://로 시작해야 해요.`;

    const description = rawLink.description === undefined ? "" : text(rawLink.description, 100);
    if (description === null) return "링크 설명은 100자 이하로 입력해 주세요.";

    links.push({ id, title, url, ...(description && { description }) });
  }

  return { name, bio, image, links };
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  if (!isAdmin()) return { ok: false, error: "로그인이 필요해요. 새로고침 후 다시 로그인해 주세요." };

  const profile = validateProfile(input);
  if (typeof profile === "string") return { ok: false, error: profile };

  try {
    const saved = await saveProfile(profile);
    if (!saved) {
      return { ok: false, error: "DB가 설정되지 않아 저장할 수 없어요. (MONGODB_URI 확인)" };
    }
  } catch (error) {
    console.error("프로필 저장 실패:", error);
    return { ok: false, error: "저장 중 오류가 발생했어요." };
  }

  revalidatePath("/");
  return { ok: true };
}
