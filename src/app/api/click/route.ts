import { NextResponse } from "next/server";
import { getClickCounts } from "@/lib/clicks";
import { getClicksCollection } from "@/lib/mongodb";
import { getProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

// 링크 클릭 1회 기록. body: { linkId: string }
export async function POST(request: Request) {
  let linkId: unknown;
  try {
    ({ linkId } = await request.json());
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  // 링크는 설정 페이지에서 바뀔 수 있으므로 요청마다 현재 목록으로 검사한다.
  const { links } = await getProfile();
  if (typeof linkId !== "string" || !links.some((link) => link.id === linkId)) {
    return NextResponse.json({ error: "알 수 없는 링크" }, { status: 400 });
  }

  try {
    const clicks = await getClicksCollection();
    if (!clicks) {
      return NextResponse.json({ error: "DB 미설정" }, { status: 503 });
    }
    await clicks.updateOne({ _id: linkId }, { $inc: { count: 1 } }, { upsert: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("클릭 기록 실패:", error);
    return NextResponse.json({ error: "기록 실패" }, { status: 500 });
  }
}

// 링크별 클릭 수 조회
export async function GET() {
  const counts = await getClickCounts();
  if (!counts) {
    return NextResponse.json({ error: "DB 미설정 또는 연결 실패" }, { status: 503 });
  }
  return NextResponse.json(counts);
}
