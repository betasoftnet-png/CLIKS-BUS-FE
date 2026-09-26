import React from 'react';

/**
 * ReferralBanner - Promotional Hero Banner for Refer & Earn Premium
 */
export const ReferralBanner = ({ pointsBalance }) => {
  return (
    /* GREEN REFERRAL HERO BANNER */
    <div className="bg-[#0e4b34] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
      <div className="space-y-3 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-[10px] font-black tracking-wider uppercase backdrop-blur-xs">
          <span>✨</span>
          <span>CLIKS PARTNER NETWORK</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Refer &amp; Earn Premium
        </h2>

        {/* UPDATED COPY: Single reward line with 200 Points */}
        <div className="space-y-1 pt-1">
          <p className="text-xs sm:text-sm font-semibold text-emerald-100 flex items-center gap-2">
            <span>🎁</span>
            <span>You earn 200 Points when your referral becomes active.</span>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: REFERRAL POINTS BALANCE CARD */}
      <div className="bg-white/10 border border-white/15 rounded-2xl p-5 min-w-[220px] text-center backdrop-blur-sm self-stretch md:self-auto flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-lg mx-auto mb-2">
          🪙
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
          REFERRAL POINTS BALANCE
        </span>
        <span className="text-2xl font-black text-white block mt-0.5">
          {pointsBalance ?? 100}
        </span>
        <span className="text-[10px] text-emerald-200/80 font-medium block mt-1">
          0 Points Pending 🕒
        </span>
      </div>
    </div>
  );
};

export default ReferralBanner;
