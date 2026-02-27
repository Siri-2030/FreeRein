// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BookOpen, ShieldCheck, MessageSquare, FileText, Phone,
  ArrowRight, Heart, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, UrgencyBadge } from '@/components/common/StatusBadge';
import CategoryIcon, { labelMap } from '@/components/common/CategoryIcon';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const userType = user?.user_type || 'victim';

  const { data: recentResources } = useQuery({
    queryKey: ['resources-recent'],
    queryFn: () => base44.entities.Resource.filter({ is_published: true }, '-priority', 4),
    initialData: [],
  });

  const { data: myRequests } = useQuery({
    queryKey: ['my-requests'],
    queryFn: async () => {
      if (!user) return [];
      if (userType === 'victim') {
        return base44.entities.SupportRequest.filter({ requester_email: user.email }, '-created_date', 5);
      }
      if (userType === 'counsellor' || userType === 'legal_advisor') {
        return base44.entities.SupportRequest.filter({ assigned_to: user.email }, '-created_date', 5);
      }
      return base44.entities.SupportRequest.list('-created_date', 10);
    },
    initialData: [],
    enabled: !!user,
  });

  const quickActions = [
    {
      icon: BookOpen,
      title: 'Browse Resources',
      desc: 'Legal rights, health info, support services',
      page: 'Resources',
      color: 'from-indigo-500 to-violet-500',
    },
    {
      icon: ShieldCheck,
      title: 'Safety Plan',
      desc: 'Create your personalized safety plan',
      page: 'SafetyPlan',
      color: 'from-emerald-500 to-teal-500',
    },
    ...(userType === 'victim' ? [{
      icon: MessageSquare,
      title: 'Get Help',
      desc: 'Request counselling or legal support',
      page: 'GetHelp',
      color: 'from-rose-500 to-pink-500',
    }] : []),
    ...(userType !== 'victim' ? [{
      icon: FileText,
      title: 'View Cases',
      desc: 'Manage assigned support requests',
      page: 'Cases',
      color: 'from-amber-500 to-orange-500',
    }] : []),
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-slate-500 mt-1">
            {userType === 'victim' 
              ? "You're not alone. Here's everything you need in one place."
              : `Here's an overview of your ${userType === 'admin' ? 'admin' : 'professional'} dashboard.`
            }
          </p>
        </div>
        {userType === 'victim' && (
          <a href="tel:181">
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 flex gap-2">
              <Phone className="w-4 h-4" />
              Call 181
            </Button>
          </a>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.page}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={createPageUrl(action.page)}>
                <Card className="group cursor-pointer hover:shadow-lg border-slate-100 hover:border-slate-200 transition-all duration-300 h-full">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <Card className="border-slate-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  {userType === 'victim' ? 'Your Requests' : 'Active Cases'}
                </CardTitle>
                {myRequests.length > 0 && (
                  <Link to={createPageUrl(userType === 'victim' ? 'GetHelp' : 'Cases')}>
                    <Button variant="ghost" size="sm" className="text-indigo-600">
                      View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {myRequests.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">
                    {userType === 'victim' 
                      ? "You haven't made any support requests yet."
                      : "No cases assigned to you yet."
                    }
                  </p>
                  {userType === 'victim' && (
                    <Link to={createPageUrl('GetHelp')}>
                      <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700" size="sm">
                        Request Support
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {myRequests.map((req) => (
                    <Link
                      key={req.id}
                      to={createPageUrl(userType === 'victim' ? 'GetHelp' : `CaseDetail?id=${req.id}`)}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{req.subject}</p>
                            <p className="text-xs text-slate-500 capitalize mt-0.5">
                              {req.request_type?.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <UrgencyBadge urgency={req.urgency} />
                          <StatusBadge status={req.status} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Resources */}
        <Card className="border-slate-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-slate-400" />
                Resources
              </CardTitle>
              <Link to={createPageUrl('Resources')}>
                <Button variant="ghost" size="sm" className="text-indigo-600">
                  All <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentResources.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No resources available yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentResources.map((res) => (
                  <Link
                    key={res.id}
                    to={createPageUrl(`ResourceDetail?id=${res.id}`)}
                    className="block"
                  >
                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                      <CategoryIcon category={res.category} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                          {res.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {labelMap[res.category] || res.category}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emergency Info Banner */}
      <Card className="bg-gradient-to-r from-indigo-600 to-violet-600 border-none text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <CardContent className="p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Remember: You deserve to be safe.</h3>
                <p className="text-white/70 text-sm mt-1 max-w-md">
                  If you or someone you know is in immediate danger, call 100 (Police), 
                  181 (Women Helpline), or 1091 (Women in Distress).
                </p>
              </div>
            </div>
            <a href="tel:181">
              <Button className="bg-white text-indigo-700 hover:bg-white/90 font-semibold whitespace-nowrap">
                <Phone className="w-4 h-4 mr-2" />
                Call 181
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}