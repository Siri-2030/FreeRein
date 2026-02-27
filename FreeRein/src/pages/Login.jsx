import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { navigateToLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // redirect to authentication provider
    navigateToLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-600">Please enter your details</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-800 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-800 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full rounded-md bg-slate-900 py-2 text-white hover:bg-slate-800 transition">
            Sign In
          </button>
        </form>
        <p className="text-center text-sm text-slate-600">
          Don't have an account? <Link to="/register" className="font-medium text-slate-900 underline">Register</Link>
        </p>
      </div>
    </div>
  );
}