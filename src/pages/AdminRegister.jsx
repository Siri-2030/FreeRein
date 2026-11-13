import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, Shield } from 'lucide-react'
import { toast } from 'react-hot-toast'

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'ADMIN'
  })

  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const { register, registerLoading } = useAuth()
  const navigate = useNavigate()

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
        userType: formData.userType.toUpperCase()

      })
      toast.success('Admin account created successfully!')
      navigate('/login')
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Contact super admin for ADMIN access.'
      toast.error(message)
      console.error('Admin Register Error:', error.response?.data)
    }
  }

  useEffect(() => {
    setPasswordsMatch(formData.password === formData.confirmPassword)
  }, [formData.password, formData.confirmPassword])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-20 w-20 bg-orange-100 rounded-2xl flex items-center justify-center">
            <Shield className="h-10 w-10 text-orange-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Admin Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Request admin access for FreeRein platform
          </p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-orange-200" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Admin Name"
                />
              </div>
            </div>

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
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="admin@freerein.com"
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
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={registerLoading}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Strong password (min 8 chars)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  disabled={registerLoading}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                    passwordsMatch 
                      ? 'border border-gray-200' 
                      : 'border-red-300 focus:ring-red-500 bg-red-50'
                  }`}
                  placeholder="Confirm password"
                />
              </div>
              {!passwordsMatch && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <Lock className="h-4 w-4" /> Passwords do not match
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-500 bg-orange-50 p-3 rounded-xl border border-orange-200">
                <Shield className="inline w-4 h-4 text-orange-600 mr-1" />
                Admin accounts require backend approval. Use only if authorized.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={registerLoading}
            className="bg-orange-600 hover:bg-orange-700 w-full py-3 font-medium text-lg text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            {registerLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Admin...
              </>
            ) : (
              'Request Admin Access'
            )}
          </button>

          <div className="text-center space-y-2">
            <Link to="/register" className="text-orange-600 hover:text-orange-700 font-medium block">
              ← Regular Registration
            </Link>
            <Link to="/login" className="text-gray-600 hover:text-gray-800 font-medium">
              Have account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminRegister

