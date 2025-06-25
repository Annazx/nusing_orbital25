'use client';
// app/(auth)/login/page.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'tutor'
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Processing...');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully!');
        router.push('/profile');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: role,
          createdAt: new Date(),
        });
        toast.success('Account created! Please set up your profile.');
        router.push('/profile'); // Redirect to profile setup
      }
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <form className="card-body" onSubmit={handleSubmit}>
          <h2 className="card-title text-center text-2xl">{isLogin ? 'Login' : 'Sign Up'}</h2>
          
          <div className="form-control">
            <label className="label"><span className="label-text">Email</span></label>
            <input type="email" placeholder="email@u.nus.edu" className="input input-bordered" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Password</span></label>
            <input type="password" placeholder="password" className="input input-bordered" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {!isLogin && (
            <div className="form-control mt-4">
              <label className="label cursor-pointer">
                <span className="label-text">I want to be a Student</span> 
                <input type="radio" name="role" className="radio checked:bg-blue-500" value="student" checked={role === 'student'} onChange={() => setRole('student')} />
              </label>
              <label className="label cursor-pointer">
                <span className="label-text">I want to be a Tutor</span> 
                <input type="radio" name="role" className="radio checked:bg-green-500" value="tutor" checked={role === 'tutor'} onChange={() => setRole('tutor')} />
              </label>
            </div>
          )}

          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary">{isLogin ? 'Login' : 'Sign Up'}</button>
          </div>
          <p className="text-center mt-4">
            <a href="#" className="link link-hover" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}