import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const AntiFraudRules = () => {
  const rules = [
    { title: 'Self-Referral Prevention', desc: 'A user cannot refer themselves or use their own referral code. Codes matching the logged-in account are automatically rejected.', status: 'Active Enforcement' },
    { title: 'Single Referral Code Limit', desc: 'Each new user account can only redeem a single referral code during setup.', status: 'Active Enforcement' },
    { title: 'Stage-Gated Reward Unlock', desc: 'Rewards are not issued immediately for simple registration. Registration remains Pending until setup and activation stages complete.', status: 'Active Enforcement' },
    { title: 'Duplicate Reward Prevention', desc: 'Points are credited exactly ONCE per qualifying stage for each referred user. Re-triggering stages does not generate duplicate rewards.', status: 'Active Enforcement' },
    { title: 'Stage-Based Tracking', desc: 'Referrals transition dynamically across Registered (Pending) → Setup Complete (100 Pts) → Active (200 Pts).', status: 'Active Enforcement' }
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-xs">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          <ShieldAlert size={22} />
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-900 m-0">Strict Anti-Fraud Protection Rules</h3>
          <p className="text-xs text-gray-500 mt-0.5 m-0">Active security protocols safeguarding the Refer &amp; Earn ecosystem.</p>
        </div>
      </div>

      <div className="space-y-3">
        {rules.map((rule, idx) => (
          <div key={idx} className="bg-slate-50 border border-gray-200 p-4 rounded-2xl flex justify-between items-start gap-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900 m-0 mb-1">{idx + 1}. {rule.title}</h4>
              <p className="text-xs text-gray-500 m-0 leading-relaxed">{rule.desc}</p>
            </div>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
              ✓ {rule.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AntiFraudRules;
