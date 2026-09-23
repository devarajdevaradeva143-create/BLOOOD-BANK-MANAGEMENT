import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB(uri = config.mongoUri) {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

export default connectDB;
