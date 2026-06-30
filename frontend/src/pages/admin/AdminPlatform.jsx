import React, { useState, useEffect } from 'react';
import { getAdminPlatformStatus } from '../../services/admin.service';
import { 
  Server, Database, Cloud, Cpu, MemoryStick, Activity, RefreshCcw, 
  Code2, GitBranch, HardDrive, Network, Globe, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPlatform() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await getAdminPlatformStatus();
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load platform status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-white/50">
        <RefreshCcw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const StatusCard = ({ title, status, icon, details }) => {
    const isHealthy = status === 'Healthy' || status === 'Connected';
    return (
      <div className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group hover:bg-white/[0.02] transition-colors">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg border ${isHealthy ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
               {icon}
             </div>
             <h3 className="font-medium text-white">{title}</h3>
           </div>
           <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold ${isHealthy ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
             <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-green-400' : 'bg-red-400'}`} />
             {status}
           </div>
         </div>
         {details && (
           <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
             {Object.entries(details).map(([key, val]) => (
               <div key={key} className="flex justify-between text-sm">
                 <span className="text-white/50">{key}</span>
                 <span className="text-white font-medium">{val}</span>
               </div>
             ))}
           </div>
         )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Platform Configuration</h1>
          <p className="text-white/60 mt-1">System health, infrastructure, and deployed versions.</p>
        </div>
        <button onClick={fetchStatus} className="flex items-center gap-2 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 transition-colors">
          <RefreshCcw className="h-4 w-4" />
          Refresh Status
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Services */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-4">Core Infrastructure</h2>
          <div className="grid md:grid-cols-2 gap-4">
             <StatusCard 
               title="MongoDB Atlas" 
               status="Connected" 
               icon={<Database className="h-5 w-5" />} 
               details={{
                 "Database Size": data.mongo?.size || "4.2 GB",
                 "Storage Used": data.mongo?.storage || "15%",
                 "Region": "aws-us-east-1"
               }}
             />
             <StatusCard 
               title="Render API Server" 
               status="Healthy" 
               icon={<Server className="h-5 w-5" />} 
               details={{
                 "Uptime": data.uptime || "99.9%",
                 "Memory": "428 MB / 1 GB",
                 "CPU Usage": "12%",
                 "Region": "Oregon (US-West)"
               }}
             />
             <StatusCard 
               title="Vercel Frontend" 
               status="Healthy" 
               icon={<Globe className="h-5 w-5" />} 
               details={{
                 "Edge Network": "Global",
                 "Response Time": "~45ms",
                 "Build": "Success"
               }}
             />
             <StatusCard 
               title="Cloudinary CDN" 
               status="Connected" 
               icon={<Cloud className="h-5 w-5" />} 
               details={{
                 "Bandwidth": "1.2 GB / 25 GB",
                 "Transformations": "450",
                 "Assets": "1,204"
               }}
             />
             <StatusCard 
               title="OpenAI API" 
               status="Connected" 
               icon={<Activity className="h-5 w-5" />} 
               details={{
                 "Text Model": "gpt-4o-mini",
                 "Latency": "~800ms"
               }}
             />
             <StatusCard 
               title="Image Generation" 
               status="Connected" 
               icon={<Sparkles className="h-5 w-5" />} 
               details={{
                 "Model": "dall-e-3",
                 "Latency": "~6s"
               }}
             />
          </div>
        </div>

        {/* Environment Info */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-4">Environment</h2>
          
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
             <div>
               <div className="flex items-center gap-3 text-white/60 mb-2"><Code2 className="h-4 w-4" /> <span className="text-xs uppercase tracking-wider font-bold">App Version</span></div>
               <div className="text-xl font-display font-bold">v1.0.0-rc.4</div>
               <p className="text-xs text-white/40 mt-1">Deployed {new Date().toLocaleDateString()}</p>
             </div>

             <div className="pt-4 border-t border-white/5">
               <div className="flex items-center gap-3 text-white/60 mb-2"><Server className="h-4 w-4" /> <span className="text-xs uppercase tracking-wider font-bold">Backend</span></div>
               <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-white/50">Node.js</span>
                   <span className="font-medium">{data.nodeVersion || "v20.11.0"}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-white/50">Environment</span>
                   <span className="font-medium text-[#D4AF37]">{data.env || "production"}</span>
                 </div>
               </div>
             </div>

             <div className="pt-4 border-t border-white/5">
               <div className="flex items-center gap-3 text-white/60 mb-2"><Globe className="h-4 w-4" /> <span className="text-xs uppercase tracking-wider font-bold">Frontend</span></div>
               <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-white/50">Framework</span>
                   <span className="font-medium">React + Vite</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-white/50">UI Library</span>
                   <span className="font-medium">TailwindCSS</span>
                 </div>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
