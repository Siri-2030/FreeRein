import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/AuthContext';
import { evidenceAPI } from '../api/evidence.js';
import { Shield, Plus, Trash2, Upload, FileText, Image as ImageIcon, Film, Mic, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EvidenceVault() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date_of_incident: '',
    file_name: '',
    file_type: 'other',
  });
  const queryClient = useQueryClient();

  const { data: evidence = [] } = useQuery({
    queryKey: ['evidence', user?.email],
    queryFn: () => evidenceAPI.getEvidence(),
    enabled: !!user,
  });
  const isLoading = false;

  const createMutation = useMutation({
    mutationFn: evidenceAPI.createEvidence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence'] });
      toast.success('Evidence saved securely');
      setForm({ title: '', description: '', date_of_incident: '', file_name: '', file_type: 'other' });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: evidenceAPI.deleteEvidence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence'] });
      toast.success('Evidence deleted');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...form, owner_email: user.email, is_private: true });
  };

  if (!user) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Film;
      case 'audio': return Mic;
      default: return FileText;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            Evidence Vault
          </h1>
          <p className="text-gray-600 mt-2">Secure storage for domestic violence evidence. Private to you only.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Evidence
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            New Evidence
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Incident on October 15"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={form.date_of_incident}
                onChange={(e) => setForm({...form, date_of_incident: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                rows={4}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-vertical"
                placeholder="Describe the incident, context, and why this evidence matters..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">File (optional)</label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setForm({
                      ...form,
                      file_name: file.name,
                      file_type: file.type.split('/')[0] || 'other'
                    });
                  }
                }}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2.5 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Save Evidence
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Your Evidence</h3>
          {evidence.length > 0 && (
            <span className="text-sm text-indigo-600 font-medium">{evidence.length} items</span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-slate-100 animate-pulse rounded-xl p-6 h-32" />
            ))}
          </div>
        ) : evidence.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No evidence yet</h3>
            <p className="text-slate-500 mb-6">Your evidence vault is empty. Add your first piece when ready.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add First Evidence
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidence.map((item) => {
              const Icon = getIcon(item.file_type);
              return (
                <div key={item.id} className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-100 p-6 transition-all overflow-hidden">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">{item.title}</h4>
                      {item.date_of_incident && (
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.date_of_incident).toLocaleDateString()}
                        </p>
                      )}
                      {item.file_type && (
                        <span className="inline-block px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full mt-1">
                          {item.file_type}
                        </span>
                      )}
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      Saved {new Date(item.created_date).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

