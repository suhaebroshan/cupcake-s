
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { GOOGLE_CLIENT_ID } from '../constants';
import { decodeCredential } from '../utils/auth';

declare global {
  interface Window {
    google: any;
  }
}

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useStore();
  const [name, setName] = useState('');
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
            context: 'signup'
        });

        if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            text: 'signup_with',
            shape: 'rectangular',
            });
        }
      } catch(e) {
          console.error("Google init error", e);
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
    if (!email || !password || !name) return;

    setLoading(true);
    try {
      // Await the login process to ensure session storage is set
      await login(name, email);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-600 mb-4">
            <Code2 className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">Start building AI apps today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-brand-500"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-brand-500"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-brand-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" loading={loading}>
            Sign Up <ArrowRight size={16} className="ml-2" />
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
           <div className="h-px bg-dark-border flex-1"></div>
           <span className="text-xs text-gray-500 font-medium uppercase">Or continue with</span>
           <div className="h-px bg-dark-border flex-1"></div>
        </div>

        <div className="w-full h-[40px] flex items-center justify-center min-h-[40px]">
            <div ref={googleButtonRef} className="w-full"></div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-brand-400 hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};
