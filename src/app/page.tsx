import LinkList from "@/components/LinkList";
import ProfileHeader from "@/components/ProfileHeader";
import ThemeToggle from "@/components/ThemeToggle";
import { getProfile } from "@/lib/profile";

// 설정 페이지에서 바꾼 프로필을 매 요청마다 최신으로 보여준다.
// 클릭 수는 LinkList가 페이지를 연 뒤 따로 가져온다.
export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await getProfile();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-10 sm:py-16">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <ProfileHeader name={profile.name} bio={profile.bio} image={profile.image} />

      <LinkList links={profile.links} />

      <footer className="mt-auto pt-12 text-center text-xs text-slate-400">
        🌳 링크나무
      </footer>
    </main>
  );
}
