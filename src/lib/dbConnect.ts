import mongoose from "mongoose";

// Define a global connection state
let isConnected: boolean = false;

async function dbConnect(): Promise<void> {
    if (isConnected) {
        console.log("Already connected to database");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI as string || '', {});

        // Update the connection state
        isConnected = db.connection.readyState === 1;

        if (isConnected) {
            console.log("DB Connected Successfully");
        } else {
            console.error("DB Connection Failed");
        }

    } catch (error) {
        console.error("Error connecting to database:", error);
        process.exit(1); // Exit the process with failure code
    }
}

export default dbConnect;
