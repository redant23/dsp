import mongoose from 'mongoose';
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI가 설정되지 않았습니다.');
}

const uri = process.env.MONGODB_URI;

// Mongoose 연결 (모델용)
export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState >= 1) return;
    
    await mongoose.connect(uri);
    console.log('MongoDB 연결 성공');
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    throw error;
  }
}

// MongoDB Native 클라이언트 (Next-Auth용)
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise; 