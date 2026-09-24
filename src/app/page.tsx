import LinkCard from "@/components/LinkCard";
import ProfileHeader from "@/components/ProfileHeader";
import ThemeToggle from "@/components/ThemeToggle";
import { profile } from "@/data/profile";
import { getClickCounts } from "@/lib/clicks";

// 클릭 수를 매 요청마다 최신으로 보여준다.
export const dynamic = "force-dynamic";

export default async function Home() {
  const counts = await getClickCounts();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-10 sm:py-16">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <ProfileHeader name={profile.name} bio={profile.bio} image={profile.image} />

      <ul className="mt-8 flex flex-col gap-3">
        {profile.links.map((link) => (
          <li key={link.id}>
            <LinkCard link={link} clickCount={counts ? (counts[link.id] ?? 0) : undefined} />
          </li>
        ))}
      </ul>

      <footer className="mt-auto pt-12 text-center text-xs text-neutral-400">
        🌳 링크나무
      </footer>
    </main>
  );
}
