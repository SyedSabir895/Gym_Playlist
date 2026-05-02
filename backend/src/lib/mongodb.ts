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
  const mongoOptions: any = {
    // Let the driver infer TLS from the connection string (mongodb+srv or tls query).
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  }

  // If you must allow invalid/self-signed certs (not recommended for production),
  // set MONGODB_TLS_ALLOW_INVALID=true in Render environment variables.
  if (process.env.MONGODB_TLS_ALLOW_INVALID === "true") {
    mongoOptions.tlsAllowInvalidCertificates = true
  }

  client = new MongoClient(MONGODB_URI!, mongoOptions)
  try {
    await client.connect()
    db = client.db("gymvideos")
    console.log("Connected to MongoDB")
    return db
  } catch (err) {
    console.error("Failed to connect to MongoDB on startup:", err)
    throw err
  }
}

export async function getDB(): Promise<Db> {
  if (!db) return connectDB();
  return db;
}

export { ObjectId };
