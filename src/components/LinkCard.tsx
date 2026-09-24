"use client";

import type { LinkItem } from "@/data/profile";

type Props = {
  link: LinkItem;
  clickCount?: number;
};

function recordClick(linkId: string) {
  const body = JSON.stringify({ linkId });
  // sendBeacon은 페이지를 떠나는 중에도 전송이 보장된다.
  const sent =
    typeof navigator.sendBeacon === "function" &&
    navigator.sendBeacon("/api/click", new Blob([body], { type: "application/json" }));
  if (!sent) {
    fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

export default function LinkCard({ link, clickCount }: Props) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => recordClick(link.id)}
      className="glass group flex items-center justify-between gap-4 rounded-2xl px-5 py-4 transition duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-[0_12px_36px_-12px_rgba(14,165,233,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 dark:hover:bg-white/10"
    >
      <div className="min-w-0">
        <p className="truncate font-semibold">{link.title}</p>
        {link.description && (
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
            {link.description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm text-slate-400">
        {clickCount !== undefined && (
          <span aria-label={`클릭 ${clickCount}회`}>{clickCount.toLocaleString()}회</span>
        )}
        <span aria-hidden className="transition group-hover:translate-x-0.5 group-hover:text-sky-500">
          →
        </span>
      </div>
    </a>
  );
}
