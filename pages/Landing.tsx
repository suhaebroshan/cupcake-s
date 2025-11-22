import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Zap, Box, Shield, ArrowRight, Cpu, Globe, Users, Terminal, CheckCircle2, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Code2 size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tighter">Cupcake-S</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Sign In</Link>
          <Link to="/signup">
            <Button size="sm" className="bg-white text-black hover:bg-gray-200 border-none">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center relative">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/20 rounded-full blur-[120px] -z-10"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-dark-surface border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(14,165,233,0.3)]">
          <Zap size={12} className="fill-brand-300" />
          v2.0 Now Live: 10x Faster Builds
        </div>
        
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-tight">
          Build at the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-500 to-purple-500 animate-pulse-slow">
            speed of thought.
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The autonomous AI full-stack engineer that doesn't sleep. Describe your idea, and Cupcake-S plans, codes, debugs, and deploys it in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link to="/dashboard">
            <Button size="lg" className="w-full sm:w-auto gap-2 h-12 px-8 text-base font-semibold shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] transition-all">
              Start Building Free <ArrowRight size={18} />
            </Button>
          </Link>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto h-12 px-8 bg-dark-surface/50 backdrop-blur border-dark-border">
            View Demo Video
          </Button>
        </div>

        {/* Mock UI Terminal */}
        <div className="mx-auto max-w-4xl bg-[#09090b] rounded-xl border border-dark-border shadow-2xl overflow-hidden relative group">
          <div className="h-8 bg-[#18181b] border-b border-dark-border flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
              <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
              <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
            </div>
            <div className="flex-1 text-center text-xs text-gray-500 font-mono">cupcake-s-agent — zsh</div>
          </div>
          <div className="p-6 font-mono text-left text-sm md:text-base text-gray-300 space-y-2 leading-relaxed">
            <div className="flex gap-2">
              <span className="text-green-500 font-bold">➜</span>
              <span className="text-blue-400 font-bold">~</span>
              <span className="text-white">build "SaaS dashboard for crypto analytics"</span>
            </div>
            <div className="text-gray-500 animate-pulse pt-2">Processing request...</div>
            <div className="pt-2">
              <span className="text-yellow-500">✔</span> <span className="text-white">Spec generated via Gemini 2.0 Flash</span> <span className="text-gray-600 text-xs">(0.4s)</span>
            </div>
            <div>
              <span className="text-yellow-500">✔</span> <span className="text-white">Architecture planned</span> <span className="text-gray-600 text-xs">(0.8s)</span>
            </div>
            <div>
              <span className="text-green-500">➜</span> <span className="text-brand-400">Qwen 2.5 72B is coding...</span>
            </div>
            <div className="pl-4 text-gray-400 border-l-2 border-gray-800 ml-1 space-y-1">
              <p>+ created components/CryptoChart.tsx</p>
              <p>+ created services/CoinGeckoAPI.ts</p>
              <p>+ updated App.tsx</p>
            </div>
            <div className="pt-2">
              <span className="text-green-500 font-bold">✔ Deployed successfully to https://crypto-dash.cupcakes.app</span>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Cloud / Tech Stack */}
      <section className="py-10 border-y border-white/5 bg-white/5">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-6">Powered by Next-Gen Tech</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2"><Cpu className="text-white"/> <span className="font-bold text-lg">Qwen 2.5</span></div>
             <div className="flex items-center gap-2"><Zap className="text-brand-400"/> <span className="font-bold text-lg">Gemini 2.0</span></div>
             <div className="flex items-center gap-2"><Box className="text-blue-400"/> <span className="font-bold text-lg">React 19</span></div>
             <div className="flex items-center gap-2"><Globe className="text-green-400"/> <span className="font-bold text-lg">Cloudflare R2</span></div>
             <div className="flex items-center gap-2"><Terminal className="text-yellow-400"/> <span className="font-bold text-lg">WebContainers</span></div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">From Idea to URL in <span className="text-brand-400">Minutes</span></h2>
          <p className="text-gray-400 text-lg">No setup, no configs, no git merge conflicts.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Terminal size={32} className="text-brand-400" />,
              title: "1. Describe It",
              desc: "Just type what you want. \"A landing page for my coffee shop\" or \"A kanban board with drag and drop\"."
            },
            {
              icon: <Cpu size={32} className="text-purple-400" />,
              title: "2. AI Builds It",
              desc: "Our multi-agent system plans the architecture, writes the code, and fixes its own bugs in real-time."
            },
            {
              icon: <Globe size={32} className="text-green-400" />,
              title: "3. Deploy It",
              desc: "Instantly live on a custom subdomain. Share the link with the world or export the code to GitHub."
            }
          ].map((step, i) => (
            <div key={i} className="bg-dark-surface border border-dark-border p-8 rounded-2xl hover:bg-dark-surface/80 transition-colors relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all"></div>
              <div className="mb-6 bg-dark-bg w-16 h-16 rounded-xl flex items-center justify-center border border-dark-border">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-dark-surface py-24 border-y border-dark-border">
        <div className="container mx-auto px-6">
           <div className="grid md:grid-cols-2 gap-16 items-center">
             <div>
               <h2 className="text-3xl md:text-4xl font-bold mb-6">An entire engineering team <br/> in your browser.</h2>
               <div className="space-y-6">
                 {[
                   "Zero-config React & Tailwind environments",
                   "Real-time preview with hot reloading",
                   "Self-healing code generation",
                   "Instant deployment to edge networks",
                   "Export to ZIP or GitHub"
                 ].map((feat, i) => (
                   <div key={i} className="flex items-center gap-3">
                     <CheckCircle2 className="text-brand-500 shrink-0" size={20} />
                     <span className="text-gray-300 text-lg">{feat}</span>
                   </div>
                 ))}
               </div>
               <Button size="lg" className="mt-8" variant="outline">Explore Documentation</Button>
             </div>
             <div className="relative">
               <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-purple-600 blur-[100px] opacity-20"></div>
               <div className="relative bg-dark-bg border border-dark-border rounded-xl overflow-hidden shadow-2xl aspect-video flex flex-col">
                  <div className="h-10 bg-[#18181b] border-b border-dark-border flex items-center px-4 justify-between">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                    </div>
                    <div className="text-xs text-gray-500">App.tsx</div>
                  </div>
                  <div className="p-6 text-sm font-mono text-blue-300">
                    <span className="text-purple-400">import</span> React <span className="text-purple-400">from</span> <span className="text-green-400">'react'</span>;<br/>
                    <br/>
                    <span className="text-purple-400">export default function</span> <span className="text-yellow-300">App</span>() {'{'}<br/>
                    &nbsp;&nbsp;<span className="text-purple-400">return</span> (<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-red-400">div</span> className=<span className="text-green-400">"p-10 bg-gradient..."</span>&gt;<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-red-400">h1</span>&gt;Hello World&lt;/<span className="text-red-400">h1</span>&gt;<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span className="text-red-400">div</span>&gt;<br/>
                    &nbsp;&nbsp;);<br/>
                    {'}'}
                  </div>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-6 py-24 max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "Is the code really mine?", a: "Yes. You can download the source code, export it, and host it anywhere. No lock-in." },
            { q: "Can I use custom packages?", a: "Currently we support standard ES modules available via ESM.sh, including React, Framer Motion, Lucide, and more." },
            { q: "How much does it cost?", a: "We have a generous Free Tier. The Plus plan ($20/mo) unlocks unlimited projects and priority AI processing." },
            { q: "What AI models do you use?", a: "We orchestrate Qwen 2.5 72B for heavy-lifting logic and Google Gemini 2.0 Flash for rapid reasoning and planning." }
          ].map((item, i) => (
            <div key={i} className="bg-dark-surface border border-dark-border rounded-lg p-6 hover:border-brand-500/30 transition-colors">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><HelpCircle size={18} className="text-brand-400"/> {item.q}</h3>
              <p className="text-gray-400 pl-7">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
      
      <footer className="border-t border-dark-border py-12 bg-dark-surface">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Code2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl">Cupcake-S</span>
          </div>
          <div className="text-gray-500 text-sm">
            &copy; 2024 Cupcake-S Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
             <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
             <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
             <a href="#" className="text-gray-400 hover:text-white transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
};