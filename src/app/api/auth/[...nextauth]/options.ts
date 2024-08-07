import { NextAuthOptions } from "next-auth"; // Import the NextAuthOptions type from next-auth
import CredentialsProvider from "next-auth/providers/credentials"; // Import the CredentialsProvider for authentication using credentials


import bcrypt from "bcryptjs"; // Import bcrypt for password hashing and comparison
import dbConnect from "@/lib/dbConnect"; // Import the function to connect to the database
import UserModel from "@/model/User"; // Import the User model for MongoDB operations

export const authOptions: NextAuthOptions = {
    providers: [
      // Define a credentials provider for authentication using email and password
      CredentialsProvider({
        id: "credentials", // Unique ID for the credentials provider
        name: "Credentials", // Display name for the provider
        credentials: {
          email: { label: "Email", type: "text" }, // Define the email field for the credentials
          password: { label: "Password", type: "password" } // Define the password field for the credentials
        },
        // The authorize function to validate user credentials
        async authorize(credentials: any): Promise<any> {
          await dbConnect(); // Ensure the database connection is established
  
          try {
            // Find a user by email or username in the database
            const user = await UserModel.findOne({
              $or: [
                { email: credentials.email }, // Check by email
                { username: credentials.username } // Check by username
              ]
            });
  
            if (!user) {
              // If no user is found, throw an error
              throw new Error("No user found with this email or username");
            }
  
            if (!user.isVerified) {
              // If the user is not verified, throw an error
              throw new Error("Please verify your account first before login");
            }
  
            // Compare the provided password with the hashed password in the database
            const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
  
            if (isPasswordCorrect) {
              // If the password is correct, return the user object
              return user;
            } else {
              // If the password is incorrect, throw an error
              throw new Error("Incorrect Password");
            }
          } catch (error: any) {
            // If any error occurs, throw it
            throw new Error(error.message || "Authentication error");
          }
        }
      }),
    ],
    callbacks: {
      // Callback for handling the JSON Web Token (JWT)
      async jwt({ token, user }) {
        if (user) {
          token._id = user._id?.toString();
          token.isVerified = user.isVerified;
          token.isAccectingMessages = user.isAcceptingMessages;
          token.username = user.username;
        }
        return token; // Return the token
      },
      // Callback for handling the session
      async session({ session, token }) {
        if (token) {
            session.user._id = token._id;
            session.user.isVerified = token.isVerified;
            session.user.isAcceptingMessages = token.isAcceptingMessages;
            session.user.username = token.username;
        }
        return session; // Return the session
      },
    },
    pages: {
      signIn: '/signin', // Custom sign-in page route
    },
    session: {
      strategy: "jwt", // Use JWT strategy for sessions
    },
    secret: process.env.NEXTAUTH_SECRET, // Secret key for signing the JWT
  };
  