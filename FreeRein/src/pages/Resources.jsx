import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryIcon, { labelMap } from '@/components/common/CategoryIcon';

const categories = ['all', 'legal_rights', 'support_services', 'health_safety', 'financial_aid', 'housing', 'children_family', 'emergency'];

export default function Resources() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.filter({ is_published: true }, '-priority'),
    initialData: [],
  });

  const filtered = resources.filter(r => {
    const matchCategory = category === 'all' || r.category === category;
    const matchSearch = !search || 
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Resource Library</h1>
        <p className="text-slate-500 mt-1">Find information on legal rights, support services, health, and more.</p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search resources..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 border-slate-200"
          />
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="bg-slate-100 h-auto p-1 flex-wrap">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="text-xs sm:text-sm capitalize whitespace-nowrap"
                >
                  {cat === 'all' ? 'All' : labelMap[cat] || cat.replace('_', ' ')}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Resource Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i} className="animate-pulse border-slate-100">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-slate-100 rounded-xl mb-4" />
                <div className="h-5 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-50 rounded w-full mb-1" />
                <div className="h-4 bg-slate-50 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No resources found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resource, i) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={createPageUrl(`ResourceDetail?id=${resource.id}`)}>
                <Card className="group cursor-pointer hover:shadow-lg border-slate-100 hover:border-slate-200 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <CategoryIcon category={resource.category} />
                    <h3 className="text-base font-semibold text-slate-900 mt-4 group-hover:text-indigo-700 transition-colors line-clamp-2">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-3">
                      {resource.description}
                    </p>
                    {resource.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {resource.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
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