
import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { RefreshCw, AlertTriangle, Loader2, ExternalLink, MonitorPlay } from 'lucide-react';

export const PreviewFrame: React.FC = () => {
  const { currentProject, agentStatus } = useStore();
  const [key, setKey] = useState(0);
  const [srcDoc, setSrcDoc] = useState('');
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Helper: Resolve relative paths
  const resolvePath = (basePath: string, relativePath: string) => {
    // Handle @/ alias -> map to src/ or root
    if (relativePath.startsWith('@/')) {
        return relativePath.replace('@/', 'src/');
    }
    
    if (!relativePath.startsWith('.')) return relativePath;
    
    const stack = basePath.split('/');
    stack.pop(); // Remove current filename
    
    const parts = relativePath.split('/');
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        stack.pop();
      } else {
        stack.push(part);
      }
    }
    return stack.join('/');
  };

  useEffect(() => {
    if (!currentProject) return;

    const generatePreview = async () => {
      try {
        setError(null);
        
        const rawFiles = currentProject.files;
        const files: Record<string, string> = {};
        
        // Normalize paths (remove leading /)
        Object.entries(rawFiles).forEach(([path, file]) => {
          const cleanPath = path.replace(/^\/+/, '');
          files[cleanPath] = (file as any).content;
        });

        if (Object.keys(files).length === 0) {
            setSrcDoc(getEmptyStateHtml());
            return;
        }

        let cssContent = '';
        const jsFiles: Record<string, string> = {};

        // Separate CSS and JS
        Object.entries(files).forEach(([path, content]) => {
          if (path.endsWith('.css')) {
            cssContent += `\n/* ${path} */\n${content}`;
          } else {
            jsFiles[path] = content;
          }
        });

        // Resolve Imports (Rewrite relative paths to absolute keys)
        const processedFiles: Record<string, string> = {};
        Object.entries(jsFiles).forEach(([path, content]) => {
            let newContent = content;
            
            // Rewrite imports/exports using a regex that supports newlines
            // Matches: import ... from "..." OR import "..." OR export ... from "..."
            newContent = newContent.replace(
                /(import[\s\S]*?from\s+['"]|export[\s\S]*?from\s+['"])(.*?)(['"])|(import\s+['"])(.*?)(['"])/g, 
                (match, p1, p2, p3, p4, p5, p6) => {
                    const importQuoteStart = p1 || p4;
                    const importPath = p2 || p5;
                    const importQuoteEnd = p3 || p6;

                    if (!importPath) return match;

                    // Check if it's an external lib (not starting with . or @/)
                    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) return match;

                    let resolved = resolvePath(path, importPath);
                    
                    // Try extensions
                    const extensions = ['', '.tsx', '.ts', '.jsx', '.js'];
                    let found = false;
                    for (const ext of extensions) {
                        if (files[resolved + ext]) {
                            resolved = resolved + ext;
                            found = true;
                            break;
                        }
                        // Try index files
                        if (files[resolved + '/index' + ext]) {
                            resolved = resolved + '/index' + ext;
                            found = true;
                            break;
                        }
                        // Try src/ prefix if not found
                        if (!resolved.startsWith('src/') && files['src/' + resolved + ext]) {
                            resolved = 'src/' + resolved + ext;
                            found = true;
                            break;
                        }
                    }
                    
                    // If found, rewrite the import path to the file key
                    if (found) return `${importQuoteStart}${resolved}${importQuoteEnd}`;
                    return match;
                }
            );

            // Remove CSS imports (they are injected globally)
            newContent = newContent.replace(/import\s+['"].*?\.css['"];?/g, '');
            processedFiles[path] = newContent;
        });

        // External Libraries Import Map - Using esm.sh for reliability
        const externalImports: Record<string, string> = {
            "react": "https://esm.sh/react@18.2.0",
            "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
            "react/jsx-runtime": "https://esm.sh/react@18.2.0/jsx-runtime",
            "lucide-react": "https://esm.sh/lucide-react@0.300.0",
            "recharts": "https://esm.sh/recharts@2.10.3",
            "clsx": "https://esm.sh/clsx",
            "tailwind-merge": "https://esm.sh/tailwind-merge",
            "framer-motion": "https://esm.sh/framer-motion@10.16.4",
            "date-fns": "https://esm.sh/date-fns@2.30.0",
            "react-router-dom": "https://esm.sh/react-router-dom@6.20.0",
            "canvas-confetti": "https://esm.sh/canvas-confetti@1.9.2",
            "uuid": "https://esm.sh/uuid@9.0.1",
            "zustand": "https://esm.sh/zustand@4.4.7",
            "axios": "https://esm.sh/axios@1.6.2",
            "lodash": "https://esm.sh/lodash@4.17.21"
        };

        // Find Entry Point or Auto-Bootstrap
        const entryCandidates = ['src/index.tsx', 'index.tsx', 'src/main.tsx', 'main.tsx', 'src/index.js', 'index.js'];
        let entryFile = entryCandidates.find(f => processedFiles[f]);
        
        // Fallback: Find App.tsx
        const appCandidates = ['src/App.tsx', 'App.tsx', 'src/App.js', 'App.js'];
        const appFile = appCandidates.find(f => processedFiles[f]);

        // Construct the HTML
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Pin Babel version for stability -->
    <script src="https://unpkg.com/@babel/standalone@7.23.5/babel.min.js"></script>
    <style>
        ${cssContent}
        html, body, #root { height: 100%; margin: 0; padding: 0; overflow: auto; }
        body { font-family: 'Inter', sans-serif; background-color: white; }
        #error-overlay {
            display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(24, 24, 27, 0.95); color: #ef4444; padding: 40px;
            font-family: 'JetBrains Mono', monospace; z-index: 9999; white-space: pre-wrap; overflow: auto;
        }
        #loading-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: white; display: flex; align-items: center; justify-content: center;
            z-index: 9000; transition: opacity 0.3s;
        }
    </style>
</head>
<body>
    <div id="loading-overlay">
        <div style="display:flex; flex-direction:column; align-items:center; gap:12px; color:#52525b">
            <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span style="font-size:14px; font-weight:500">Starting Preview...</span>
        </div>
    </div>
    <div id="root"></div>
    <div id="error-overlay"></div>

    <script>
        // Polyfill process for React libs
        window.process = { env: { NODE_ENV: 'development' } };
        
        // Capture console errors to overlay
        const originalConsoleError = console.error;
        console.error = function(...args) {
            const overlay = document.getElementById('error-overlay');
            overlay.style.display = 'block';
            overlay.textContent += args.join(' ') + '\\n';
            originalConsoleError.apply(console, args);
        };

        // Data injection
        const files = ${JSON.stringify(processedFiles)};
        const externalImports = ${JSON.stringify(externalImports)};
        const entryFile = "${entryFile || ''}";
        const appFile = "${appFile || ''}";

        window.onerror = function(message, source, lineno, colno, error) {
            const overlay = document.getElementById('error-overlay');
            overlay.style.display = 'block';
            overlay.textContent = 'Runtime Error:\\n' + message + '\\n\\n' + (error ? error.stack : '');
            console.error(error);
        };

        (async function() {
            try {
                // 1. Compile all files using Babel
                const blobs = {};
                
                for (const path of Object.keys(files)) {
                    const content = files[path];
                    try {
                        const res = Babel.transform(content, {
                            presets: ['react', 'typescript'],
                            filename: path,
                            retainLines: true
                        });
                        
                        // Create Blob for the compiled JS
                        blobs[path] = URL.createObjectURL(new Blob([res.code], { type: 'application/javascript' }));
                    } catch (err) {
                        throw new Error("Compilation Error in " + path + ":\\n" + err.message);
                    }
                }

                // 2. Build Import Map combining external libs and our compiled blobs
                const imports = { ...externalImports, ...blobs };
                
                const map = document.createElement('script');
                map.type = 'importmap';
                map.textContent = JSON.stringify({ imports });
                document.head.appendChild(map);

                // 3. Bootstrap the App
                const bootstrap = document.createElement('script');
                bootstrap.type = 'module';
                
                if (entryFile) {
                    bootstrap.textContent = "import '" + entryFile + "'; document.getElementById('loading-overlay').style.opacity = '0'; setTimeout(()=>document.getElementById('loading-overlay').remove(), 300);";
                } else if (appFile) {
                     // Auto-bootstrap if no index.tsx found
                     bootstrap.textContent = \`
                        import React from 'react';
                        import { createRoot } from 'react-dom/client';
                        import App from '\${appFile}';
                        
                        try {
                            const rootElement = document.getElementById('root');
                            if (!rootElement) throw new Error("Root element not found");
                            const root = createRoot(rootElement);
                            root.render(React.createElement(App));
                            
                            document.getElementById('loading-overlay').style.opacity = '0';
                            setTimeout(()=>document.getElementById('loading-overlay').remove(), 300);
                        } catch(e) {
                            console.error(e);
                        }
                     \`;
                } else {
                    throw new Error("No entry point found. Please create src/index.tsx or src/App.tsx.");
                }
                
                document.body.appendChild(bootstrap);

            } catch (e) {
                const overlay = document.getElementById('error-overlay');
                overlay.style.display = 'block';
                overlay.textContent = e.message;
                console.error(e);
            }
        })();
    </script>
</body>
</html>
        `;

        setSrcDoc(html);

      } catch (err: any) {
        setError(err.message);
      }
    };

    generatePreview();
  }, [currentProject, key]);

  const handleRefresh = () => setKey(k => k + 1);
  const handleOpenNewTab = () => {
      if (!srcDoc) return;
      const blob = new Blob([srcDoc], { type: 'text/html' });
      window.open(URL.createObjectURL(blob), '_blank');
  };

  const getEmptyStateHtml = () => `
    <html>
      <body style="background:#18181b; color:#52525b; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; font-family:system-ui;">
        <div style="text-align:center">
          <h3 style="margin-bottom:8px; color:#e4e4e7;">Ready to build</h3>
          <p style="font-size:14px;">Enter a prompt to start the agent.</p>
        </div>
      </body>
    </html>
  `;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="h-10 bg-[#18181b] border-b border-dark-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-400">
           <MonitorPlay size={14} />
           <span className="font-medium">Live Preview</span>
           {agentStatus !== 'IDLE' && (
               <span className="flex items-center gap-1 text-brand-400 ml-2">
                   <Loader2 size={12} className="animate-spin"/> Building...
               </span>
           )}
        </div>
        <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Refresh">
                <RefreshCw size={14} />
            </button>
            <button onClick={handleOpenNewTab} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Open New Tab">
                <ExternalLink size={14} />
            </button>
        </div>
      </div>

      <div className="flex-1 relative bg-white">
        {error ? (
            <div className="absolute inset-0 bg-[#18181b] p-6 overflow-auto z-50">
                <div className="flex items-center gap-2 text-red-400 mb-4">
                    <AlertTriangle size={24} />
                    <h3 className="text-lg font-bold">System Error</h3>
                </div>
                <pre className="text-red-200 font-mono text-sm bg-red-900/10 p-4 rounded border border-red-900/50 whitespace-pre-wrap">{error}</pre>
            </div>
        ) : (
            <iframe 
                ref={iframeRef}
                title="Preview"
                srcDoc={srcDoc}
                className="w-full h-full border-none bg-white"
                sandbox="allow-scripts allow-modals allow-same-origin allow-popups"
            />
        )}
      </div>
    </div>
  );
};
