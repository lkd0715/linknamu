import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import SettingsForm from "@/components/SettingsForm";
import ThemeToggle from "@/components/ThemeToggle";
import { isAdmin, isAdminConfigured } from "@/lib/auth";
import { getProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "설정 | 링크나무",
  robots: { index: false },
};

export default async function SettingsPage() {
  const profile = isAdmin() ? await getProfile() : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-10 sm:py-16">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500 hover:text-sky-600 dark:text-slate-400">
          ← 내 페이지
        </Link>
        <ThemeToggle />
      </div>

      <h1 className="mt-6 text-2xl font-bold">설정</h1>

      {!isAdminConfigured() ? (
        <p className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          관리자 비밀번호가 설정되지 않았어요. 환경 변수 <code>ADMIN_PASSWORD</code>를 설정한 뒤
          서버를 다시 시작해 주세요.
        </p>
      ) : profile ? (
        <SettingsForm initialProfile={profile} />
      ) : (
        <LoginForm />
      )}
    </main>
  );
}
