import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster as HotToaster } from 'react-hot-toast'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import PageNotFound from './lib/PageNotFound'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import Login from '@/pages/Login'
import Register from '@/pages/Register'

const { Pages, Layout } = pagesConfig

/**
 * Which roles may open which page (the backend enforces this too - this just keeps
 * people from landing on screens that would only show errors).
 */
const PAGE_ROLES = {
  Admin: ['admin'],
  Cases: ['counsellor', 'legal_advisor', 'admin'],
  CaseDetail: ['victim', 'counsellor', 'legal_advisor', 'admin'],
  GetHelp: ['victim'],
  EvidenceVault: ['victim'],
}

const LayoutWrapper = ({ children, currentPageName }) =>
  Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
)

/** Pages that need a logged-in user. Visitors are sent to /login and come back afterwards. */
const Protected = ({ pageName, children }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  const allowed = PAGE_ROLES[pageName]
  if (allowed && !allowed.includes(user.user_type)) {
    return <Navigate to="/Dashboard" replace />
  }
  return <LayoutWrapper currentPageName={pageName}>{children}</LayoutWrapper>
}

const AppRoutes = () => {
  const { user, isLoadingAuth } = useAuth()
  const Landing = Pages.Landing

  if (isLoadingAuth) return <Spinner />

  return (
    <Routes>
      {/* PUBLIC: the landing page is the front door for everybody */}
      <Route path="/" element={<LayoutWrapper currentPageName="Landing"><Landing /></LayoutWrapper>} />
      <Route path="/Landing" element={<Navigate to="/" replace />} />

      {/* PUBLIC: login / register (logged-in users are sent to their dashboard) */}
      <Route path="/login" element={user ? <Navigate to="/Dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/Dashboard" replace /> : <Register />} />

      {/* PROTECTED: every other page from pages.config */}
      {Object.entries(Pages)
        .filter(([name]) => name !== 'Landing')
        .map(([name, Page]) => (
          <Route
            key={name}
            path={`/${name}`}
            element={<Protected pageName={name}><Page /></Protected>}
          />
        ))}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <NavigationTracker />
          <AppRoutes />
        </Router>
        <Toaster />
        {/* pages use two toast libraries - both need a mounted container or messages never appear */}
        <SonnerToaster position="top-right" richColors />
        <HotToaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
