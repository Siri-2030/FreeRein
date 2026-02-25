import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, FileText, Plus, Pencil, Trash2,
  Loader2, Shield, BarChart3, Eye, EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import CategoryIcon, { labelMap } from '@/components/common/CategoryIcon';

const CATEGORIES = ['legal_rights', 'support_services', 'health_safety', 'financial_aid', 'housing', 'children_family', 'emergency'];

function ResourceForm({ resource, onSave, onCancel }) {
  const [form, setForm] = useState(resource || {
    title: '',
    description: '',
    content: '',
    category: 'support_services',
    target_audience: 'all',
    is_published: true,
    priority: 0,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !form.tags?.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...(form.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-20" />
      </div>
      <div className="space-y-2">
        <Label>Content (Markdown)</Label>
        <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="h-48 font-mono text-sm" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{labelMap[c] || c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Target Audience</Label>
          <Select value={form.target_audience} onValueChange={(v) => setForm({ ...form, target_audience: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              <SelectItem value="victims">Victims/Survivors</SelectItem>
              <SelectItem value="counsellors">Counsellors</SelectItem>
              <SelectItem value="legal_advisors">Legal Advisors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
          <Label className="text-sm">Published</Label>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Priority</Label>
          <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} className="w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
          <Button variant="outline" onClick={addTag}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {form.tags?.map(tag => (
            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setForm({ ...form, tags: form.tags.filter(t => t !== tag) })}>
              {tag} ×
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!form.title} className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
      </div>
    </div>
  );
}

export default function Admin() {
  const [user, setUser] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: resources } = useQuery({
    queryKey: ['admin-resources'],
    queryFn: () => base44.entities.Resource.list('-priority'),
    initialData: [],
  });

  const { data: allRequests } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: () => base44.entities.SupportRequest.list('-created_date'),
    initialData: [],
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const saveResourceMutation = useMutation({
    mutationFn: (data) => {
      if (editingResource) return base44.entities.Resource.update(editingResource.id, data);
      return base44.entities.Resource.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      setShowResourceForm(false);
      setEditingResource(null);
      toast.success('Resource saved');
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (id) => base44.entities.Resource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      toast.success('Resource deleted');
    },
  });

  const stats = {
    resources: resources.length,
    cases: allRequests.length,
    users: users.length,
    pending: allRequests.filter(r => r.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Shield className="w-8 h-8 text-indigo-600" />
          Admin Panel
        </h1>
        <p className="text-slate-500 mt-1">Manage resources, users, and monitor cases.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Resources', value: stats.resources, icon: BookOpen, color: 'text-indigo-600' },
          { label: 'Cases', value: stats.cases, icon: FileText, color: 'text-rose-600' },
          { label: 'Users', value: stats.users, icon: Users, color: 'text-emerald-600' },
          { label: 'Pending', value: stats.pending, icon: BarChart3, color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="border-slate-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="resources">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Manage Resources</h2>
            <Button
              onClick={() => { setEditingResource(null); setShowResourceForm(true); }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </div>

          {showResourceForm && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>{editingResource ? 'Edit Resource' : 'New Resource'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResourceForm
                  resource={editingResource}
                  onSave={(data) => saveResourceMutation.mutate(data)}
                  onCancel={() => { setShowResourceForm(false); setEditingResource(null); }}
                />
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {resources.map(res => (
              <Card key={res.id} className="border-slate-100">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIcon category={res.category} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{res.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs">{labelMap[res.category]}</Badge>
                        {res.is_published ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600"><Eye className="w-3 h-3" />Published</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-slate-400"><EyeOff className="w-3 h-3" />Draft</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingResource(res); setShowResourceForm(true); }}>
                      <Pencil className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteResourceMutation.mutate(res.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold">Registered Users</h2>
          <div className="space-y-3">
            {users.map(u => (
              <Card key={u.id} className="border-slate-100">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-sm">
                      {u.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{u.full_name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize text-xs">
                      {u.user_type || u.role || 'user'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {u.role || 'user'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}