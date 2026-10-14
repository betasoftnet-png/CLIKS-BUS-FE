import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, loyaltyService } from '../services';

import { Toggle } from '../components/ui/toggle';
import { Bell, Shield, Globe, Save, Sliders, Award, Check, AlertCircle, Loader2 } from 'lucide-react';

import { useLanguage } from '../context';

const Settings = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t, setLanguage } = useLanguage();
    const [saveFeedback, setSaveFeedback] = useState(null);
    const [localSettings, setLocalSettings] = useState({
        notifications: true,
        emailDigest: false,
        darkMode: false,
        language: 'EN-US',
        twoFactor: true,
        dataSharing: false,
        loyaltyEnabled: true,
        loyalty: true,
        loyaltyRsPer1Point: 100,
        loyaltyPointsPer1Rs: 100,
        loyaltyMaxClaimPercent: 50
    });

    const { data: serverSettings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsService.getSettings
    });

    React.useEffect(() => {
        if (serverSettings) {
            const settingsObj = serverSettings.data || serverSettings;
            const loyaltyVal = (settingsObj.loyaltyEnabled !== undefined) ? settingsObj.loyaltyEnabled : (settingsObj.loyalty !== undefined ? settingsObj.loyalty : undefined);
            setLocalSettings(prev => {
                const merged = {
                    ...prev,
                    ...settingsObj
                };
                if (loyaltyVal !== undefined) {
                    merged.loyaltyEnabled = Boolean(loyaltyVal);
                    merged.loyalty = Boolean(loyaltyVal);
                }
                return merged;
            });
        }
    }, [serverSettings]);

    const mutation = useMutation({
        mutationFn: async (data) => {
            const res = await settingsService.updateSettings(data);
            try {
                await loyaltyService.updateProgramSettings({
                    loyaltyEnabled: data.loyaltyEnabled,
                    loyalty: data.loyaltyEnabled,
                    loyaltyRsPer1Point: data.loyaltyRsPer1Point,
                    loyaltyPointsPer1Rs: data.loyaltyPointsPer1Rs,
                    loyaltyMaxClaimPercent: data.loyaltyMaxClaimPercent
                });
            } catch (syncErr) {
                console.warn('[Settings] Syncing loyalty program settings notice:', syncErr?.message || syncErr);
            }
            return res;
        },
        onSuccess: (res, variables) => {
            queryClient.setQueryData(['settings'], (old) => {
                const existing = old?.data || old || {};
                return { ...existing, ...variables };
            });
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            queryClient.invalidateQueries({ queryKey: ['loyalty-program-settings'] });
            setSaveFeedback({ type: 'success', message: 'Preferences saved successfully!' });
            setTimeout(() => setSaveFeedback(null), 3500);
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || err?.message || 'Failed to save settings. Please check backend connection.';
            setSaveFeedback({ type: 'error', message: msg });
            setTimeout(() => setSaveFeedback(null), 5000);
        }
    });

    const handleToggle = (key) => {
        setLocalSettings(prev => {
            const updated = { ...prev, [key]: !prev[key] };
            if (key === 'loyaltyEnabled') {
                updated.loyalty = updated.loyaltyEnabled;
            } else if (key === 'loyalty') {
                updated.loyaltyEnabled = updated.loyalty;
            }
            if (key === 'darkMode') {
                localStorage.setItem('cliks_dark_mode', String(updated.darkMode));
                if (updated.darkMode) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.classList.add('dark-theme', 'dark');
                    document.body.classList.add('dark-theme', 'dark');
                } else {
                    document.documentElement.removeAttribute('data-theme');
                    document.documentElement.classList.remove('dark-theme', 'dark');
                    document.body.classList.remove('dark-theme', 'dark');
                }
            }
            // Broadcast event for UI reactivity
            window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: updated }));

            // Immediately persist toggle to backend database
            settingsService.updateSettings(updated).then(() => {
                queryClient.invalidateQueries({ queryKey: ['settings'] });
                queryClient.invalidateQueries({ queryKey: ['loyalty-program-settings'] });
            }).catch(err => console.warn('[Settings] Failed to save toggle to backend:', err));

            return updated;
        });
    };

    const handleLanguageChange = (val) => {
        setLocalSettings(prev => {
            const updated = { ...prev, language: val };
            setLanguage(val);
            localStorage.setItem('cliks_language', val);
            document.documentElement.setAttribute('lang', val);
            window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: updated }));
            settingsService.updateSettings(updated).then(() => {
                queryClient.invalidateQueries({ queryKey: ['settings'] });
            }).catch(err => console.warn('[Settings] Failed to save language:', err));
            return updated;
        });
    };

    const handleSave = () => {
        const payload = {
            ...localSettings,
            loyalty: localSettings.loyaltyEnabled
        };
        mutation.mutate(payload);
        window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: payload }));
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #DCF2E4', borderTopColor: '#1B6B3A', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.5rem' }}>Settings</h1>
                    <p style={{ color: '#64748B' }}>Manage your application preferences and system configurations.</p>
                </div>
                <button 
                    onClick={() => navigate('/customization')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'white', border: '1px solid #e2e8f0',
                        padding: '0.6rem 1rem', borderRadius: '8px', 
                        color: '#1E293B', fontWeight: '700', fontSize: '0.85rem',
                        cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s'
                    }}
                >
                    <Sliders size={16} style={{ color: 'var(--primary)' }} />
                    Customization
                </button>
            </div>

            <SettingSection title="Preferences" icon={Globe}>
                <SettingItem
                    label="Dark Mode"
                    description="Use a dark theme for the application interface."
                    isToggled={localSettings.darkMode}
                    onToggle={() => handleToggle('darkMode')}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem' }}>
                    <div>
                        <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Language</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748B' }}>System localization language</div>
                    </div>
                    <select 
                        value={localSettings.language || 'EN-US'} 
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontWeight: '750', color: '#1E293B', cursor: 'pointer', outline: 'none' }}
                    >
                        <option value="EN-US">EN-US (English)</option>
                        <option value="HI-IN">HI-IN (Hindi)</option>
                        <option value="TA-IN">TA-IN (Tamil)</option>
                        <option value="TE-IN">TE-IN (Telugu)</option>
                        <option value="MR-IN">MR-IN (Marathi)</option>
                        <option value="GU-IN">GU-IN (Gujarati)</option>
                    </select>
                </div>
            </SettingSection>

            <SettingSection title="Notifications" icon={Bell}>
                <SettingItem
                    label="Push Notifications"
                    description="Receive real-time alerts for updates and activities."
                    isToggled={localSettings.notifications}
                    onToggle={() => handleToggle('notifications')}
                />
                <SettingItem
                    label="Email Digest"
                    description="Receive a weekly summary of your financial activity."
                    isToggled={localSettings.emailDigest}
                    onToggle={() => handleToggle('emailDigest')}
                    last={true}
                />
            </SettingSection>

            <SettingSection title="Customer Loyalty Program" icon={Award}>
                <SettingItem
                    label="Enable Loyalty Points"
                    description="Reward customers with points for purchases."
                    isToggled={localSettings.loyaltyEnabled}
                    onToggle={() => handleToggle('loyaltyEnabled')}
                />
                {localSettings.loyaltyEnabled && (
                    <>
                        <SettingInputItem
                            label="Spend required for 1 point"
                            description="Amount in ₹ a customer must spend on an invoice to earn 1 loyalty point."
                            value={localSettings.loyaltyRsPer1Point !== undefined ? localSettings.loyaltyRsPer1Point : 100}
                            onChange={(e) => setLocalSettings(p => ({ ...p, loyaltyRsPer1Point: Number(e.target.value) }))}
                            addon="₹"
                        />
                        <SettingInputItem
                            label="Points per ₹1 discount"
                            description="Number of points required to get a ₹1 discount."
                            value={localSettings.loyaltyPointsPer1Rs !== undefined ? localSettings.loyaltyPointsPer1Rs : 100}
                            onChange={(e) => setLocalSettings(p => ({ ...p, loyaltyPointsPer1Rs: Number(e.target.value) }))}
                            addon="pts"
                        />
                        <SettingInputItem
                            label="Max Claim Percentage"
                            description="Maximum percentage of a customer's total points they can claim per invoice."
                            value={localSettings.loyaltyMaxClaimPercent}
                            onChange={(e) => setLocalSettings(p => ({ ...p, loyaltyMaxClaimPercent: Number(e.target.value) }))}
                            addon="%"
                            last={true}
                        />
                    </>
                )}
            </SettingSection>

            <SettingSection title="Privacy & Security" icon={Shield}>
                <SettingItem
                    label="Public Profile"
                    description="Allow other users on the platform to find you."
                    isToggled={localSettings.publicProfile}
                    onToggle={() => handleToggle('publicProfile')}
                />
                <SettingItem
                    label="Two-Factor Authentication"
                    description="Add an extra layer of security to your account."
                    isToggled={localSettings.twoFactor}
                    onToggle={() => handleToggle('twoFactor')}
                />
                <SettingItem
                    label="Data & Analytics"
                    description="Allow usage data to be collected to improve experience."
                    isToggled={localSettings.dataSharing}
                    onToggle={() => handleToggle('dataSharing')}
                    last={true}
                />
            </SettingSection>

            {saveFeedback && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.85rem 1.25rem',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    background: saveFeedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                    border: `1px solid ${saveFeedback.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                    color: saveFeedback.type === 'success' ? '#065F46' : '#991B1B'
                }}>
                    {saveFeedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span>{saveFeedback.message}</span>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button 
                    onClick={handleSave}
                    disabled={mutation.isPending || mutation.isLoading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 2rem',
                        background: (mutation.isPending || mutation.isLoading) ? '#94A3B8' : (saveFeedback?.type === 'success' ? '#16A34A' : 'var(--primary)'),
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: (mutation.isPending || mutation.isLoading) ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(27, 107, 58, 0.2)',
                        opacity: (mutation.isPending || mutation.isLoading) ? 0.65 : 1,
                        transition: 'all 0.2s ease'
                    }}
                >
                    {(mutation.isPending || mutation.isLoading) ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Saving Changes...</span>
                        </>
                    ) : saveFeedback?.type === 'success' ? (
                        <>
                            <Check size={18} />
                            <span>Saved!</span>
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            <span>Save Changes</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
const SettingSection = (props) => {
    const { title, icon: Icon, children } = props;
    return (
    <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', background: '#DBEAFE', borderRadius: '8px', color: 'var(--primary)' }}>
                <Icon size={20} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>{title}</h2>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            {children}
        </div>
    </div>
    );
};

const SettingItem = ({ label, description, isToggled, onToggle, last = false }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 1.5rem',
        borderBottom: last ? 'none' : '1px solid #F0FDF4'
    }}>
        <div style={{ marginRight: '1rem' }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{description}</div>
        </div>
        <Toggle
            checked={isToggled}
            onChange={onToggle}
            size="md"
            aria-label={label}
        />
    </div>
);

const SettingInputItem = ({ label, description, value, onChange, last = false, type = 'number', addon = '' }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 1.5rem',
        borderBottom: last ? 'none' : '1px solid #F0FDF4'
    }}>
        <div style={{ marginRight: '1rem', flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{description}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
                type={type} 
                value={value} 
                onChange={onChange}
                style={{ width: '80px', padding: '0.4rem 0.5rem', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }}
                min="0"
            />
            {addon && <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>{addon}</span>}
        </div>
    </div>
);

export default Settings;
