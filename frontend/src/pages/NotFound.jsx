import { Link } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {/* Background decor */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-[#D4AF37] opacity-20 blur-[140px]" />
        <div className="absolute bottom-0 right-[10%] h-[420px] w-[420px] rounded-full bg-[#F5D77A] opacity-15 blur-[140px]" />
      </div>

      <div className="max-w-md text-center">
        <div className="mx-auto mb-8 w-fit hover:opacity-80 transition-opacity">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <h1 className="font-display text-8xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-3 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="btn-cta inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" /> Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
