import BusinessReferral from './BusinessReferral';
import AntiFraudRules from '../components/referral/AntiFraudRules';

export const antiFraudRules = [
  {
    id: 1,
    title: '1. Self-Referral Prevention',
    desc: 'A user cannot refer themselves or use their own referral code. Codes matching the logged in account are automatically rejected.',
  },
  {
    id: 2,
    title: '2. Single Referral Code Limit',
    desc: 'Each new user account can only redeem a single referral code during setup.',
  },
  {
    id: 3,
    title: '3. Stage-Gated Reward Unlock',
    desc: 'Rewards are not issued immediately for simple registration. Registration remains Pending until setup and activation stages complete.',
  },
  {
    id: 4,
    title: '4. Duplicate Reward Prevention',
    desc: 'Points are credited exactly ONCE per qualifying stage for each referred user. Re-triggering stages does not generate duplicate rewards.',
  },
];

import ReferralShareModal from '../components/referral/ReferralShareModal';
import ShareInviteModal from '../components/referral/ShareInviteModal';

export { BusinessReferral, AntiFraudRules, ReferralShareModal, ShareInviteModal };
export default BusinessReferral;
