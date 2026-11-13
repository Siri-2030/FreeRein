import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext' 
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { toast } from 'react-hot-toast'

const Login = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  })
  const { login, loginLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/Dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await login({
        email: formData.email.trim(),
        password: formData.password
      })
      toast.success('Login successful!')
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Incorrect email or password'
        : (error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Cannot reach the server. Please try again.' : 'Login failed'))
      toast.error(message)
      console.error('Login Error:', error.response?.data)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-20 w-20 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <Mail className="h-10 w-10 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to FreeRein
          </h2>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={loginLoading}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={loginLoading}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors w-full py-3 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loginLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center space-y-2">
            <Link to="/" className="block text-sm text-gray-500 hover:text-gray-700">&larr; Back to home</Link>
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Create new account
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login