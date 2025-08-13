"use client";
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword, // To register new users
  signInWithEmailAndPassword, // To sign in existing users
  onAuthStateChanged, // To observe the user's login state
  signOut, // To sign users out
} from "firebase/auth";

import { auth } from "../config/firebase"; 

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update the user state
      if (currentUser) {
        setMessage(`Logged in as: ${currentUser.email}`);
      } else {
        setMessage("Not logged in.");
      }
    });

    return () => unsubscribe();
  }, []); 

  const handleSignUp = async () => {
    try {
      setMessage("Signing up...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      setMessage(`Successfully signed up: ${userCredential.user.email}`);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Sign-up error:", error.message);
      setMessage(`Sign-up error: ${error.message}`);
    }
  };

  const handleSignIn = async () => {
    try {
      setMessage("Signing in...");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      setMessage(`Successfully signed in: ${userCredential.user.email}`);
      setEmail("");
      setPassword("");
    } catch (error: any) {
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

      {!user ? (
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
