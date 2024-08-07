import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { User } from "next-auth";

// POST request handler for updating user's message acceptance status
export async function POST(request: Request) {
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

  // Extract userId and acceptMessages status from the request body
  const userId = user._id;
  const { acceptMessages } = await request.json();

  try {
    // Update the user's message acceptance status in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true } // Return the updated user document
    );

    // If the user was not found or the update failed, return an error response
    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update user status to accept messages",
        },
        { status: 404 } // Updated status code for resource not found
      );
    }

    // If the update was successful, return a success response with the updated user
    return NextResponse.json(
      {
        success: true,
        message: "Messages acceptance status updated successfully",
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log any errors and return a 500 error response
    console.error("Failed to update user status to accept messages", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user status to accept messages",
      },
      { status: 500 }
    );
  }
}

// GET request handler for retrieving user's message acceptance status
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

  // Extract userId from the session
  const userId = user._id;

  try {
    // Retrieve the user's message acceptance status from the database
    const foundUser = await UserModel.findById(userId).select("isAcceptingMessage");

    // If the user was not found, return an error response
    if (!foundUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Return a success response with the user's message acceptance status
    return NextResponse.json(
      {
        success: true,
        isAcceptingMessage: foundUser.isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log any errors and return a 500 error response
    console.error("Failed to retrieve user's message acceptance status", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve user's message acceptance status",
      },
      { status: 500 }
    );
  }
}
