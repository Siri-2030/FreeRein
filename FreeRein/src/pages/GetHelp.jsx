import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MessageSquare, Send, Plus, ArrowLeft, Loader2,
  AlertTriangle, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { StatusBadge, UrgencyBadge } from '@/components/common/StatusBadge';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function GetHelp() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'new' | 'detail'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const [form, setForm] = useState({
    subject: '',
    description: '',
    request_type: 'general',
    urgency: 'medium',
    is_anonymous: false,
  });

  const { data: requests } = useQuery({
    queryKey: ['my-help-requests', user?.email],
    queryFn: () => base44.entities.SupportRequest.filter({ requester_email: user.email }, '-created_date'),
    enabled: !!user,
    initialData: [],
  });

  const { data: messages } = useQuery({
    queryKey: ['request-messages', selectedRequest?.id],
    queryFn: () => base44.entities.SupportMessage.filter({ request_id: selectedRequest.id, is_internal: false }, 'created_date'),
    enabled: !!selectedRequest,
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SupportRequest.create({ ...data, requester_email: user.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-help-requests'] });
      setView('list');
      setForm({ subject: '', description: '', request_type: 'general', urgency: 'medium', is_anonymous: false });
      toast.success('Support request submitted. Someone will reach out to you soon.');
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content) => base44.entities.SupportMessage.create({
      request_id: selectedRequest.id,
      content,
      sender_email: user.email,
      sender_role: 'victim',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-messages'] });
      setNewMessage('');
    },
  });

  if (view === 'new') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setView('list')} className="-ml-3 text-slate-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Request Support</h1>
          <p className="text-slate-500 mt-1">Tell us about your situation and we'll connect you with the right help.</p>
        </div>

        <Card className="border-slate-100">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief description of what you need help with"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type of Support</Label>
                <Select value={form.request_type} onValueChange={(v) => setForm({ ...form, request_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Support</SelectItem>
                    <SelectItem value="counselling">Counselling</SelectItem>
                    <SelectItem value="legal_advice">Legal Advice</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Urgency</Label>
                <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low — Can wait</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High — Need help soon</SelectItem>
                    <SelectItem value="critical">Critical — Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tell us more</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your situation. All information is kept confidential."
                className="min-h-[120px]"
              />
            </div>

            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">
              <Switch
                checked={form.is_anonymous}
                onCheckedChange={(v) => setForm({ ...form, is_anonymous: v })}
              />
              <div>
                <p className="text-sm font-medium text-slate-700">Stay Anonymous</p>
                <p className="text-xs text-slate-500">Your name won't be shown to the support team.</p>
              </div>
            </div>

            {form.urgency === 'critical' && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">If you are in immediate danger</p>
                  <p className="text-xs text-red-600 mt-0.5">Please call 100 (Police), 181 (Women Helpline), or 1091 (Women in Distress) right away.</p>
                </div>
              </div>
            )}

            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.subject || createMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 w-full"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'detail' && selectedRequest) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => { setView('list'); setSelectedRequest(null); }} className="-ml-3 text-slate-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{selectedRequest.subject}</h1>
            <p className="text-sm text-slate-500 mt-1 capitalize">{selectedRequest.request_type?.replace('_', ' ')}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <UrgencyBadge urgency={selectedRequest.urgency} />
            <StatusBadge status={selectedRequest.status} />
          </div>
        </div>

        {selectedRequest.description && (
          <Card className="border-slate-100">
            <CardContent className="p-4 text-sm text-slate-600">
              {selectedRequest.description}
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <Card className="border-slate-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No messages yet. A support team member will respond soon.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_role === 'victim' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.sender_role === 'victim'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender_role === 'victim' ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 border-t pt-4">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === 'Enter' && newMessage.trim() && sendMessageMutation.mutate(newMessage)}
              />
              <Button
                onClick={() => newMessage.trim() && sendMessageMutation.mutate(newMessage)}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Get Help</h1>
          <p className="text-slate-500 mt-1">Request support from counsellors and legal advisors.</p>
        </div>
        <Button onClick={() => setView('new')} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No requests yet. Reach out whenever you need support.</p>
          <Button onClick={() => setView('new')} className="bg-indigo-600 hover:bg-indigo-700">
            Request Support
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card
                className="border-slate-100 cursor-pointer hover:shadow-md hover:border-slate-200 transition-all"
                onClick={() => { setSelectedRequest(req); setView('detail'); }}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{req.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {format(new Date(req.created_date), 'MMM d, yyyy')}
                      </span>
                      <span className="text-xs text-slate-400 capitalize">
                        · {req.request_type?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <UrgencyBadge urgency={req.urgency} />
                    <StatusBadge status={req.status} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}