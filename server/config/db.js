const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/green_grocery';
    const conn = await mongoose.connect(uri, {
      autoIndex: true
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}:${conn.connection.port} [DB: ${conn.connection.name}]`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Error closing MongoDB:', err);
  }
};

/**
 * Execute operations within a transaction if replica set supports it,
 * otherwise execute sequentially with atomic document operations.
 */
const runInTransaction = async (callback) => {
  let session = null;
  const isReplicaSet = !!(
    mongoose.connection?.client?.topology?.description?.type === 'ReplicaSetWithPrimary' ||
    mongoose.connection?.client?.topology?.description?.servers?.size > 1
  );

  try {
    if (isReplicaSet) {
      session = await mongoose.startSession();
      session.startTransaction();
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } else {
      return await callback(null);
    }
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  runInTransaction
};
