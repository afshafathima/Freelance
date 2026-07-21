import mongoose from "mongoose";

const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error("MONGO_URI is missing from .env file");
    }

    const opts = {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 30000,
    };

    let lastErr;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            console.log(`🔌 MongoDB connect attempt ${attempt}/3...`);
            await mongoose.connect(uri, opts);
            console.log("✅ MongoDB Connected Successfully");
            return;
        } catch (err) {
            lastErr = err;
            console.error(`❌ Attempt ${attempt} failed: ${err.message}`);
            if (attempt < 3) {
                console.log("   Retrying in 3 seconds...");
                await new Promise(r => setTimeout(r, 3000));
            }
        }
    }

    console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌  MONGODB CONNECTION FAILED AFTER 3 ATTEMPTS");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("Most likely cause: Your IP is not whitelisted in MongoDB Atlas.");
    console.error("\nFix steps:");
    console.error("  1. Go to https://cloud.mongodb.com");
    console.error("  2. Click your cluster → Network Access");
    console.error('  3. Click "ADD IP ADDRESS" → "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)');
    console.error("  4. Save and wait 30 seconds, then restart the server.");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    throw lastErr;
};

export default connectDB;