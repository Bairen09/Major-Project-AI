import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code } from 'lucide-react';

export default function APIDocs() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#f0cf65] transition mb-8 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        
        <div className="glass rounded-3xl p-8 md:p-12 border border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center">
              <Code className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">API Documentation</h1>
          </div>
          
          <div className="prose prose-invert max-w-none text-white/70">
            <p>Welcome to the LocalBoost API documentation. You can use our REST API to programmatically generate content, manage workspaces, and schedule posts.</p>
            
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 mt-6 font-mono text-sm text-[#D4AF37]">
              Base URL: https://api.localboost.ai/v1
            </div>

            <h2 className="text-white mt-8 mb-4 text-xl font-bold">Authentication</h2>
            <p>All API requests require a Bearer token in the Authorization header. You can generate an API key from your dashboard settings.</p>
            
            <pre className="bg-black/50 p-4 rounded-xl border border-white/5 overflow-x-auto mt-4">
              <code className="text-white/80">Authorization: Bearer YOUR_API_KEY</code>
            </pre>

            <h2 className="text-white mt-8 mb-4 text-xl font-bold">Endpoints</h2>
            
            <h3 className="text-white mt-6 mb-2 font-bold">POST /v1/generate</h3>
            <p>Generates a social media post using your predefined business context.</p>

            <h3 className="text-white mt-6 mb-2 font-bold">GET /v1/workspaces</h3>
            <p>Retrieves a list of all workspaces associated with your account.</p>

            <h3 className="text-white mt-6 mb-2 font-bold">POST /v1/schedule</h3>
            <p>Schedules a generated post to your connected social channels.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
