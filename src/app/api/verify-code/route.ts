import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";

// POST request handler for verifying user accounts
export async function POST(request: Request) {
  // Connect to the database
  await dbConnect();

  try {
    // Parse the JSON body of the request to get username and code
    const { username, code } = await request.json();

    // Decode the username to handle special characters
    const decodedUsername = decodeURIComponent(username);

    // Find the user in the database with the decoded username
    const user = await UserModel.findOne({ username: decodedUsername });

    // If the user is not found, return an error response
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 500 }
      );
    }

    // Check if the provided verification code is valid and not expired
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    // If the code is valid and not expired, verify the user account
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return NextResponse.json(
        {
          success: true,
          message: "Account verified successfully",
        },
        { status: 200 }
      );
    } 
    // If the code has expired, return an error response
    else if (!isCodeNotExpired) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code has expired, please signup again to get a new code",
        },
        { status: 400 }
      );
    } 
    // If the code is incorrect, return an error response
    else {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect Verification code",
        },
        { status: 500 }
      );
    }

  } catch (error) {
    // Log any errors to the console and return a 500 error response
    console.error("Error Verifying username", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error Verifying username",
      },
      { status: 500 }
    );
  }
}
