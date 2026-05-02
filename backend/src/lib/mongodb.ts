import { MongoClient, Db, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is required. Copy .env.example to .env and fill in your MongoDB URI."
  );
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(MONGODB_URI!, {
    tls: true,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
  await client.connect();
  db = client.db("gymvideos");
  console.log("Connected to MongoDB");
  return db;
}

export async function getDB(): Promise<Db> {
  if (!db) return connectDB();
  return db;
}

export { ObjectId };
