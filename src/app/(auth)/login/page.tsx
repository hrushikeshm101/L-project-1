'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Authenticate with Firebase Auth (secure password handling)
      await login(email, password);

      // Step 2: Verify user profile exists in Firestore
      const user = await import('firebase/auth').then(mod => mod.getAuth().currentUser);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
          // Profile missing - this shouldn't happen with our AuthProvider, but handle gracefully
          console.warn('User profile not found in Firestore, creating...');
          // Optionally re-sync profile here if needed
        }
      }

      // Success - redirect
      router.push('/');
      router.refresh();

    } catch (err: any) {
      // Map Firebase error codes to user-friendly messages
      console.error('Auth error:', err);
      switch (err?.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Invalid email or password');
          break;
        case 'auth/email-already-in-use':
          setError('This email is already registered');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address');
          break;
        case 'auth/weak-password':
          setError('Password must be at least 6 characters');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection.');
          break;
        default:
          setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(80vh-4rem)] flex items-center justify-center  p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Sign in to continue shopping</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 outline-none transition disabled:bg-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="m@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              disabled={loading}
              className="w-full px-4 py-2.5 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 outline-none transition disabled:bg-gray-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-neutral-600 text-white py-2.5 rounded-lg font-medium hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-neutral-600 hover:text-neutral-800 font-medium hover:underline transition">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}