import React from 'react';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';

export const WORKFLOW_STEPS = [
  { 
    n: "01", 
    t: "Tell Us About Your Business", 
    d: "Add your business details, audience & goals in minutes.", 
    i: <Brain className="h-5 w-5" /> 
  },
  { 
    n: "02", 
    t: "AI Generates Amazing Content", 
    d: "Our AI creates tailored posts, captions, hashtags & more.", 
    i: <Sparkles className="h-5 w-5" /> 
  },
  { 
    n: "03", 
    t: "Post & Grow Your Audience", 
    d: "Schedule, publish & see real growth across platforms.", 
    i: <TrendingUp className="h-5 w-5" /> 
  },
];
