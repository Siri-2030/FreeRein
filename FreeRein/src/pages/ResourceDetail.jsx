// @ts-nocheck
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CategoryIcon, { labelMap } from '@/components/common/CategoryIcon';
import { format } from 'date-fns';

export default function ResourceDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const { data: resource, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      const results = await base44.entities.Resource.filter({ id });
      return results[0] || null;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-4">
        <div className="h-6 bg-slate-100 rounded w-1/4" />
        <div className="h-10 bg-slate-100 rounded w-3/4" />
        <div className="h-4 bg-slate-50 rounded w-full" />
        <div className="h-64 bg-slate-50 rounded" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Resource not found.</p>
        <Link to={createPageUrl('Resources')}>
          <Button variant="outline" className="mt-4">Back to Resources</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link to={createPageUrl('Resources')}>
        <Button variant="ghost" className="mb-6 text-slate-600 -ml-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Button>
      </Link>

      <div className="flex items-start gap-4 mb-6">
        <CategoryIcon category={resource.category} size="lg" />
        <div>
          <Badge variant="outline" className="text-xs mb-2">
            {labelMap[resource.category] || resource.category}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{resource.title}</h1>
          {resource.description && (
            <p className="text-slate-500 mt-2 text-lg">{resource.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400 mb-8 border-b pb-4">
        {resource.created_date && (
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(resource.created_date), 'MMMM d, yyyy')}
          </span>
        )}
        {resource.tags?.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            {resource.tags.join(', ')}
          </div>
        )}
      </div>

      <Card className="border-slate-100">
        <CardContent className="p-6 sm:p-8">
          <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-indigo-600">
            <ReactMarkdown>{resource.content || '*No content available yet.*'}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}