import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/AuthContext';
import { chatAPI } from '../api/chat.js';
import { usersAPI } from '../api/index.js';

import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { MessageCircle, Send, Loader2, Plus, Search, X, UserPlus } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: allUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll().then(res => res.data || res.data.data || []),
  });

  useEffect(() => {
    if (allUsers && Array.isArray(allUsers)) {
      const userEmail = user?.email;
      const userRole = user?.role;
      if (!userEmail) return;
      
      const userType = userRole ? userRole.toUpperCase() : 'VICTIM';
      const isVictim = userType === 'VICTIM';
      const safeUsers = Array.isArray(allUsers) ? allUsers : [];
      const filtered = safeUsers.filter(u => u.email !== userEmail);
      const roleFiltered = filtered.filter(u => {
        if (isVictim) return ['COUNSELLOR', 'LEGAL_ADVISOR', 'ADMIN'].includes(u.role?.toUpperCase());
        return (u.role || '').toUpperCase() === 'VICTIM';
      });
      setContacts(roleFiltered);
    }
  }, [allUsers, user]);

  const conversationId = selectedContact && selectedContact.email && user?.email ? [user.email, selectedContact.email].sort().join('_') : null;

  const { data: messages = [] } = useQuery({
    queryKey: ['chat', conversationId],
    queryFn: () => chatAPI.getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 3000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: () => chatAPI.sendMessage(conversationId, message, selectedContact.email),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat', conversationId] });
    },
    onError: () => toast.error('Failed to send message'),
  });

  const handleSend = () => {
    if (!message.trim() || sendMutation.isPending) return;
    sendMutation.mutate();
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Contacts */}
      <div className="w-80 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Messages
          </h2>
          <button 
            onClick={() => setShowAddContact(true)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Add Contact"
          >
            <Plus className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {contacts.map(contact => (
            <button
              key={contact.id}
              className={`w-full p-4 border-b border-slate-100 hover:bg-slate-50 flex items-center gap-3 text-left ${
                selectedContact?.id === contact.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {contact.name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{contact.name}</p>
                <p className="text-xs text-slate-500 capitalize">{contact.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        {!selectedContact ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <MessageCircle className="w-16 h-16 opacity-50 mr-4" />
            <div>
              <h3 className="text-lg font-semibold">No conversation selected</h3>
              <p>Choose a contact to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b bg-white sticky top-0 z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                {selectedContact.name[0]}
              </div>
              <div>
                <p className="font-semibold">{selectedContact.name}</p>
                <p className="text-xs text-slate-500 capitalize">{selectedContact.role}</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_email === user.email ? 'justify-end' : ''}`}
                >
                  <div className={`max-w-md px-4 py-2 rounded-2xl ${
                    msg.sender_email === user.email 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 text-slate-800'
                  }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 opacity-75 ${
                      msg.sender_email === user.email ? 'text-blue-200' : 'text-slate-500'
                    }`}>
                      {new Date(msg.created_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMutation.isPending}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

