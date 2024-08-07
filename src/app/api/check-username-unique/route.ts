import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/Schema/signUpSchema";
import { NextResponse } from "next/server";

// Define a schema for validating the query parameter using Zod
const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

// Define the GET request handler
export async function GET(request: Request) {
  try {

    // Connect to the database
    await dbConnect();

    // Extract the 'username' query parameter from the URL
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    // Validate the query parameter with Zod
    const result = UsernameQuerySchema.safeParse({ username });

    // Handle validation errors
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return NextResponse.json(
        {
          success: false,
          message: usernameErrors.length > 0 ? usernameErrors.join(',') : 'Invalid query parameters',
        },
        { status: 400 }
      );
    }

    // Extract the validated username
    const { username: validatedUsername } = result.data;

    // Check if a verified user with the same username already exists
    const existingVerifiedUser = await UserModel.findOne({ username: validatedUsername, isVerified: true });

    // If a verified user with the username exists, return an error
    if (existingVerifiedUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 }
      );
    }

    // If the username is available, return a success response
    return NextResponse.json(
      {
        success: true,
        message: 'Username is available',
      },
      { status: 200 }
    );
  } catch (error) {
    // Log any errors to the console and return a 500 error response
    console.error("Error checking username", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}
