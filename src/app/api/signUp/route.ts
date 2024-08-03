import dbConnect from "@/lib/dbConnect"; // Import the function to connect to the database
import UserModel from "@/model/User"; // Import the User model for MongoDB operations
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import { sendVerificationEmail } from "@/helpers/sentVerificationEmail";// Import the function to send verification emails

// Export the POST function to handle incoming HTTP POST requests
export async function POST(request: Request) {
  await dbConnect(); // Connect to the database

  try {
    const { username, email, password } = await request.json(); // Extract username, email, and password from the request body

    // Check if a verified user with the given username already exists
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      // If a verified user with the given username exists, return an error response
      return Response.json({
        success: false,
        message: "Username is already taken"
      }, { status: 400 });
    }

    // Check if a user with the given email already exists
    const existingUserByEmail = await UserModel.findOne({ email });

    // Generate a verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      // If the email is already registered and verified, return an error response
      if (existingUserByEmail.isVerified) {
        return Response.json({
          success: false,
          message: "Email is already registered"
        }, { status: 400 });
      } else {
        // If the email is registered but not verified, update the user with new password and verification code
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        existingUserByEmail.password = hashedPassword; // Update password
        existingUserByEmail.verifyCode = verifyCode; // Update verification code
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // Set verification code expiry to 1 hour from now
        await existingUserByEmail.save(); // Save the updated user
      }
    } else {
      // If the email is not registered, create a new user
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
      const expiryDate = new Date(); // Create an expiry date for the verification code
      expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry time to 1 hour from now

      // Create a new user instance with the provided details
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });

      await newUser.save(); // Save the new user to the database
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    // If sending the email fails, return an error response
    if (!emailResponse.success) {
      return Response.json({
        success: false,
        message: emailResponse.message
      }, { status: 500 });
    }

    // If everything succeeds, return a success response
    return Response.json({
      success: true,
      message: "User Registered Successfully, Please Verify Your Email"
    }, { status: 201 });

  } catch (error) {
    console.error("Error registering user", error); // Log any errors that occur during the process
    // Return a generic error response
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
