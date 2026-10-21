import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#f0cf65] transition mb-8 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        
        <div className="glass rounded-3xl p-8 md:p-12 border border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">Terms of Service</h1>
          </div>
          
          <div className="prose prose-invert max-w-none text-white/70">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-white mt-8 mb-4 text-xl font-bold">1. Agreement to Terms</h2>
            <p>These Terms of Use constitute a legally binding agreement made between you and LocalBoost AI concerning your access to and use of the LocalBoost AI platform.</p>
            
            <h2 className="text-white mt-8 mb-4 text-xl font-bold">2. Intellectual Property Rights</h2>
            <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site are owned or controlled by us.</p>

            <h2 className="text-white mt-8 mb-4 text-xl font-bold">3. AI Content Generation</h2>
            <p>You retain ownership of any data you input into our services. The generated content is licensed to you for your commercial business use. We do not claim copyright over the specific permutations of AI-generated social media posts provided to your business.</p>

            <h2 className="text-white mt-8 mb-4 text-xl font-bold">4. Prohibited Activities</h2>
            <p>You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
