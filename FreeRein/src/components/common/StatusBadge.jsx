import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  assigned: { label: 'Assigned', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  resolved: { label: 'Resolved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  closed: { label: 'Closed', className: 'bg-slate-50 text-slate-700 border-slate-200' },
};

const urgencyConfig = {
  low: { label: 'Low', className: 'bg-slate-50 text-slate-600 border-slate-200' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { label: 'High', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  critical: { label: 'Critical', className: 'bg-red-50 text-red-700 border-red-200' },
};

export function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge variant="outline" className={`${config.className} font-medium text-xs`}>
      {config.label}
    </Badge>
  );
}

export function UrgencyBadge({ urgency }) {
  const config = urgencyConfig[urgency] || urgencyConfig.medium;
  return (
    <Badge variant="outline" className={`${config.className} font-medium text-xs`}>
      {config.label}
    </Badge>
  );
}