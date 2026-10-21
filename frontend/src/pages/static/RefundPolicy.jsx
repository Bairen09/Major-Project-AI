import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#f0cf65] transition mb-8 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        
        <div className="glass rounded-3xl p-8 md:p-12 border border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">Refund Policy</h1>
          </div>
          
          <div className="prose prose-invert max-w-none text-white/70">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-white mt-8 mb-4 text-xl font-bold">7-Day Money-Back Guarantee</h2>
            <p>We stand behind our AI marketing automation platform. If you are not completely satisfied with LocalBoost AI within your first 7 days of subscription, you are eligible for a full refund—no questions asked.</p>
            
            <h2 className="text-white mt-8 mb-4 text-xl font-bold">How to Request a Refund</h2>
            <p>To request a refund, please contact our support team at <a href="mailto:support@localboost.ai" className="text-[#D4AF37] hover:underline">support@localboost.ai</a> with your account details. Refunds are processed within 5-7 business days back to your original payment method.</p>

            <h2 className="text-white mt-8 mb-4 text-xl font-bold">Exceptions</h2>
            <p>Refunds will not be granted if:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>The 7-day period has passed.</li>
              <li>You have excessively used the AI generation limits (over 500 generations) during the trial period.</li>
              <li>The account was suspended due to a violation of our Terms of Service.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
