import React, { useState } from 'react';

/**
 * ReferralShareModal - Share Pop-up Modal for Refer & Earn Premium
 * Binds dynamically to available points balance.
 */
export default function ReferralShareModal({
  isOpen,
  onClose,
  referralCode = 'CLIKS-BIZ-88512X',
  availablePoints = 100, // Pass dynamic points state from parent
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const referralUrl = `https://cliksbusiness.com/join?ref=${referralCode}`;

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(referralUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const text = `Join Cliks Business and supercharge your ledger today! Use my invite link: ${referralUrl}`;
    let url = '';
    if (platform === 'whatsapp') {
      url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;
    } else if (platform === 'linkedin') {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;
    } else if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    }
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* GREEN MODAL HEADER */}
        <div className="bg-[#0e4b34] p-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>

          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm">
            🎁
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            Refer. Grow. Earn Premium.
          </h3>
          <p className="text-[11px] text-emerald-200 mt-1 font-medium max-w-xs mx-auto">
            Refer a business owner → They join Cliks → They become active → You both earn rewards.
          </p>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-4">
          {/* UPDATED REWARD COPY */}
          <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-3 text-left">
            <p className="text-xs font-semibold text-emerald-900 flex items-center gap-2">
              <span>🎁</span>
              <span>You earn 200 Points when your referral becomes active.</span>
            </p>
          </div>

          {/* YOUR UNIQUE REFERRAL LINK */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
              Your Unique Referral Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{copied ? '✓' : '📋'}</span>
                <span>{copied ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
          </div>

          {/* SHARE INSTANTLY BUTTONS */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
              Share Instantly
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button 
                type="button" 
                onClick={() => handleShare('whatsapp')}
                className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>💬</span> WhatsApp
              </button>
              <button 
                type="button" 
                onClick={() => handleShare('facebook')}
                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>📘</span> Facebook
              </button>
              <button 
                type="button" 
                onClick={() => handleShare('linkedin')}
                className="py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>💼</span> LinkedIn
              </button>
              <button 
                type="button" 
                onClick={() => handleShare('twitter')}
                className="py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>🐦</span> Twitter
              </button>
            </div>
          </div>

          {/* FOOTER CTA */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#0e4b34] hover:bg-[#093625] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>✨</span>
            <span>View Referral Dashboard</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export { ReferralShareModal };
