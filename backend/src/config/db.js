import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri && !mongoUri.includes('localhost') && !mongoUri.includes('127.0.0.1')) {
      // Direct Atlas or remote production connection
      console.log('Connecting to Remote/Atlas MongoDB...');
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }

    // Try local MongoDB first if URI provided
    if (mongoUri) {
      try {
        console.log(`Attempting connection to MongoDB at: ${mongoUri}`);
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 2000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (localErr) {
        console.warn(`Local MongoDB connection failed (${localErr.message}). Switching to in-memory database fallback...`);
      }
    }

    // Dynamic import for MongoMemoryServer in dev/test fallback
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServerInstance = await MongoMemoryServer.create();
    const uri = mongoMemoryServerInstance.getUri();
    console.log(`Starting in-memory MongoDB fallback instance at: ${uri}`);
    
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB (Memory-Server) Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServerInstance) {
      await mongoMemoryServerInstance.stop();
    }
    console.log('MongoDB Disconnected.');
  } catch (error) {
    console.error(`Error disconnecting MongoDB: ${error.message}`);
  }
};
