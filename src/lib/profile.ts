import { profile as defaultProfile, type Profile } from "@/data/profile";
import { getDb } from "@/lib/mongodb";

type ProfileDoc = Profile & { _id: string };

// 프로필은 문서 하나로 저장한다.
const PROFILE_ID = "main";

async function getProfileCollection() {
  const db = await getDb();
  return db?.collection<ProfileDoc>("profile") ?? null;
}

// 설정 페이지에서 저장한 프로필. 저장된 적이 없거나 DB를 쓸 수 없으면 기본 프로필.
export async function getProfile(): Promise<Profile> {
  try {
    const profiles = await getProfileCollection();
    const doc = await profiles?.findOne({ _id: PROFILE_ID });
    if (doc) {
      return { name: doc.name, bio: doc.bio, image: doc.image, links: doc.links };
    }
  } catch (error) {
    console.error("프로필 조회 실패:", error);
  }
  return defaultProfile;
}

// DB가 설정되지 않았으면 false.
export async function saveProfile(profile: Profile): Promise<boolean> {
  const profiles = await getProfileCollection();
  if (!profiles) return false;
  await profiles.replaceOne({ _id: PROFILE_ID }, profile, { upsert: true });
  return true;
}
