
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { GOOGLE_CLIENT_ID } from '../constants';
import { decodeCredential } from '../utils/auth';

declare global {
  interface Window {
    google: any;
  }
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google && window.google.accounts && GOOGLE_CLIENT_ID) {
      try {
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
            auto_select: false,
            context: 'signin',
            ux_mode: 'popup'
        });

        if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
            });
        }
      } catch (e) {
          console.error("Google Sign-In init error", e);
      }
    }
  }, []);

  const handleGoogleCallback = async (response: any) => {
    try {
      const credential = response.credential;
      const payload = decodeCredential(credential);
      
      if (payload) {
        await login(payload.name, payload.email, payload.picture);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);

    // Admin Backdoor
    if (email === 'a@.com' && password === '1111') {
        await login('Admin', 'a@.com', 'https://ui-avatars.com/api/?name=Admin&background=0ea5e9&color=fff');
        setLoading(false);
        navigate('/dashboard');
        return;
    }

    try {
      const name = email.split('@')[0];
      // Await login to ensure state is updated before navigation
      await login(name.charAt(0).toUpperCase() + name.slice(1), email);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[400px] z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Code2 size={18} className="text-white" />
             </div>
             <span className="text-xl font-bold text-white tracking-tight">Cupcake-S</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 text-sm">Enter your credentials to access the workspace.</p>
        </div>

        <div className="bg-dark-surface/50 backdrop-blur-xl border border-dark-border rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
                <div className="relative group">
                <Mail className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-brand-400 transition-colors" size={16} />
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                    placeholder="name@company.com"
                    required
                />
                </div>
            </div>
            
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative group">
                <Lock className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-brand-400 transition-colors" size={16} />
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                    placeholder="••••••••"
                    required
                />
                </div>
            </div>

            <Button type="submit" className="w-full mt-2 bg-brand-600 hover:bg-brand-500 text-white" loading={loading}>
                Sign In
            </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
                <div className="h-px bg-dark-border flex-1"></div>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Or continue with</span>
                <div className="h-px bg-dark-border flex-1"></div>
            </div>

            <div className="space-y-3">
                {/* Google Button Container */}
                <div className="w-full h-[40px] flex items-center justify-center min-h-[40px]">
                   <div ref={googleButtonRef} className="w-full"></div>
                </div>

                <button 
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-2 bg-dark-bg border border-dark-border text-gray-400 text-sm font-medium py-2 rounded-lg cursor-not-allowed opacity-50"
                >
                    <Github size={16} />
                    GitHub
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
