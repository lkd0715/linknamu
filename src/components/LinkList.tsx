"use client";

import { useEffect, useState } from "react";
import LinkCard from "@/components/LinkCard";
import type { LinkItem } from "@/data/profile";

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

export default function LinkList({ links }: { links: LinkItem[] }) {
  // 받아오기 전에는 모든 링크가 0회로 보인다.
  const [counts, setCounts] = useState<Record<string, number>>({});

  // 페이지가 열릴 때 모든 링크의 클릭 수를 한 번에 가져온다.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/click", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Record<string, number> | null) => {
        if (!cancelled && data) {
          // 받아오는 사이에 누른 클릭이 사라지지 않도록 더한다.
          setCounts((prev) => {
            const next = { ...data };
            for (const [id, n] of Object.entries(prev)) next[id] = (next[id] ?? 0) + n;
            return next;
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function handleClick(linkId: string) {
    recordClick(linkId);
    setCounts((prev) => ({ ...prev, [linkId]: (prev[linkId] ?? 0) + 1 }));
  }

  return (
    <ul className="mt-8 flex flex-col gap-3">
      {links.map((link) => (
        <li key={link.id}>
          <LinkCard link={link} clickCount={counts[link.id] ?? 0} onClick={() => handleClick(link.id)} />
        </li>
      ))}
    </ul>
  );
}
