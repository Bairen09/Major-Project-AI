import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogoMark } from "../components/common/Logo";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { login as loginService } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import AuthCarousel from "../components/auth/AuthCarousel";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await loginService({ email, password });
      const { token, user, isStaff } = response.data.data;
      
      if (isStaff) {
        localStorage.setItem('staffToken', token);
        navigate('/support/inbox');
        return;
      }

      login(token, user);
      if (user.platformRole === 'SUPER_ADMIN') {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#15110C] text-white overflow-hidden">
      <div className="grid w-full lg:grid-cols-[45%_55%] xl:grid-cols-[50%_50%]">
        
        {/* Left Side: Marketing Carousel */}
        <div className="hidden lg:block relative">
          <AuthCarousel />
        </div>

        {/* Right Side: Auth Form */}
        <div className="relative flex flex-col items-center justify-center p-6 md:p-12 z-10">
          
          {/* Mobile Top Header */}
          <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 lg:hidden hover:opacity-80 transition-opacity">
            <LogoMark className="h-6 w-6" />
            <span className="font-display font-semibold">LocalBoost AI</span>
          </Link>

          {/* Background Ambient Glows */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 right-0 h-[400px] w-[400px] rounded-full bg-[#D4AF37]/5 blur-[120px]" />
            <div className="absolute bottom-0 -left-20 h-[500px] w-[500px] rounded-full bg-[#F5D77A]/5 blur-[140px]" />
          </div>

          <div className="w-full max-w-[460px]">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="font-display text-3xl font-bold text-white tracking-tight md:text-4xl">Login to your account</h1>
              <p className="mt-3 text-sm text-white/60">Enter your details to access your dashboard</p>
            </div>

            <div className="glass-strong relative rounded-[32px] p-8 shadow-[0_20px_60px_-15px_rgba(212,175,55,0.1)] border border-white/5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-50" />
              
              <form className="relative space-y-6 z-10" onSubmit={handleLogin}>
                {error && (
                  <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition group-focus-within:text-[#D4AF37]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="youremail@example.com"
                      className="w-full rounded-2xl bg-white/5 border border-white/10 px-11 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:bg-white/10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition group-focus-within:text-[#D4AF37]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-2xl bg-white/5 border border-white/10 px-11 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:bg-white/10"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#D4AF37] focus:ring-[#D4AF37]/20 focus:ring-offset-0" />
                    <span className="text-xs text-white/60 transition group-hover:text-white/90">Remember me</span>
                  </label>
                  <a href="#" className="text-xs font-medium text-[#D4AF37] hover:text-[#F5D77A] transition">Forgot password?</a>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-cta w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)] transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Sign In"} {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              {/* Social Login Separator */}
              <div className="relative mt-8 mb-6 z-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#1C1814] px-4 text-white/40">or continue with</span>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-4 z-10 relative">
                <button type="button" className="glass flex items-center justify-center gap-2 rounded-xl py-3 transition hover:bg-white/10">
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  <span className="text-xs font-medium">Google</span>
                </button>
                <button type="button" className="glass flex items-center justify-center gap-2 rounded-xl py-3 transition hover:bg-white/10">
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  <span className="text-xs font-medium">Apple</span>
                </button>
              </div>

            </div>

            <p className="mt-8 text-center text-sm text-white/60">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#D4AF37] hover:text-[#F5D77A] font-semibold transition">Sign up</Link>
            </p>
          </div>
          
          {/* Footer links */}
          <div className="absolute bottom-6 w-full px-6 flex justify-between text-[11px] text-white/40">
            <span>© {new Date().getFullYear()} LocalBoost AI</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white/80 transition">Privacy Policy</a>
              <a href="#" className="hover:text-white/80 transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
