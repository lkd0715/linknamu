import { getClicksCollection } from "@/lib/mongodb";

// 링크 id별 클릭 수. DB가 설정되지 않았거나 연결에 실패하면 null.
export async function getClickCounts(): Promise<Record<string, number> | null> {
  try {
    const clicks = await getClicksCollection();
    if (!clicks) return null;
    const docs = await clicks.find().toArray();
    return Object.fromEntries(docs.map((d) => [d._id, d.count]));
  } catch (error) {
    console.error("클릭 수 조회 실패:", error);
    return null;
  }
}
