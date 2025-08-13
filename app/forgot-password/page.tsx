"use client";

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/config/firebase'; 
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Sending reset link...");

    try {
      await sendPasswordResetEmail(auth, email);
      toast.dismiss(loadingToast);
      toast.success(
        'If an account exists for this email, a reset link has been sent.',
        { duration: 5000 } // Show message for longer
      );
      setEmail(''); 
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("Password reset error:", error);
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <form className="card-body" onSubmit={handleSubmit}>
          <h2 className="card-title text-center text-2xl">
            Reset Password
          </h2>
          <p className="text-center text-sm text-gray-500 mb-4">
            Enter your email to receive a reset link.
          </p>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="email@u.nus.edu"
              className="input input-bordered"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
          <p className="text-center mt-4">
            <Link href="/login" className="link link-hover">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}