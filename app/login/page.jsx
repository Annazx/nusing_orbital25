"use client";
// app/(auth)/login/page.jsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../config/firebase";
import Link from 'next/link';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // 'student' or 'tutor'
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Processing...");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in successfully!");
        router.push("/profile");
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: role,
          createdAt: new Date(),
        });
        toast.success("Account created! Please set up your profile.");
        router.push("/profile");
      }
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message.replace("Firebase: ", ""));
    }
  };

  // The JSX is now structured based on a common HeroUI authentication form template
  return (
    <section className="bg-base-200">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen lg:py-0">
        <div className="w-full bg-base-100 rounded-lg shadow-xl md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-base-content md:text-2xl">
              {isLogin ? "Sign in to your account" : "Create an account"}
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-base-content">Your email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="input input-bordered w-full"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-base-content">Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="input input-bordered w-full"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-base-content">I am joining as a</label>
                  <div className="join w-full">
                    <button type="button" onClick={() => setRole('student')} className={`join-item btn btn-outline w-1/2 ${role === 'student' ? 'btn-active' : ''}`}>
                      Student
                    </button>
                    <button type="button" onClick={() => setRole('tutor')} className={`join-item btn btn-outline w-1/2 ${role === 'tutor' ? 'btn-active' : ''}`}>
                      Tutor
                    </button>
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-end">
                  <Link href="/forgot-password" className="text-sm font-medium link link-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}
              
              <button type="submit" className="btn btn-primary w-full">
                {isLogin ? "Sign in" : "Create an account"}
              </button>
              
              <p className="text-sm font-light text-base-content/70">
                {isLogin ? "Don’t have an account yet? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium link link-primary hover:underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}