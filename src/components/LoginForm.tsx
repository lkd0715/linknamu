"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { login } from "@/app/settings/actions";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await login(password);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <label htmlFor="password" className="text-sm font-medium">
        관리자 비밀번호
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-xl border border-neutral-300 bg-transparent px-3 py-2 outline-none focus:border-green-500 dark:border-neutral-700"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
      >
        {pending ? "확인 중…" : "로그인"}
      </button>
    </form>
  );
}
