import { NextResponse } from "next/server";
import { profile } from "@/data/profile";
import { getClickCounts } from "@/lib/clicks";
import { getClicksCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const validIds = new Set(profile.links.map((link) => link.id));

// 링크 클릭 1회 기록. body: { linkId: string }
export async function POST(request: Request) {
  let linkId: unknown;
  try {
    ({ linkId } = await request.json());
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  if (typeof linkId !== "string" || !validIds.has(linkId)) {
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
