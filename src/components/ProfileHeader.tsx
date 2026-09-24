import Image from "next/image";

type Props = {
  name: string;
  bio: string;
  image: string;
};

export default function ProfileHeader({ name, bio, image }: Props) {
  return (
    <header className="flex flex-col items-center text-center">
      {/* 그라데이션 테두리 + 아래로 떨어지는 그림자로 살짝 떠 있는 느낌을 준다 */}
      <div className="rounded-full bg-gradient-to-br from-sky-300 via-cyan-200 to-teal-300 p-1 shadow-[0_14px_30px_-10px_rgba(14,116,144,0.55)] dark:from-sky-500 dark:via-cyan-600 dark:to-teal-500">
        <div className="relative rounded-full bg-white p-1 dark:bg-slate-900">
          <Image
            src={image}
            alt={`${name} 프로필 사진`}
            width={104}
            height={104}
            priority
            unoptimized={image.endsWith(".svg") || image.startsWith("data:")}
            className="h-[104px] w-[104px] rounded-full object-cover"
          />
          {/* 위쪽 하이라이트 */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-1 rounded-full bg-gradient-to-b from-white/35 via-transparent to-black/10"
          />
        </div>
      </div>
      <h1 className="mt-5 text-2xl font-bold tracking-tight">{name}</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-300">{bio}</p>
    </header>
  );
}
