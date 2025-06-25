// components/AuthForm.tsx (or whatever you call your login/signup component)
"use client";
import React, { useState } from "react";
// Import the specific authentication functions you need
import {
  createUserWithEmailAndPassword, // To register new users
  signInWithEmailAndPassword, // To sign in existing users
  onAuthStateChanged, // To observe the user's login state
  signOut, // To sign users out
} from "firebase/auth";

// Import the 'auth' instance you initialized and exported from config/firebase.ts
import { auth } from "../config/firebase"; // Adjust path if needed

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null); // To store the current user object

  // This hook observes the user's authentication state
  // It runs once when the component mounts, and again whenever the user's
  // login status changes (sign-in, sign-out, token refresh, etc.)
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update the user state
      if (currentUser) {
        setMessage(`Logged in as: ${currentUser.email}`);
      } else {
        setMessage("Not logged in.");
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleSignUp = async () => {
    try {
      setMessage("Signing up...");
      // Use createUserWithEmailAndPassword with your 'auth' instance
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      // userCredential.user contains information about the newly created user
      setMessage(`Successfully signed up: ${userCredential.user.email}`);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      // Handle errors (e.g., weak password, email already in use)
      console.error("Sign-up error:", error.message);
      setMessage(`Sign-up error: ${error.message}`);
    }
  };

  const handleSignIn = async () => {
    try {
      setMessage("Signing in...");
      // Use signInWithEmailAndPassword with your 'auth' instance
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      setMessage(`Successfully signed in: ${userCredential.user.email}`);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      // Handle errors (e.g., user not found, wrong password)
      console.error("Sign-in error:", error.message);
      setMessage(`Sign-in error: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      setMessage("Signing out...");
      await signOut(auth); // Sign out the current user
      setMessage("Successfully signed out.");
    } catch (error: any) {
      console.error("Sign-out error:", error.message);
      setMessage(`Sign-out error: ${error.message}`);
    }
  };

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}
    >
      <h2>Firebase Email/Password Authentication for NUSing My Brain</h2>

      {!user ? ( // Show login/signup form if no user is logged in
        <>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div style={{ marginTop: "10px" }}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <button onClick={handleSignUp} style={{ marginRight: "10px" }}>
              Sign Up
            </button>
            <button onClick={handleSignIn}>Sign In</button>
          </div>
        </>
      ) : (
        // Show user info and sign-out button if user is logged in
        <div>
          <h3>Hello, {user.email}!</h3>
          <p>Your User ID (UID): {user.uid}</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      )}

      {message && (
        <p
          style={{
            marginTop: "20px",
            color: message.includes("error") ? "red" : "green",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default AuthForm;
