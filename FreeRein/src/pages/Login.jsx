import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { login } from '@/api/auth';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { navigateToLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      toast.success('Welcome back!');
      window.location.href = '/';
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-slate-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-600">Please sign in to your account</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-3 rounded-xl font-semibold text-lg hover:from-slate-950 hover:to-slate-900 transition-all shadow-lg hover:shadow-xl"
          >
            Sign In
          </button>
        </form>
        <p className="text-center text-sm text-slate-600">
          Don't have an account? <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Register</Link>
        </p>
      </div>
    </div>
  );
}