import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '@/api/auth';
import { toast } from 'sonner';


const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await register(formData);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-slate-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign Up for FreeRein</h2>
          <p className="mt-2 text-sm text-slate-600">Create your account to get started</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Enter your full name" 
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                value={formData.name}
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" 
                name="email" 
                placeholder="your@email.com" 
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                value={formData.email}
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="Create a password" 
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                value={formData.password}
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl"
          >
            Create Account
          </button>
        </form>
        <p className="text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;