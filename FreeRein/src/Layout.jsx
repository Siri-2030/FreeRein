// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import {
  ShieldCheck, LayoutDashboard, BookOpen, FileText, MessageSquare,
  Users, Menu, X, LogOut, ChevronDown, UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import QuickExit from '@/components/common/QuickExit';
import EmergencyBanner from '@/components/common/EmergencyBanner';

const publicPages = ['Landing'];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const me = await base44.auth.me();
          setUser(me);
        }
      } catch (e) {
        // not logged in
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const isPublic = publicPages.includes(currentPageName);
  const isLanding = currentPageName === 'Landing';
  const userType = user?.user_type || 'victim';

  const getNavItems = () => {
    const items = [
      { label: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
      { label: 'Resources', icon: BookOpen, page: 'Resources' },
      { label: 'Safety Plan', icon: ShieldCheck, page: 'SafetyPlan' },
    ];

    if (userType === 'victim') {
      items.push({ label: 'Get Help', icon: MessageSquare, page: 'GetHelp' });
    }

    if (userType === 'counsellor' || userType === 'legal_advisor' || userType === 'admin' || user?.role === 'admin') {
      items.push({ label: 'Cases', icon: FileText, page: 'Cases' });
    }

    if (userType === 'admin' || user?.role === 'admin') {
      items.push({ label: 'Admin', icon: Users, page: 'Admin' });
    }

    return items;
  };

  if (isLanding) {
    return (
      <div className="min-h-screen bg-white">
        <EmergencyBanner />
        {children}
        <QuickExit />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50">
      <EmergencyBanner />

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900 hidden sm:block">FreeRein</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
                        {user.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-slate-700">
                        {user.full_name || 'User'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{user.full_name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <p className="text-xs text-indigo-600 capitalize mt-0.5">{userType?.replace('_', ' ')}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Profile')} className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => base44.auth.logout()}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-sm"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      <QuickExit />
    </div>
  );
}