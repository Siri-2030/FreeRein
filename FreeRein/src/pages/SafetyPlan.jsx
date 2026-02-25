// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShieldCheck, MapPin, Users, FileText, Footprints, Phone,
  Plus, Trash2, Save, Loader2, StickyNote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

function ListEditor({ items, onChange, placeholder }) {
  const addItem = () => onChange([...items, '']);
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i));
  const updateItem = (i, val) => {
    const updated = [...items];
    updated[i] = val;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input 
            value={item} 
            onChange={(e) => updateItem(i, e.target.value)} 
            placeholder={placeholder}
            className="flex-1"
          />
          <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem} className="text-sm">
        <Plus className="w-3.5 h-3.5 mr-1" />
        Add
      </Button>
    </div>
  );
}

function ContactEditor({ contacts, onChange }) {
  const addContact = () => onChange([...contacts, { name: '', phone: '', relationship: '' }]);
  const removeContact = (i) => onChange(contacts.filter((_, idx) => idx !== i));
  const updateContact = (i, field, val) => {
    const updated = [...contacts];
    updated[i] = { ...updated[i], [field]: val };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {contacts.map((c, i) => (
        <div key={i} className="flex gap-2 flex-wrap sm:flex-nowrap bg-slate-50 rounded-xl p-3">
          <Input value={c.name} onChange={(e) => updateContact(i, 'name', e.target.value)} placeholder="Name" className="flex-1 min-w-[120px]" />
          <Input value={c.phone} onChange={(e) => updateContact(i, 'phone', e.target.value)} placeholder="Phone" className="flex-1 min-w-[120px]" />
          <Input value={c.relationship} onChange={(e) => updateContact(i, 'relationship', e.target.value)} placeholder="Relationship" className="flex-1 min-w-[120px]" />
          <Button variant="ghost" size="icon" onClick={() => removeContact(i)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addContact} className="text-sm">
        <Plus className="w-3.5 h-3.5 mr-1" />
        Add Contact
      </Button>
    </div>
  );
}

export default function SafetyPlan() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: plans } = useQuery({
    queryKey: ['safety-plans', user?.email],
    queryFn: () => base44.entities.SafetyPlan.filter({ owner_email: user.email }),
    enabled: !!user,
    initialData: [],
  });

  const existingPlan = plans[0];

  const [plan, setPlan] = useState({
    title: 'My Safety Plan',
    safe_places: [''],
    emergency_contacts: [{ name: '', phone: '', relationship: '' }],
    important_documents: [''],
    safety_steps: [''],
    support_services: [{ name: '', phone: '', type: '' }],
    personal_notes: '',
  });

  useEffect(() => {
    if (existingPlan) {
      setPlan({
        title: existingPlan.title || 'My Safety Plan',
        safe_places: existingPlan.safe_places?.length ? existingPlan.safe_places : [''],
        emergency_contacts: existingPlan.emergency_contacts?.length ? existingPlan.emergency_contacts : [{ name: '', phone: '', relationship: '' }],
        important_documents: existingPlan.important_documents?.length ? existingPlan.important_documents : [''],
        safety_steps: existingPlan.safety_steps?.length ? existingPlan.safety_steps : [''],
        support_services: existingPlan.support_services?.length ? existingPlan.support_services : [{ name: '', phone: '', type: '' }],
        personal_notes: existingPlan.personal_notes || '',
      });
    }
  }, [existingPlan]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = { ...plan, owner_email: user.email };
      // Clean empty items
      data.safe_places = data.safe_places.filter(Boolean);
      data.important_documents = data.important_documents.filter(Boolean);
      data.safety_steps = data.safety_steps.filter(Boolean);
      data.emergency_contacts = data.emergency_contacts.filter(c => c.name || c.phone);
      data.support_services = data.support_services.filter(c => c.name || c.phone);

      if (existingPlan) {
        return base44.entities.SafetyPlan.update(existingPlan.id, data);
      }
      return base44.entities.SafetyPlan.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-plans'] });
      toast.success('Safety plan saved successfully');
    },
  });

  const sections = [
    {
      icon: MapPin,
      title: 'Safe Places',
      desc: 'Places where you can go if you need to leave quickly.',
      color: 'from-emerald-500 to-teal-500',
      content: (
        <ListEditor
          items={plan.safe_places}
          onChange={(v) => setPlan({ ...plan, safe_places: v })}
          placeholder="e.g., Friend's house, shelter, family member"
        />
      ),
    },
    {
      icon: Users,
      title: 'Emergency Contacts',
      desc: 'People you trust who can help in an emergency.',
      color: 'from-indigo-500 to-violet-500',
      content: (
        <ContactEditor
          contacts={plan.emergency_contacts}
          onChange={(v) => setPlan({ ...plan, emergency_contacts: v })}
        />
      ),
    },
    {
      icon: FileText,
      title: 'Important Documents',
      desc: 'Documents to keep safe or take with you.',
      color: 'from-amber-500 to-orange-500',
      content: (
        <ListEditor
          items={plan.important_documents}
          onChange={(v) => setPlan({ ...plan, important_documents: v })}
          placeholder="e.g., ID, passport, birth certificate, bank info"
        />
      ),
    },
    {
      icon: Footprints,
      title: 'Safety Steps',
      desc: 'Steps to take if you feel you are in danger.',
      color: 'from-rose-500 to-pink-500',
      content: (
        <ListEditor
          items={plan.safety_steps}
          onChange={(v) => setPlan({ ...plan, safety_steps: v })}
          placeholder="e.g., Pack an emergency bag, call trusted friend"
        />
      ),
    },
    {
      icon: Phone,
      title: 'Support Services',
      desc: 'Hotlines and professional support numbers.',
      color: 'from-sky-500 to-blue-500',
      content: (
        <div className="space-y-3">
          {plan.support_services.map((s, i) => (
            <div key={i} className="flex gap-2 flex-wrap sm:flex-nowrap bg-slate-50 rounded-xl p-3">
              <Input value={s.name} onChange={(e) => {
                const upd = [...plan.support_services]; upd[i] = { ...upd[i], name: e.target.value }; setPlan({ ...plan, support_services: upd });
              }} placeholder="Service name" className="flex-1 min-w-[120px]" />
              <Input value={s.phone} onChange={(e) => {
                const upd = [...plan.support_services]; upd[i] = { ...upd[i], phone: e.target.value }; setPlan({ ...plan, support_services: upd });
              }} placeholder="Phone" className="flex-1 min-w-[120px]" />
              <Input value={s.type} onChange={(e) => {
                const upd = [...plan.support_services]; upd[i] = { ...upd[i], type: e.target.value }; setPlan({ ...plan, support_services: upd });
              }} placeholder="Type (shelter, hotline...)" className="flex-1 min-w-[120px]" />
              <Button variant="ghost" size="icon" onClick={() => {
                setPlan({ ...plan, support_services: plan.support_services.filter((_, idx) => idx !== i) });
              }} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setPlan({ ...plan, support_services: [...plan.support_services, { name: '', phone: '', type: '' }] })}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Service
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Safety Plan
          </h1>
          <p className="text-slate-500 mt-1">Create a plan to help keep you safe. This is private to you.</p>
        </div>
        <Button 
          onClick={() => saveMutation.mutate()} 
          disabled={saveMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 flex gap-2"
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Plan
        </Button>
      </div>

      {sections.map((section, i) => {
        const Icon = section.icon;
        return (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="border-slate-100 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">{section.desc}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>{section.content}</CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Personal Notes */}
      <Card className="border-slate-100">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
              <StickyNote className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">Personal Notes</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Any additional thoughts or reminders.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={plan.personal_notes}
            onChange={(e) => setPlan({ ...plan, personal_notes: e.target.value })}
            placeholder="Write anything you want to remember..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end pb-8">
        <Button 
          onClick={() => saveMutation.mutate()} 
          disabled={saveMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 flex gap-2"
          size="lg"
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Safety Plan
        </Button>
      </div>
    </div>
  );
}