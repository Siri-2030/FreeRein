// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Search, Clock, User, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, UrgencyBadge } from '@/components/common/StatusBadge';
import { format } from 'date-fns';

export default function Cases() {
  const [user, setUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const userType = user?.user_type || 'victim';
  const isAdmin = userType === 'admin' || user?.role === 'admin';

  const { data: cases, isLoading: _isLoading } = useQuery({
    queryKey: ['cases', user?.email, isAdmin],
    queryFn: () => {
      if (isAdmin) return base44.entities.SupportRequest.list('-created_date');
      return base44.entities.SupportRequest.filter({ assigned_to: user.email }, '-created_date');
    },
    enabled: !!user,
    initialData: [],
  });

  const filtered = cases.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchSearch = !search || c.subject?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: cases.length,
    pending: cases.filter(c => c.status === 'pending').length,
    in_progress: cases.filter(c => c.status === 'in_progress' || c.status === 'assigned').length,
    resolved: cases.filter(c => c.status === 'resolved' || c.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Cases</h1>
        <p className="text-slate-500 mt-1">
          {isAdmin ? 'Manage all support requests.' : 'Your assigned cases.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-900' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
          { label: 'Active', value: stats.in_progress, color: 'text-indigo-600' },
          { label: 'Resolved', value: stats.resolved, color: 'text-emerald-600' },
        ].map(s => (
          <Card key={s.label} className="border-slate-100">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No cases found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link to={createPageUrl(`CaseDetail?id=${c.id}`)}>
                <Card className="border-slate-100 hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                          {c.subject}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(c.created_date), 'MMM d, yyyy')}
                        </span>
                        <span className="capitalize">{c.request_type?.replace('_', ' ')}</span>
                        {c.requester_email && !c.is_anonymous && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {c.requester_email}
                          </span>
                        )}
                        {c.is_anonymous && <span className="italic">Anonymous</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <UrgencyBadge urgency={c.urgency} />
                      <StatusBadge status={c.status} />
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}