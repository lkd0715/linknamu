"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { logout, updateProfile } from "@/app/settings/actions";
import type { LinkItem, Profile } from "@/data/profile";

const DEFAULT_IMAGE = "/profile.svg";
const IMAGE_SIZE = 256;

const inputClass = "glass-input";
const cardClass = "glass rounded-2xl p-5";
const smallButtonClass =
  "rounded-lg border border-white/70 bg-white/40 px-2 py-1 text-xs transition hover:border-sky-400 disabled:opacity-30 dark:border-white/10 dark:bg-white/5";

// 클릭 수 집계 키로 쓰이는 링크 id. 한 번 만들면 바뀌지 않는다.
function newLinkId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// 업로드한 사진을 가운데 기준 정사각형으로 잘라 작은 JPEG data URL로 만든다.
// DB에 그대로 저장하므로 용량을 줄여 둔다.
async function toProfileImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = IMAGE_SIZE;
  canvas.height = IMAGE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas를 사용할 수 없어요.");
  ctx.fillStyle = "#fff"; // 투명 배경 PNG가 JPEG에서 검게 나오지 않게
  ctx.fillRect(0, 0, IMAGE_SIZE, IMAGE_SIZE);
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    IMAGE_SIZE,
    IMAGE_SIZE,
  );
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

type Status = { type: "success" | "error"; message: string } | null;

export default function SettingsForm({ initialProfile }: { initialProfile: Profile }) {
  const router = useRouter();
  const [name, setName] = useState(initialProfile.name);
  const [bio, setBio] = useState(initialProfile.bio);
  const [image, setImage] = useState(initialProfile.image);
  const [links, setLinks] = useState<LinkItem[]>(initialProfile.links);
  const [status, setStatus] = useState<Status>(null);
  const [pending, startTransition] = useTransition();

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // 같은 파일을 다시 골라도 onChange가 발생하도록
    if (!file) return;
    try {
      setImage(await toProfileImage(file));
    } catch {
      setStatus({ type: "error", message: "이미지를 읽을 수 없어요. 다른 파일을 선택해 주세요." });
    }
  }

  function updateLink(id: string, changes: Partial<LinkItem>) {
    setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, ...changes } : link)));
  }

  function moveLink(index: number, offset: -1 | 1) {
    setLinks((prev) => {
      const next = [...prev];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });
  }

  function removeLink(id: string) {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  }

  function addLink() {
    setLinks((prev) => [...prev, { id: newLinkId(), title: "", url: "", description: "" }]);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);
    startTransition(async () => {
      const result = await updateProfile({ name, bio, image, links });
      setStatus(
        result.ok
          ? { type: "success", message: "저장했어요!" }
          : { type: "error", message: result.error },
      );
    });
  }

  function handleLogout() {
    startTransition(async () => {
      await logout();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <section className={cardClass}>
        <h2 className="font-semibold">프로필</h2>

        <div className="mt-4 flex items-center gap-4">
          {/* data URL 미리보기라 next/image 최적화가 필요 없다 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt="프로필 사진 미리보기"
            className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-white/80 shadow-[0_10px_24px_-10px_rgba(14,116,144,0.55)] dark:ring-white/10"
          />
          <div className="flex flex-col gap-2">
            <label className="glass-input cursor-pointer py-1.5 text-center text-sm hover:border-sky-400">
              사진 올리기
              <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
            </label>
            {image !== DEFAULT_IMAGE && (
              <button
                type="button"
                onClick={() => setImage(DEFAULT_IMAGE)}
                className="text-xs text-slate-500 hover:text-red-500"
              >
                기본 이미지로
              </button>
            )}
          </div>
        </div>

        <label className="mt-4 block text-sm font-medium" htmlFor="name">
          이름
        </label>
        <input
          id="name"
          required
          maxLength={50}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 ${inputClass}`}
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="bio">
          소개글
        </label>
        <textarea
          id="bio"
          rows={3}
          maxLength={160}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={`mt-1 resize-none ${inputClass}`}
        />
        <p className="mt-1 text-right text-xs text-slate-400">{bio.length}/160</p>
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">링크</h2>
          <span className="text-xs text-slate-400">{links.length}개</span>
        </div>

        {links.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">아직 링크가 없어요. 아래에서 추가해 보세요.</p>
        )}

        <ul className="mt-4 flex flex-col gap-3">
          {links.map((link, index) => (
            <li
              key={link.id}
              className="flex flex-col gap-2 rounded-xl border border-white/60 bg-white/30 p-3 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <input
                required
                maxLength={60}
                placeholder="제목 (예: GitHub)"
                aria-label="링크 제목"
                value={link.title}
                onChange={(e) => updateLink(link.id, { title: e.target.value })}
                className={inputClass}
              />
              <input
                required
                type="url"
                placeholder="https://"
                aria-label="링크 주소"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                className={inputClass}
              />
              <input
                maxLength={100}
                placeholder="설명 (선택)"
                aria-label="링크 설명"
                value={link.description ?? ""}
                onChange={(e) => updateLink(link.id, { description: e.target.value })}
                className={inputClass}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => moveLink(index, -1)}
                  disabled={index === 0}
                  aria-label="위로 이동"
                  className={smallButtonClass}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveLink(index, 1)}
                  disabled={index === links.length - 1}
                  aria-label="아래로 이동"
                  className={smallButtonClass}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeLink(link.id)}
                  className={`${smallButtonClass} text-red-500 hover:border-red-500`}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={addLink}
          className="mt-3 w-full rounded-xl border border-dashed border-sky-300 py-2 text-sm text-sky-600 transition hover:bg-white/40 dark:border-sky-700 dark:text-sky-400 dark:hover:bg-white/5"
        >
          + 링크 추가
        </button>
      </section>

      {status && (
        <p
          role="status"
          className={`text-sm ${status.type === "success" ? "text-teal-600 dark:text-teal-400" : "text-red-500"}`}
        >
          {status.message}
        </p>
      )}

      <div className="sticky bottom-4 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary flex-1 py-3"
        >
          {pending ? "저장 중…" : "저장하기"}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          disabled={pending}
          className="glass rounded-xl px-4 py-3 text-sm"
        >
          로그아웃
        </button>
      </div>
    </form>
  );
}
