import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#f0cf65] transition mb-8 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        
        <div className="glass rounded-3xl p-8 md:p-12 border border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">Privacy Policy</h1>
          </div>
          
          <div className="prose prose-invert max-w-none text-white/70">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-white mt-8 mb-4 text-xl font-bold">1. Introduction</h2>
            <p>At LocalBoost AI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI marketing automation platform.</p>
            
            <h2 className="text-white mt-8 mb-4 text-xl font-bold">2. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number.</li>
              <li><strong>Business Data:</strong> Information about your local business required to generate accurate AI marketing materials.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, and your operating system.</li>
            </ul>

            <h2 className="text-white mt-8 mb-4 text-xl font-bold">3. Use of Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Generate AI-driven social media posts and marketing campaigns.</li>
              <li>Create and manage your account.</li>
              <li>Email you regarding your account or order.</li>
              <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
            </ul>

            <h2 className="text-white mt-8 mb-4 text-xl font-bold">4. Contact Us</h2>
            <p>If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@localboost.ai" className="text-[#D4AF37] hover:underline">privacy@localboost.ai</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
