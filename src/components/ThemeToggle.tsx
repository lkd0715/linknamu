"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  // 서버 렌더링 시점에는 테마를 알 수 없으므로 마운트 후에 읽는다.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "밝은 화면으로 전환" : "어두운 화면으로 전환"}
      className="glass rounded-full p-2 text-lg transition hover:scale-105"
    >
      <span aria-hidden>{theme === null ? "　" : theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
}
