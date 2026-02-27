// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Clock, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { StatusBadge, UrgencyBadge } from '@/components/common/StatusBadge';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CaseDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const [user, setUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const userType = user?.user_type || 'victim';

  const { data: request, isLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: async () => {
      const results = await base44.entities.SupportRequest.filter({ id });
      return results[0] || null;
    },
    enabled: !!id,
  });

  const { data: messages } = useQuery({
    queryKey: ['case-messages', id],
    queryFn: () => base44.entities.SupportMessage.filter({ request_id: id }, 'created_date'),
    enabled: !!id,
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.SupportRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', id] });
      toast.success('Case updated');
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.SupportMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-messages'] });
      setNewMessage('');
      setInternalNote('');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Case not found.</p>
        <Link to={createPageUrl('Cases')}>
          <Button variant="outline" className="mt-4">Back to Cases</Button>
        </Link>
      </div>
    );
  }

  const visibleMessages = messages.filter(m => {
    if (userType === 'victim') return !m.is_internal;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to={createPageUrl('Cases')}>
        <Button variant="ghost" className="-ml-3 text-slate-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cases
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{request.subject}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {format(new Date(request.created_date), 'MMM d, yyyy h:mm a')}
            </span>
            <span className="capitalize">{request.request_type?.replace('_', ' ')}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <UrgencyBadge urgency={request.urgency} />
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Details */}
      <Card className="border-slate-100">
        <CardContent className="p-5 space-y-4">
          {request.description && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Description</p>
              <p className="text-sm text-slate-700">{request.description}</p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            {!request.is_anonymous && request.requester_email && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Requester</p>
                <p className="text-sm text-slate-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {request.requester_email}
                </p>
              </div>
            )}
            {request.is_anonymous && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Requester</p>
                <p className="text-sm text-slate-500 italic">Anonymous</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400 mb-1">Assigned To</p>
              <p className="text-sm text-slate-700">{request.assigned_to || 'Unassigned'}</p>
            </div>
          </div>

          {/* Admin/Counsellor Controls */}
          {(userType === 'counsellor' || userType === 'legal_advisor' || userType === 'admin' || user?.role === 'admin') && (
            <div className="border-t pt-4 grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Update Status</Label>
                <Select
                  value={request.status || 'pending'}
                  onValueChange={(v) => updateMutation.mutate({ status: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Assign To (email)</Label>
                <div className="flex gap-2">
                  <Input
                    defaultValue={request.assigned_to || ''}
                    id="assign-input"
                    placeholder="counsellor@email.com"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const val = document.getElementById('assign-input').value;
                      updateMutation.mutate({ assigned_to: val, status: 'assigned' });
                    }}
                  >
                    Assign
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="border-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
            {visibleMessages.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No messages yet.</p>
            ) : (
              visibleMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_role === 'victim' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.is_internal
                      ? 'bg-amber-50 border border-amber-200 text-amber-900'
                      : msg.sender_role === 'victim'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-800'
                  }`}>
                    {msg.is_internal && <p className="text-xs font-semibold text-amber-600 mb-1">Internal Note</p>}
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender_role === 'victim' ? 'text-indigo-200' : 'text-slate-400'
                    }`}>
                      {msg.sender_email && <span className="mr-2">{msg.sender_email}</span>}
                      {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Send message */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Reply to requester..."
                onKeyDown={(e) => e.key === 'Enter' && newMessage.trim() && sendMessageMutation.mutate({
                  request_id: id,
                  content: newMessage,
                  sender_email: user?.email,
                  sender_role: userType,
                  is_internal: false,
                })}
              />
              <Button
                onClick={() => newMessage.trim() && sendMessageMutation.mutate({
                  request_id: id,
                  content: newMessage,
                  sender_email: user?.email,
                  sender_role: userType,
                  is_internal: false,
                })}
                disabled={!newMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {(userType !== 'victim') && (
              <div className="flex gap-2">
                <Input
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Internal note (not visible to requester)..."
                  className="border-amber-200"
                />
                <Button
                  variant="outline"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={() => internalNote.trim() && sendMessageMutation.mutate({
                    request_id: id,
                    content: internalNote,
                    sender_email: user?.email,
                    sender_role: userType,
                    is_internal: true,
                  })}
                  disabled={!internalNote.trim()}
                >
                  Note
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}