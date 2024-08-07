import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Connect to the database
  await dbConnect();

  try {
    // Parse the request body to get username and content
    const { username, content } = await request.json();

    // Find the user by username
    const user = await UserModel.findOne({ username });

    // If user is not found, return a 404 response
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if the user is accepting messages
    if (!user.isAcceptingMessage) {
      return NextResponse.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        { status: 403 }
      );
    }

    // Create a new message object
    const newMessage = { content, createdAt: new Date() };

    // Add the new message to the user's messages array
    user.messages.push(newMessage as Message);

    // Save the updated user document
    await user.save();

    // Return a success response
    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    // Log the error and return a 500 response
    console.error("Failed to send message", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message",
      },
      { status: 500 }
    );
  }
}
