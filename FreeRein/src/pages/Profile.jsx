// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { UserCircle, Save, Loader2, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    phone: '',
    bio: '',
    specialization: '',
    is_available: true,
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm({
        phone: u.phone || '',
        bio: u.bio || '',
        specialization: u.specialization || '',
        is_available: u.is_available !== false,
      });
    }).catch(() => {});
  }, []);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => toast.success('Profile updated'),
  });

  const userType = user?.user_type || 'victim';
  const isProfessional = userType === 'counsellor' || userType === 'legal_advisor';

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <UserCircle className="w-8 h-8 text-indigo-600" />
          Profile
        </h1>
        <p className="text-slate-500 mt-1">Manage your profile information.</p>
      </div>

      {/* Account info (read only) */}
      <Card className="border-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <UserCircle className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700">{user.full_name || 'Not set'}</span>
          </div>
          <div className="text-xs text-slate-400 capitalize">
            Role: {userType?.replace('_', ' ')} ({user.role})
          </div>
        </CardContent>
      </Card>

      {/* Editable fields */}
      <Card className="border-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Your phone number"
            />
          </div>

          {isProfessional && (
            <>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about your experience and expertise"
                  className="h-24"
                />
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  placeholder="e.g., Family law, Trauma counselling"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.is_available}
                  onCheckedChange={(v) => setForm({ ...form, is_available: v })}
                />
                <Label>Available for new cases</Label>
              </div>
            </>
          )}

          <Button
            onClick={() => saveMutation.mutate(form)}
            disabled={saveMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}