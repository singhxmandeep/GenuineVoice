'use client'; // Ensure this component is rendered on the client side

import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
  // Get session data
  const { data: session } = useSession();

  // Check if the user is signed in
  if (session) {
    return (
      <div>
        {/* Display the signed-in user's email */}
        Signed in as {session.user.email} <br />
        {/* Button to sign out */}
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  // If the user is not signed in
  return (
    <div>
      Not signed in <br />
      {/* Button to sign in */}
      <button className="bg-orange-500 px-3 py-1 m-4 rounded" onClick={() => signIn()}>Sign in</button>
    </div>
  );
}
