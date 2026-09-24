import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "linknamu";

// 개발 모드의 HMR로 모듈이 다시 로드돼도 연결을 재사용하도록 전역에 캐시한다.
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

function getClient(): Promise<MongoClient> | null {
  if (!uri) return null;
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(uri).connect();
  }
  return globalForMongo._mongoClientPromise;
}

// MONGODB_URI가 없으면 null을 돌려준다. 호출하는 쪽은 DB 없이 동작해야 한다.
export async function getDb() {
  const client = getClient();
  if (!client) return null;
  return (await client).db(dbName);
}

type ClickDoc = { _id: string; count: number };

export async function getClicksCollection() {
  const db = await getDb();
  return db?.collection<ClickDoc>("clicks") ?? null;
}
