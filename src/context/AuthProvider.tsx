'use client'; // Ensure this file is rendered on the client side

import { SessionProvider } from "next-auth/react";
import React from 'react';

interface AuthProvider {
  children: React.ReactNode; // Define the type for children
}

export default function ApAuthProvider({ children }: AuthProvider) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
