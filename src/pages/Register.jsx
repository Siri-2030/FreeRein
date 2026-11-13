import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { User, Mail, Lock, ShieldCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'VICTIM'
  })
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const { register, registerLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/Dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match. Please try again.')
      return
    }
    
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        userType: formData.role.toUpperCase()  // ✅ userType (matches DTO)
      })
      toast.success('Account created successfully!')
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const message = (error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Cannot reach the server. Please try again.' : 'Registration failed')).replace('Registration failed: ', '')
      toast.error(message)
      console.error('Register Error:', error.response?.data)
    }
  }

  // Real-time password match validation
  useEffect(() => {
    setPasswordsMatch(formData.password === formData.confirmPassword)
  }, [formData.password, formData.confirmPassword])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-20 w-20 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join FreeRein support network
          </p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={registerLoading}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
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
                  disabled={registerLoading}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={registerLoading}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  disabled={registerLoading}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                    passwordsMatch 
                      ? 'border border-gray-200 focus:ring-indigo-500' 
                      : 'border-red-300 focus:ring-red-500 bg-red-50'
                  }`}
                  placeholder="Confirm your password"
                />
              </div>
              {!passwordsMatch && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <Lock className="h-4 w-4" /> Passwords do not match
                </p>
              )}
            </div>

            {/* userType Dropdown - BACKEND REQUIRES THIS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                disabled={registerLoading}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`, 
                  backgroundPosition: 'right 0.5rem center', 
                  backgroundRepeat: 'no-repeat', 
                  backgroundSize: '1.5em 1.5em' 
                }}
              >
                <option value="VICTIM">Victim/Survivor</option>
                <option value="COUNSELLOR">Counsellor</option>
                <option value="LEGAL_ADVISOR">Legal Advisor</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={registerLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors w-full py-3 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {registerLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center space-y-2">
            <Link to="/" className="block text-sm text-gray-500 hover:text-gray-700">&larr; Back to home</Link>
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
