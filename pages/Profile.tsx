import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { User as UserIcon, Mail, CreditCard, Save } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateUser, togglePlan } = useStore();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateUser(name);
      setSaving(false);
    }, 800);
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="h-full overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-8">Account Settings</h1>

          <div className="grid gap-8 mb-8">
            {/* Profile Info */}
            <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <UserIcon size={20} className="text-brand-400" />
                Profile Information
              </h2>
              
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-2 border-dark-border" />
                </div>
                
                <form onSubmit={handleSave} className="flex-1 w-full space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 px-4 text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={user.email}
                        disabled
                        className="w-full bg-dark-bg/50 border border-dark-border rounded-lg py-2 px-4 text-gray-500 cursor-not-allowed"
                      />
                      <Mail size={16} className="absolute right-3 top-3 text-gray-600" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button type="submit" loading={saving} className="gap-2">
                      <Save size={16} /> Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Subscription */}
            <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-brand-400" />
                Subscription & Billing
              </h2>
              
              <div className="flex items-center justify-between bg-dark-bg p-4 rounded-lg border border-dark-border">
                <div>
                  <p className="text-sm text-gray-400">Current Plan</p>
                  <p className="text-xl font-bold text-white capitalize">{user.plan}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm px-3 py-1 rounded-full border ${user.plan === 'plus' ? 'bg-brand-900/20 text-brand-400 border-brand-500/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                    {user.plan === 'plus' ? 'Active' : 'Free Tier'}
                  </span>
                  <Button variant="outline" size="sm" onClick={togglePlan}>
                    {user.plan === 'free' ? 'Upgrade to Plus' : 'Manage Subscription'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};