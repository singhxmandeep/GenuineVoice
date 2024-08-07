import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  // Connect to the database
  await dbConnect();

  // Retrieve the session from the request
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  // Check if the user is authenticated
  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }

  // Create an ObjectId instance from the user's ID
  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    // Aggregate the user's messages
    const messages = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } }
    ]);

    // Check if messages were found
    if (messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No messages found for the user",
        },
        { status: 404 }
      );
    }

    // Return a success response with the user's messages
    return NextResponse.json(
      {
        success: true,
        messages: messages[0].messages,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log any errors and return a 500 error response
    console.error("Failed to retrieve user's messages", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve user's messages",
      },
      { status: 500 }
    );
  }
}
