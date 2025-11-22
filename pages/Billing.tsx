import React from 'react';
import { Layout } from '../components/Layout';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Check, Star } from 'lucide-react';

export const Billing: React.FC = () => {
  const { user, togglePlan } = useStore();

  return (
    <Layout>
      <div className="h-full overflow-y-auto">
        <div className="p-12 max-w-5xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Upgrade to Cupcake-S Plus</h1>
          <p className="text-gray-400 mb-12">Unleash the full power of AI engineering without limits.</p>

          <div className="grid md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto mb-12">
            {/* Free Plan */}
            <div className={`p-8 rounded-2xl border ${user?.plan === 'free' ? 'border-brand-500 bg-brand-900/10' : 'border-dark-border bg-dark-surface'} relative`}>
              {user?.plan === 'free' && <div className="absolute top-4 right-4 text-xs font-bold text-brand-400 uppercase">Current Plan</div>}
              <h2 className="text-xl font-bold text-white mb-2">Hobbyist</h2>
              <p className="text-3xl font-bold text-white mb-6">$0<span className="text-base font-normal text-gray-400">/mo</span></p>
              <ul className="space-y-3 mb-8 text-sm text-gray-300">
                <li className="flex items-center gap-2"><Check size={16} className="text-green-500"/> 3 Projects</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-green-500"/> Standard Queue Priority</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-green-500"/> Community Support</li>
                <li className="flex items-center gap-2 text-gray-500"><Check size={16}/> Custom Domains</li>
              </ul>
              {user?.plan === 'free' ? (
                  <Button variant="secondary" className="w-full" disabled>Current Plan</Button>
              ) : (
                  <Button variant="secondary" className="w-full" onClick={togglePlan}>Downgrade</Button>
              )}
            </div>

            {/* Plus Plan */}
            <div className={`p-8 rounded-2xl border ${user?.plan === 'plus' ? 'border-brand-500 bg-brand-900/10' : 'border-dark-border bg-dark-surface'} relative overflow-hidden`}>
              {user?.plan === 'plus' && <div className="absolute top-4 right-4 text-xs font-bold text-brand-400 uppercase">Current Plan</div>}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-purple-500"></div>
              
              <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-white">Plus</h2>
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-6">$20<span className="text-base font-normal text-gray-400">/mo</span></p>
              <ul className="space-y-3 mb-8 text-sm text-gray-300">
                <li className="flex items-center gap-2"><Check size={16} className="text-brand-400"/> Unlimited Projects</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-brand-400"/> Priority AI Execution (Qwen 72B)</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-brand-400"/> Gemini 2.0 Flash Enhancer</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-brand-400"/> Custom Domain Deployment</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-brand-400"/> Export to GitHub</li>
              </ul>
              {user?.plan === 'plus' ? (
                  <Button variant="primary" className="w-full" disabled>Active</Button>
              ) : (
                  <Button variant="primary" className="w-full" onClick={togglePlan}>Upgrade Now</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};