import React from 'react';
import { LogoMark } from '../common/Logo';
import { TRUSTED_BRANDS } from '../../constants';

export default function TrustedBy() {
  return (
    <section className="relative py-14">
      <p className="text-center text-sm text-muted-foreground">Trusted by 2,500+ local businesses across India</p>
      <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
        <div className="flex w-max gap-12 animate-marquee">
          {[...TRUSTED_BRANDS, ...TRUSTED_BRANDS].map((it, i) => (
            <div key={i} className="flex items-center gap-2 text-lg font-display font-semibold tracking-tight text-white/70">
              <LogoMark className="h-6 w-6 opacity-80" />
              {it}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
