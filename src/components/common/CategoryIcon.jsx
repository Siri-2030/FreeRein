import React from 'react';
import { Scale, HeartHandshake, ShieldCheck, Wallet, Home, Users, Siren } from 'lucide-react';

const iconMap = {
  legal_rights: { icon: Scale, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  support_services: { icon: HeartHandshake, color: 'text-rose-600', bg: 'bg-rose-50' },
  health_safety: { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  financial_aid: { icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
  housing: { icon: Home, color: 'text-sky-600', bg: 'bg-sky-50' },
  children_family: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  emergency: { icon: Siren, color: 'text-red-600', bg: 'bg-red-50' },
};

const labelMap = {
  legal_rights: 'Legal Rights',
  support_services: 'Support Services',
  health_safety: 'Health & Safety',
  financial_aid: 'Financial Aid',
  housing: 'Housing',
  children_family: 'Children & Family',
  emergency: 'Emergency',
};

export default function CategoryIcon({ category, size = 'md', showLabel = false }) {
  const config = iconMap[category] || iconMap.support_services;
  const Icon = config.icon;
  const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  const containerSize = size === 'lg' ? 'p-4' : size === 'sm' ? 'p-2' : 'p-3';

  return (
    <div className="flex items-center gap-2">
      <div className={`${config.bg} ${containerSize} rounded-xl`}>
        <Icon className={`${sizeClass} ${config.color}`} />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-slate-700">
          {labelMap[category] || category}
        </span>
      )}
    </div>
  );
}

export { labelMap, iconMap };