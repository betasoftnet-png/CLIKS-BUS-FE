import React, { useState } from 'react';

import { 
    Send, 
    MessageSquare, 
    Users, 
    Target, 
    BarChart3, 
    Smartphone,
    Megaphone,
    CheckCircle2,
    Clock,
    Layout,
    Plus,
    X,
    Search,
    Filter,
    Tag,
    Calendar,
    TrendingUp,
    Percent,
    Award,
    Shield,
    Trash2,
    Edit,
    Sparkles,
    Mail,
    FileText,
    Layers,
    User,
    Check,
    RefreshCw,
    Briefcase,
    Zap
} from 'lucide-react';
import '../App.css';

// Pre-defined initial mock campaigns with all required fields
const INITIAL_CAMPAIGNS = [
    {
        campaign_id: 'CAMP-001',
        campaign_name: 'Festival Dhamaka 2026',
        campaign_type: 'WhatsApp',
        campaign_status: 'Sent',
        target_audience: 'Repeat Customers',
        customer_segment: 'VIP Customers',
        total_recipients: 1240,
        location_filter: 'Mumbai, Pune, Bangalore',
        offer_type: 'discount',
        coupon_code: 'FESTIVAL20',
        discount_percentage: 20,
        offer_validity: '2026-05-15',
        minimum_purchase: 1500,
        message_title: 'Special Festival Greetings from CLIKS!',
        message_content: 'Hi {name},\nCelebrate this festive season with an exclusive 20% OFF on all purchases. Use coupon FESTIVAL20 at checkout today!',
        whatsapp_template: 'festival_promo_v2',
        sms_template: '',
        email_template: '',
        scheduled_date: '2026-05-01',
        scheduled_time: '10:00 AM',
        recurring_campaign: false,
        recurrence_frequency: 'none',
        sent_count: 1240,
        delivered_count: 1210,
        opened_count: 1045,
        clicked_count: 654,
        conversion_count: 188,
        roi_percentage: 245,
        trigger_event: 'none',
        automation_status: 'inactive',
        auto_send_enabled: false,
        reward_points: 50,
        referral_code: 'REF-FEST20',
        referral_bonus: 100,
        campaign_owner: 'Arun Kumar (Marketing Head)',
        assigned_salesperson: 'Rohan Shah',
        lead_conversion_rate: 15.1
    },
    {
        campaign_id: 'CAMP-002',
        campaign_name: 'We Miss You - Retargeting',
        campaign_type: 'SMS',
        campaign_status: 'Sent',
        target_audience: 'Inactive Customers',
        customer_segment: 'Lapsed Buyers',
        total_recipients: 180,
        location_filter: 'Pan India',
        offer_type: 'cashback',
        coupon_code: 'WELCOMEBACK',
        discount_percentage: 10,
        offer_validity: '2026-05-30',
        minimum_purchase: 500,
        message_title: 'We miss you!',
        message_content: 'Hi {name},\nWe miss you at CLIKS! Here is a flat 10% cashback on your next purchase. Valid till 30th May.',
        whatsapp_template: '',
        sms_template: 'retargeting_sms_v1',
        email_template: '',
        scheduled_date: '2026-05-03',
        scheduled_time: '04:30 PM',
        recurring_campaign: false,
        recurrence_frequency: 'none',
        sent_count: 180,
        delivered_count: 178,
        opened_count: 110,
        clicked_count: 45,
        conversion_count: 14,
        roi_percentage: 112,
        trigger_event: 'none',
        automation_status: 'inactive',
        auto_send_enabled: false,
        reward_points: 20,
        referral_code: 'REF-MISS10',
        referral_bonus: 50,
        campaign_owner: 'Arun Kumar (Marketing Head)',
        assigned_salesperson: 'Sanjana Roy',
        lead_conversion_rate: 7.7
    },
    {
        campaign_id: 'CAMP-003',
        campaign_name: 'Summer Clearance Sale',
        campaign_type: 'Email',
        campaign_status: 'Scheduled',
        target_audience: 'All Customers',
        customer_segment: 'Retail Customers',
        total_recipients: 3450,
        location_filter: 'All Regions',
        offer_type: 'discount',
        coupon_code: 'SUMMER40',
        discount_percentage: 40,
        offer_validity: '2026-06-15',
        minimum_purchase: 2000,
        message_title: '☀️ CLIKS Summer Clearance - Flat 40% OFF!',
        message_content: 'Hi {name},\nBeat the heat with our massive Summer Clearance Sale. Enjoy up to 40% discount on summer collections. Code: SUMMER40.',
        whatsapp_template: '',
        sms_template: '',
        email_template: 'summer_clearance_html',
        scheduled_date: '2026-05-15',
        scheduled_time: '09:00 AM',
        recurring_campaign: true,
        recurrence_frequency: 'weekly',
        sent_count: 0,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        conversion_count: 0,
        roi_percentage: 0,
        trigger_event: 'none',
        automation_status: 'inactive',
        auto_send_enabled: false,
        reward_points: 80,
        referral_code: 'REF-SUMMER',
        referral_bonus: 150,
        campaign_owner: 'Deepak Rao (Sales Exec)',
        assigned_salesperson: 'Amit Sharma',
        lead_conversion_rate: 0
    },
    {
        campaign_id: 'CAMP-004',
        campaign_name: 'Automated Birthday Celebration',
        campaign_type: 'WhatsApp',
        campaign_status: 'Draft',
        target_audience: 'All Customers',
        customer_segment: 'Birthday VIPs',
        total_recipients: 45,
        location_filter: 'All Regions',
        offer_type: 'discount',
        coupon_code: 'HAPPYBDAY',
        discount_percentage: 15,
        offer_validity: 'Valid on Birthday',
        minimum_purchase: 1000,
        message_title: '🎂 Happy Birthday from CLIKS!',
        message_content: 'Happy Birthday {name}! Wishing you a wonderful year ahead. Enjoy 15% discount on us today. Use code HAPPYBDAY.',
        whatsapp_template: 'birthday_auto_v1',
        sms_template: '',
        email_template: '',
        scheduled_date: 'Auto Trigger',
        scheduled_time: '09:30 AM',
        recurring_campaign: true,
        recurrence_frequency: 'daily',
        sent_count: 45,
        delivered_count: 45,
        opened_count: 42,
        clicked_count: 28,
        conversion_count: 12,
        roi_percentage: 185,
        trigger_event: 'birthday',
        automation_status: 'active',
        auto_send_enabled: true,
        reward_points: 100,
        referral_code: 'REF-BDAY',
        referral_bonus: 200,
        campaign_owner: 'System Auto-Trigger',
        assigned_salesperson: 'Auto Assignment',
        lead_conversion_rate: 26.6
    }
];

const PREMADE_TEMPLATES = [
    { id: 't1', title: 'Festival Discount', body: 'Hi {name}, celebrate Diwali/New Year with 20% OFF using code FEST20. Valid till Monday!', type: 'WhatsApp', label: 'Festival Offer' },
    { id: 't2', title: 'Abandoned Cart', body: 'Hey {name}, you left something behind! Complete your order now and get 5% additional discount. Code: CART5', type: 'SMS', label: 'Automation' },
    { id: 't3', title: 'Product Launch Newsletter', body: 'Dear {name}, we are thrilled to introduce our new laptop line up. Enjoy exclusive wholesale pre-booking pricing inside.', type: 'Email', label: 'Promotional' },
    { id: 't4', title: 'Birthday Special', body: 'Happy Birthday {name}! Grab 15% OFF on your special day using code BDAY15.', type: 'WhatsApp', label: 'Birthday' },
    { id: 't5', title: 'Quick Feedback Request', body: 'Hi {name}, how was your shopping experience? Rate us to earn 50 reward points instantly!', type: 'SMS', label: 'Engagement' }
];

const BusinessMarketing = () => {
    const [campaigns, setCampaigns] = useState(() => {
        const local = localStorage.getItem('cliks_campaigns');
        return local ? JSON.parse(local) : INITIAL_CAMPAIGNS;
    });

    const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'templates' | 'automation' | 'segments' | 'reports'
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // New Campaign Form State with all required fields
    const [formData, setFormData] = useState({
        campaign_name: '',
        campaign_type: 'WhatsApp',
        campaign_status: 'Draft',
        target_audience: 'All Customers',
        customer_segment: 'Retail Customers',
        total_recipients: 100,
        location_filter: 'All Regions',
        offer_type: 'discount',
        coupon_code: '',
        discount_percentage: 10,
        offer_validity: '',
        minimum_purchase: 500,
        message_title: '',
        message_content: '',
        whatsapp_template: '',
        sms_template: '',
        email_template: '',
        scheduled_date: '',
        scheduled_time: '',
        recurring_campaign: false,
        recurrence_frequency: 'none',
        trigger_event: 'none',
        automation_status: 'inactive',
        auto_send_enabled: false,
        reward_points: 0,
        referral_code: '',
        referral_bonus: 0,
        campaign_owner: 'Admin',
        assigned_salesperson: 'Sales Team',
    });

    const saveToLocalStorage = (updated) => {
        setCampaigns(updated);
        localStorage.setItem('cliks_campaigns', JSON.stringify(updated));
    };

    const handleCreateCampaign = (e) => {
        e.preventDefault();
        const newCamp = {
            ...formData,
            campaign_id: `CAMP-${Date.now().toString().slice(-4)}`,
            sent_count: formData.campaign_status === 'Sent' ? formData.total_recipients : 0,
            delivered_count: formData.campaign_status === 'Sent' ? Math.floor(formData.total_recipients * 0.98) : 0,
            opened_count: formData.campaign_status === 'Sent' ? Math.floor(formData.total_recipients * 0.75) : 0,
            clicked_count: formData.campaign_status === 'Sent' ? Math.floor(formData.total_recipients * 0.45) : 0,
            conversion_count: formData.campaign_status === 'Sent' ? Math.floor(formData.total_recipients * 0.12) : 0,
            roi_percentage: formData.campaign_status === 'Sent' ? 120 : 0,
            lead_conversion_rate: formData.campaign_status === 'Sent' ? 12.0 : 0
        };

        const updated = [newCamp, ...campaigns];
        saveToLocalStorage(updated);
        setIsComposeOpen(false);
        // Reset Form
        setFormData({
            campaign_name: '',
            campaign_type: 'WhatsApp',
            campaign_status: 'Draft',
            target_audience: 'All Customers',
            customer_segment: 'Retail Customers',
            total_recipients: 100,
            location_filter: 'All Regions',
            offer_type: 'discount',
            coupon_code: '',
            discount_percentage: 10,
            offer_validity: '',
            minimum_purchase: 500,
            message_title: '',
            message_content: '',
            whatsapp_template: '',
            sms_template: '',
            email_template: '',
            scheduled_date: '',
            scheduled_time: '',
            recurring_campaign: false,
            recurrence_frequency: 'none',
            trigger_event: 'none',
            automation_status: 'inactive',
            auto_send_enabled: false,
            reward_points: 0,
            referral_code: '',
            referral_bonus: 0,
            campaign_owner: 'Admin',
            assigned_salesperson: 'Sales Team',
        });
    };

    const handleDeleteCampaign = (id) => {
        if (confirm('Are you sure you want to delete this campaign?')) {
            const updated = campaigns.filter(c => c.campaign_id !== id);
            saveToLocalStorage(updated);
            if (selectedCampaign?.campaign_id === id) {
                setIsDetailsOpen(false);
                setSelectedCampaign(null);
            }
        }
    };

    // Derived Statistics
    const totalSentCampaigns = campaigns.filter(c => c.campaign_status === 'Sent' || c.sent_count > 0).length;
    const totalRecipientsReached = campaigns.reduce((sum, c) => sum + c.sent_count, 0);
    const avgConversionRate = (campaigns.filter(c => c.sent_count > 0).reduce((sum, c) => sum + c.lead_conversion_rate, 0) / (totalSentCampaigns || 1)).toFixed(1);
    const avgROI = Math.round(campaigns.filter(c => c.sent_count > 0).reduce((sum, c) => sum + c.roi_percentage, 0) / (totalSentCampaigns || 1));

    const filteredCampaigns = campaigns.filter(c => {
        const matchesSearch = c.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              c.coupon_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              c.customer_segment.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'All' || c.campaign_type === typeFilter;
        const matchesStatus = statusFilter === 'All' || c.campaign_status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const triggerManualLaunch = (camp) => {
        const updated = campaigns.map(c => {
            if (c.campaign_id === camp.campaign_id) {
                return {
                    ...c,
                    campaign_status: 'Sent',
                    sent_count: c.total_recipients,
                    delivered_count: Math.floor(c.total_recipients * 0.98),
                    opened_count: Math.floor(c.total_recipients * 0.82),
                    clicked_count: Math.floor(c.total_recipients * 0.50),
                    conversion_count: Math.floor(c.total_recipients * 0.15),
                    roi_percentage: 180,
                    lead_conversion_rate: 15.0
                };
            }
            return c;
        });
        saveToLocalStorage(updated);
        alert(`Campaign "${camp.campaign_name}" launched successfully to ${camp.total_recipients} customers via ${camp.campaign_type}!`);
    };

    return (
        <div style={{ padding: '2rem 2.5rem', background: '#FAFDFB', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>
            {/* Header section with Premium Aesthetic */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)' }}>
                            <Megaphone size={22} className="animate-pulse" />
                        </div>
                        <h1 style={{ fontSize: '1.85rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Campaigns & Engagement</h1>
                    </div>
                    <p style={{ color: '#64748B', fontWeight: '500', fontSize: '0.95rem' }}>Automate bulk SMS, WhatsApp and Email promotions to maximize sales and bring back repeat buyers.</p>
                </div>
                <button 
                    onClick={() => setIsComposeOpen(true)}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem', 
                        borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                        color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer',
                        boxShadow: '0 8px 16px rgba(27, 107, 58, 0.25)', transition: 'all 0.2s ease-in-out'
                    }}
                >
                    <Plus size={18} /> Create Campaign
                </button>
            </div>

            {/* Premium Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E8F5EE', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Reach</span>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(27, 107, 58, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                            <Users size={18} />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.25rem' }}>{totalRecipientsReached.toLocaleString()}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#1B6B3A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={12} /> Active target database
                    </p>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E8F5EE', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg. ROI</span>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(13, 148, 136, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9488' }}>
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.25rem' }}>{avgROI}%</h3>
                    <p style={{ fontSize: '0.8rem', color: '#0D9488', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Sparkles size={12} /> High-converting channels
                    </p>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E8F5EE', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Automations</span>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                            <Clock size={18} />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.25rem' }}>{campaigns.filter(c => c.automation_status === 'active').length}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#3B82F6', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Zap size={12} /> Birthdays & Follow-ups
                    </p>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E8F5EE', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conv. Rate</span>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(6, 78, 59, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#064E3B' }}>
                            <Target size={18} />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.25rem' }}>{avgConversionRate}%</h3>
                    <p style={{ fontSize: '0.8rem', color: '#064E3B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Award size={12} /> Industry standard is 5-8%
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.25rem', marginBottom: '2rem' }}>
                <button 
                    onClick={() => setActiveTab('campaigns')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'campaigns' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'campaigns' ? '3px solid #1B6B3A' : '3px solid transparent', transition: 'all 0.2s' }}
                >
                    📢 All Campaigns
                </button>
                <button 
                    onClick={() => setActiveTab('templates')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'templates' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'templates' ? '3px solid #1B6B3A' : '3px solid transparent', transition: 'all 0.2s' }}
                >
                    💬 Message Templates
                </button>
                <button 
                    onClick={() => setActiveTab('automation')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'automation' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'automation' ? '3px solid #1B6B3A' : '3px solid transparent', transition: 'all 0.2s' }}
                >
                    ⚙️ Trigger Automations
                </button>
                <button 
                    onClick={() => setActiveTab('segments')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'segments' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'segments' ? '3px solid #1B6B3A' : '3px solid transparent', transition: 'all 0.2s' }}
                >
                    👥 Audience & Loyalty
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'reports' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'reports' ? '3px solid #1B6B3A' : '3px solid transparent', transition: 'all 0.2s' }}
                >
                    📊 Advanced ROI Reports
                </button>
            </div>

            {/* TAB CONTENT: 1. ALL CAMPAIGNS */}
            {activeTab === 'campaigns' && (
                <div>
                    {/* Filter & Search Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                            <Search size={18} style={{ color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search campaigns by name, coupon code or target audience..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ width: '100%', border: 'none', outline: 'none', fontWeight: '500', fontSize: '0.9rem', color: '#1E293B' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Filter size={16} style={{ color: '#94A3B8' }} />
                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B' }}>Type:</span>
                            </div>
                            <select 
                                value={typeFilter} 
                                onChange={e => setTypeFilter(e.target.value)}
                                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontWeight: '600', outline: 'none', fontSize: '0.85rem' }}
                            >
                                <option value="All">All Types</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="SMS">SMS</option>
                                <option value="Email">Email</option>
                            </select>

                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B' }}>Status:</span>
                            <select 
                                value={statusFilter} 
                                onChange={e => setStatusFilter(e.target.value)}
                                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontWeight: '600', outline: 'none', fontSize: '0.85rem' }}
                            >
                                <option value="All">All Status</option>
                                <option value="Sent">Sent</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                    </div>

                    {/* Campaigns Grid/List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredCampaigns.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', color: '#64748B' }}>
                                <Megaphone size={48} style={{ margin: '0 auto 1rem', color: '#94A3B8' }} />
                                <h4 style={{ fontWeight: '800', color: '#1E293B', marginBottom: '0.25rem' }}>No Campaigns Found</h4>
                                <p style={{ fontSize: '0.85rem' }}>Create a new campaign to get started with bulk customer promotions.</p>
                            </div>
                        ) : (
                            filteredCampaigns.map((camp) => (
                                <div 
                                    key={camp.campaign_id}
                                    style={{ 
                                        background: 'white', padding: '1.5rem', borderRadius: '20px', 
                                        border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                        {/* Icon representation depending on type */}
                                        <div style={{ 
                                            width: '50px', height: '50px', borderRadius: '12px', 
                                            background: camp.campaign_type === 'WhatsApp' ? '#E8F5EE' : camp.campaign_type === 'Email' ? '#EFF6FF' : '#FFF7ED', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: camp.campaign_type === 'WhatsApp' ? '#1B6B3A' : camp.campaign_type === 'Email' ? '#3B82F6' : '#EA580C'
                                        }}>
                                            {camp.campaign_type === 'WhatsApp' ? <Smartphone size={24} /> : camp.campaign_type === 'Email' ? <Mail size={24} /> : <MessageSquare size={24} />}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B' }}>{camp.campaign_name}</h4>
                                                <span style={{ 
                                                    fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '6px',
                                                    background: camp.campaign_status === 'Sent' ? '#DCF2E4' : camp.campaign_status === 'Scheduled' ? '#EFF6FF' : '#F1F5F9',
                                                    color: camp.campaign_status === 'Sent' ? '#1B6B3A' : camp.campaign_status === 'Scheduled' ? '#3B82F6' : '#475569'
                                                }}>
                                                    {camp.campaign_status}
                                                </span>
                                                {camp.recurring_campaign && (
                                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '6px', background: '#FEF3C7', color: '#D97706' }}>
                                                        🔄 {camp.recurrence_frequency}
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '500' }}>
                                                ID: <strong style={{ color: '#334155' }}>{camp.campaign_id}</strong> • Segment: <strong style={{ color: '#334155' }}>{camp.customer_segment} ({camp.total_recipients} customers)</strong>
                                                {camp.coupon_code && <> • Coupon: <span style={{ color: '#1B6B3A', background: '#E8F5EE', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '750' }}>{camp.coupon_code}</span></>}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action items */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        {camp.campaign_status === 'Sent' ? (
                                            <div style={{ textAlign: 'right', marginRight: '1rem' }}>
                                                <div style={{ fontSize: '0.95rem', fontWeight: '850', color: '#1B6B3A' }}>{camp.roi_percentage}% ROI</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>{camp.conversion_count} Conversions ({camp.lead_conversion_rate}%)</div>
                                            </div>
                                        ) : (
                                            <div style={{ marginRight: '1rem' }}>
                                                <button 
                                                    onClick={() => triggerManualLaunch(camp)}
                                                    style={{ background: '#1B6B3A', border: 'none', color: 'white', padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '750', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                >
                                                    <Send size={12} /> Launch Now
                                                </button>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => { setSelectedCampaign(camp); setIsDetailsOpen(true); }}
                                            style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.5rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', color: '#475569' }}
                                        >
                                            Details & Analytics
                                        </button>

                                        <button 
                                            onClick={() => handleDeleteCampaign(camp.campaign_id)}
                                            style={{ background: 'none', border: 'none', padding: '0.5rem', color: '#EF4444', cursor: 'pointer', borderRadius: '8px' }}
                                            title="Delete Campaign"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: 2. TEMPLATES */}
            {activeTab === 'templates' && (
                <div>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#064E3B', marginBottom: '0.25rem' }}>Verified Message Templates</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Choose from highly optimized templates ready for instant dispatch.</p>
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: '750', color: '#1B6B3A', background: '#E8F5EE', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>
                                DLT approved for Indian compliance
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                            {PREMADE_TEMPLATES.map((temp) => (
                                <div key={temp.id} style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '800', background: temp.type === 'WhatsApp' ? '#1B6B3A' : temp.type === 'Email' ? '#3B82F6' : '#EA580C', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                                {temp.type}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', background: '#F1F5F9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                                {temp.label}
                                            </span>
                                        </div>
                                        <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.5rem' }}>{temp.title}</h5>
                                        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', fontStyle: 'italic', background: 'white', padding: '0.75rem', borderRadius: '10px', border: '1px dashed #CBD5E1', marginBottom: '1rem' }}>
                                            "{temp.body}"
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                campaign_name: `${temp.title} Campaign`,
                                                campaign_type: temp.type,
                                                message_content: temp.body,
                                                whatsapp_template: temp.type === 'WhatsApp' ? 'verified_marketing_v1' : '',
                                                sms_template: temp.type === 'SMS' ? 'dlts_sms_v1' : '',
                                                email_template: temp.type === 'Email' ? 'html_newsletter_v1' : ''
                                            });
                                            setIsComposeOpen(true);
                                        }}
                                        style={{ width: '100%', background: 'white', border: '1px solid #1B6B3A', color: '#1B6B3A', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '750', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        Use This Template
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: 3. AUTOMATION */}
            {activeTab === 'automation' && (
                <div>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#064E3B', marginBottom: '0.25rem' }}>Marketing & Engagement Automations</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Configure automated messages triggered by key customer life-cycle events.</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setFormData({ ...formData, recurring_campaign: true, automation_status: 'active', auto_send_enabled: true });
                                    setIsComposeOpen(true);
                                }}
                                style={{ background: '#1B6B3A', border: 'none', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                                <Plus size={16} style={{ marginRight: '0.25rem', display: 'inline' }} /> Configure New Trigger
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {[
                                { event: 'Birthday Wish', trigger: 'customer_birthday', channel: 'WhatsApp', delay: 'Instant (09:00 AM)', active: true, sent: 45, conversions: 12 },
                                { event: 'Anniversary Wish', trigger: 'customer_anniversary', channel: 'SMS', delay: 'Instant (10:00 AM)', active: true, sent: 12, conversions: 3 },
                                { event: 'Payment Follow-up', trigger: 'invoice_due', channel: 'WhatsApp/SMS', delay: '2 Days after due date', active: true, sent: 340, conversions: 298 },
                                { event: 'Abandoned Cart', trigger: 'cart_abandoned', channel: 'WhatsApp', delay: '4 Hours after abandonment', active: false, sent: 0, conversions: 0 }
                            ].map((auto, idx) => (
                                <div key={idx} style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #F1F5F9', background: auto.active ? '#FAFDFB' : '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: auto.active ? '#DCF2E4' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: auto.active ? '#1B6B3A' : '#64748B' }}>
                                            <Zap size={18} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontWeight: '800', color: '#1E293B', marginBottom: '0.25rem' }}>{auto.event}</h4>
                                            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                                                Trigger: <strong style={{ color: '#334155' }}>{auto.trigger}</strong> • Channel: <strong style={{ color: '#334155' }}>{auto.channel}</strong> • Timing: <strong style={{ color: '#334155' }}>{auto.delay}</strong>
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '750', color: '#1B6B3A' }}>Sent: {auto.sent}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Conversions: {auto.conversions}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: auto.active ? '#1B6B3A' : '#EF4444', background: auto.active ? '#E8F5EE' : '#FEE2E2', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                                                {auto.active ? 'Active' : 'Paused'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: 4. SEGMENTS & LOYALTY */}
            {activeTab === 'segments' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Customer Segments</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { name: 'VIP Customers', desc: 'Customers with life-time purchase value > ₹25,000', count: 124, avgSpent: '₹34,500' },
                                { name: 'Active Retail Buyers', desc: 'Purchased in the last 30 days', count: 840, avgSpent: '₹4,200' },
                                { name: 'Inactive Lapsed Buyers', desc: 'No purchases in the last 90+ days', count: 180, avgSpent: '₹1,800' },
                                { name: 'Wholesale Partners', desc: 'Subscribed as verified business purchasers', count: 56, avgSpent: '₹1,12,000' }
                            ].map((seg, idx) => (
                                <div key={idx} style={{ padding: '1rem 1.25rem', borderRadius: '16px', background: '#FAFDFB', border: '1px solid #E8F5EE' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <h5 style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.95rem' }}>{seg.name}</h5>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1B6B3A', background: '#E8F5EE', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                            {seg.count} Buyers
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.5rem' }}>{seg.desc}</p>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>
                                        Avg Lifecycle Value: <span style={{ color: '#0F172A' }}>{seg.avgSpent}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>🎁 Loyalty & Referral Configuration</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ padding: '1.25rem', background: 'rgba(27, 107, 58, 0.05)', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <Award size={20} style={{ color: '#1B6B3A' }} />
                                    <h4 style={{ fontWeight: '800', color: '#064E3B' }}>Point Redemption Rules</h4>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.75rem' }}>Earn 1 point for every ₹100 spent. Each point is worth ₹1 at subsequent billings.</p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Min Redemption Points</span>
                                        <strong style={{ fontSize: '1rem', color: '#0F172A' }}>100 Points</strong>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Max Points Per Bill</span>
                                        <strong style={{ fontSize: '1rem', color: '#0F172A' }}>500 Points</strong>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1.25rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '16px', border: '1px solid #EFF6FF' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <Users size={20} style={{ color: '#3B82F6' }} />
                                    <h4 style={{ fontWeight: '800', color: '#1E3A8A' }}>Referral Bonus Programs</h4>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.75rem' }}>Reward current customers when they refer new buyers using custom referral codes.</p>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Referrer Reward</span>
                                        <strong style={{ fontSize: '0.95rem', color: '#1E3A8A' }}>₹100 Store Credit</strong>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Referred Buyer Reward</span>
                                        <strong style={{ fontSize: '0.95rem', color: '#1E3A8A' }}>Flat 10% OFF coupon</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: 5. ROI REPORTS */}
            {activeTab === 'reports' && (
                <div>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>📈 Channel Wise Campaign ROI Analysis</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#F0F9F4', border: '1px solid #DCF2E4' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontWeight: '800', color: '#1B6B3A' }}>WhatsApp Marketing</h4>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#1B6B3A', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>82% Open</span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Revenue Generated</span>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A' }}>₹1,84,500</h3>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#1B6B3A', fontWeight: '700' }}>
                                    Estimated ROI: <strong>284%</strong>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontWeight: '800', color: '#2563EB' }}>Email Campaigns</h4>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#2563EB', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>38% Open</span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Revenue Generated</span>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A' }}>₹94,200</h3>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: '700' }}>
                                    Estimated ROI: <strong>162%</strong>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#FFF7ED', border: '1px solid #FFEDD5' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontWeight: '800', color: '#EA580C' }}>SMS Marketing</h4>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#EA580C', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>96% Deliverability</span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Revenue Generated</span>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A' }}>₹42,800</h3>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#EA580C', fontWeight: '700' }}>
                                    Estimated ROI: <strong>118%</strong>
                                </div>
                            </div>
                        </div>

                        <h4 style={{ fontWeight: '800', color: '#1E293B', marginBottom: '1rem' }}>Campaign Performance Comparison</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {campaigns.filter(c => c.sent_count > 0).map((camp, idx) => (
                                <div key={idx} style={{ background: '#FAFDFB', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1E293B' }}>{camp.campaign_name}</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '750', color: '#1B6B3A' }}>ROI: {camp.roi_percentage}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.min(camp.roi_percentage / 3, 100)}%`, height: '100%', background: '#1B6B3A', borderRadius: '4px' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', marginTop: '0.4rem' }}>
                                        <span>Sent: {camp.sent_count} • Delivered: {camp.delivered_count}</span>
                                        <span>Conversions: {camp.conversion_count} ({camp.lead_conversion_rate}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* COMPOSE / CREATE CAMPAIGN MODAL WITH ALL Specification Fields */}
            {isComposeOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '780px', maxHeight: '90vh', borderRadius: '24px', overflowY: 'auto', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles style={{ color: '#1B6B3A' }} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>Compose New Marketing Campaign</h2>
                            </div>
                            <button onClick={() => setIsComposeOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* SECTION 1: BASIC CAMPAIGN FIELDS */}
                            <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>📌 1. Basic Campaign Information</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Campaign Name *</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.campaign_name} 
                                            onChange={e => setFormData({ ...formData, campaign_name: e.target.value })}
                                            placeholder="e.g. Diwali Premium Blast"
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Campaign Type</label>
                                        <select 
                                            value={formData.campaign_type} 
                                            onChange={e => setFormData({ ...formData, campaign_type: e.target.value })}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="WhatsApp">WhatsApp</option>
                                            <option value="SMS">SMS</option>
                                            <option value="Email">Email</option>
                                            <option value="Push Notification">Push Notification</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Campaign Status</label>
                                        <select 
                                            value={formData.campaign_status} 
                                            onChange={e => setFormData({ ...formData, campaign_status: e.target.value })}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Sent">Sent (Execute)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: AUDIENCE FIELDS */}
                            <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>👥 2. Target Audience & Segmentation</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Target Audience Group</label>
                                        <select 
                                            value={formData.target_audience} 
                                            onChange={e => setFormData({ ...formData, target_audience: e.target.value })}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="All Customers">All Customers</option>
                                            <option value="Repeat Customers">Repeat Customers</option>
                                            <option value="High-value Customers">High-value Customers</option>
                                            <option value="Inactive Customers">Inactive Customers</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Customer Segment</label>
                                        <input 
                                            type="text" 
                                            value={formData.customer_segment} 
                                            onChange={e => setFormData({ ...formData, customer_segment: e.target.value })}
                                            placeholder="VIP, Retailer, etc."
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Recipients Count</label>
                                        <input 
                                            type="number" 
                                            value={formData.total_recipients} 
                                            onChange={e => setFormData({ ...formData, total_recipients: parseInt(e.target.value) || 0 })}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Location Filter</label>
                                        <input 
                                            type="text" 
                                            value={formData.location_filter} 
                                            onChange={e => setFormData({ ...formData, location_filter: e.target.value })}
                                            placeholder="Mumbai, Pan India"
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: OFFER & PROMOTION FIELDS */}
                            <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>🎁 3. Offer & Promotion Configuration</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Offer Type</label>
                                        <select 
                                            value={formData.offer_type} 
                                            onChange={e => setFormData({ ...formData, offer_type: e.target.value })}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="discount">discount</option>
                                            <option value="cashback">cashback</option>
                                            <option value="coupon">coupon</option>
                                            <option value="none">none</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Coupon Code</label>
                                        <input 
                                            type="text" 
                                            value={formData.coupon_code} 
                                            onChange={e => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                                            placeholder="e.g. MEGA50"
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Discount %</label>
                                        <input 
                                            type="number" 
                                            value={formData.discount_percentage} 
                                            onChange={e => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Validity Expiry</label>
                                        <input 
                                            type="date" 
                                            value={formData.offer_validity} 
                                            onChange={e => setFormData({ ...formData, offer_validity: e.target.value })}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Min Purchase ₹</label>
                                        <input 
                                            type="number" 
                                            value={formData.minimum_purchase} 
                                            onChange={e => setFormData({ ...formData, minimum_purchase: parseInt(e.target.value) || 0 })}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 4: COMMUNICATION FIELDS */}
                            <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>💬 4. Communication & Message Copy</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Message Subject / Title</label>
                                            <input 
                                                type="text" 
                                                value={formData.message_title} 
                                                onChange={e => setFormData({ ...formData, message_title: e.target.value })}
                                                placeholder="e.g. Festival dhamaka special"
                                                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Verified Template Name (WhatsApp/DLT/SMS)</label>
                                            <input 
                                                type="text" 
                                                value={formData.whatsapp_template || formData.sms_template || formData.email_template} 
                                                onChange={e => setFormData({ 
                                                    ...formData, 
                                                    whatsapp_template: formData.campaign_type === 'WhatsApp' ? e.target.value : '',
                                                    sms_template: formData.campaign_type === 'SMS' ? e.target.value : '',
                                                    email_template: formData.campaign_type === 'Email' ? e.target.value : '',
                                                })}
                                                placeholder="e.g. dlt_promo_v1_approved"
                                                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Message Body Content *</label>
                                        <textarea 
                                            required
                                            value={formData.message_content} 
                                            onChange={e => setFormData({ ...formData, message_content: e.target.value })}
                                            placeholder="Use {name} for customer name injection. Write clear promotion copy..."
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', minHeight: '90px', fontFamily: 'inherit' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 5: SCHEDULING, AUTOMATION & LOYALTY */}
                            <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>⏰ 5. Scheduling, Loyalty Rewards & Trigger Automations</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Scheduled Date</label>
                                        <input 
                                            type="date" 
                                            value={formData.scheduled_date} 
                                            onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Scheduled Time</label>
                                        <input 
                                            type="text" 
                                            value={formData.scheduled_time} 
                                            onChange={e => setFormData({ ...formData, scheduled_time: e.target.value })}
                                            placeholder="e.g. 10:00 AM"
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Recurring Campaign?</label>
                                        <select 
                                            value={formData.recurring_campaign ? 'yes' : 'no'} 
                                            onChange={e => setFormData({ ...formData, recurring_campaign: e.target.value === 'yes' })}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="no">No (One time)</option>
                                            <option value="yes">Yes (Repeat)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Repeat Frequency</label>
                                        <select 
                                            value={formData.recurrence_frequency} 
                                            onChange={e => setFormData({ ...formData, recurrence_frequency: e.target.value })}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="none">none</option>
                                            <option value="daily">daily</option>
                                            <option value="weekly">weekly</option>
                                            <option value="monthly">monthly</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Trigger Event Automation</label>
                                        <select 
                                            value={formData.trigger_event} 
                                            onChange={e => setFormData({ 
                                                ...formData, 
                                                trigger_event: e.target.value,
                                                automation_status: e.target.value !== 'none' ? 'active' : 'inactive',
                                                auto_send_enabled: e.target.value !== 'none'
                                            })}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="none">none</option>
                                            <option value="birthday">birthday</option>
                                            <option value="anniversary">anniversary</option>
                                            <option value="purchase">purchase / invoice creation</option>
                                            <option value="cart_abandoned">cart abandoned</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Loyalty Points Granted</label>
                                        <input 
                                            type="number" 
                                            value={formData.reward_points} 
                                            onChange={e => setFormData({ ...formData, reward_points: parseInt(e.target.value) || 0 })}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Referral Promo Code</label>
                                        <input 
                                            type="text" 
                                            value={formData.referral_code} 
                                            onChange={e => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })}
                                            placeholder="REF-XXXX"
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Referral Bonus Reward ₹</label>
                                        <input 
                                            type="number" 
                                            value={formData.referral_bonus} 
                                            onChange={e => setFormData({ ...formData, referral_bonus: parseInt(e.target.value) || 0 })}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 6: SALES TEAM FIELDS */}
                            <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>👨💼 6. Marketing Owners & Sales Assignment</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Campaign Owner (Manager)</label>
                                        <input 
                                            type="text" 
                                            value={formData.campaign_owner} 
                                            onChange={e => setFormData({ ...formData, campaign_owner: e.target.value })}
                                            placeholder="e.g. Arun Kumar (Marketing Head)"
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Assigned Salesperson (Follow-up Rep)</label>
                                        <input 
                                            type="text" 
                                            value={formData.assigned_salesperson} 
                                            onChange={e => setFormData({ ...formData, assigned_salesperson: e.target.value })}
                                            placeholder="e.g. Rohan Shah"
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                style={{ 
                                    width: '100%', padding: '1.1rem', borderRadius: '12px', 
                                    background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                    color: 'white', border: 'none', fontWeight: '800', fontSize: '1.05rem', 
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    boxShadow: '0 8px 20px rgba(27, 107, 58, 0.25)', marginTop: '0.5rem'
                                }}
                            >
                                <Send size={18} /> Launch & Save Campaign
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* DETAIL & ANALYTICS DRAWER / MODAL */}
            {isDetailsOpen && selectedCampaign && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 1050, backdropFilter: 'blur(6px)' }}>
                    <div style={{ background: 'white', width: '600px', height: '100vh', overflowY: 'auto', padding: '2.5rem', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#E8F5EE', color: '#1B6B3A', padding: '0.2rem 0.5rem', borderRadius: '6px', textTransform: 'uppercase' }}>
                                    {selectedCampaign.campaign_type}
                                </span>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.4rem' }}>{selectedCampaign.campaign_name}</h3>
                            </div>
                            <button onClick={() => { setIsDetailsOpen(false); setSelectedCampaign(null); }} style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', flex: 1 }}>
                            {/* Analytics Performance Cards */}
                            {selectedCampaign.campaign_status === 'Sent' && (
                                <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>📊 Real-time Campaign Analytics</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                                        <div style={{ background: 'white', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                                            <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Sent / Delivered</span>
                                            <strong style={{ fontSize: '1rem', color: '#0F172A' }}>{selectedCampaign.sent_count} / {selectedCampaign.delivered_count}</strong>
                                        </div>
                                        <div style={{ background: 'white', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                                            <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Opened / Clicked</span>
                                            <strong style={{ fontSize: '1rem', color: '#0F172A' }}>{selectedCampaign.opened_count} / {selectedCampaign.clicked_count}</strong>
                                        </div>
                                        <div style={{ background: 'white', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                                            <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Conversions (ROI)</span>
                                            <strong style={{ fontSize: '1rem', color: '#1B6B3A' }}>{selectedCampaign.conversion_count} ({selectedCampaign.roi_percentage}%)</strong>
                                        </div>
                                    </div>
                                    
                                    {/* Progress meter */}
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '750', marginBottom: '0.25rem' }}>
                                            <span>Target Conversion Rate Achieved</span>
                                            <span style={{ color: '#1B6B3A' }}>{selectedCampaign.lead_conversion_rate}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${selectedCampaign.lead_conversion_rate * 3.5}%`, height: '100%', background: '#1B6B3A' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Campaign Details */}
                            <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.25rem' }}>📝 Content & Copywriting</h4>
                                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.5rem' }}>Subject: {selectedCampaign.message_title || 'N/A'}</div>
                                    <p style={{ fontSize: '0.85rem', color: '#334155', fontStyle: 'italic', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                                        "{selectedCampaign.message_content}"
                                    </p>
                                    {selectedCampaign.whatsapp_template && (
                                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748B' }}>
                                            Approved Template Name: <strong style={{ color: '#0F172A' }}>{selectedCampaign.whatsapp_template}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section: Audience targeting & Offer Details */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.25rem' }}>👥 Audience Group</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                                        <div>Audience Segment: <strong style={{ color: '#0F172A' }}>{selectedCampaign.customer_segment}</strong></div>
                                        <div>Target Reach: <strong style={{ color: '#0F172A' }}>{selectedCampaign.total_recipients} recipients</strong></div>
                                        <div>Location Focus: <strong style={{ color: '#0F172A' }}>{selectedCampaign.location_filter}</strong></div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.25rem' }}>🎁 Promo Code Details</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                                        <div>Offer Type: <strong style={{ color: '#0F172A' }}>{selectedCampaign.offer_type}</strong></div>
                                        <div>Coupon: <strong style={{ color: '#1B6B3A', background: '#E8F5EE', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{selectedCampaign.coupon_code || 'N/A'}</strong></div>
                                        <div>Discount: <strong style={{ color: '#0F172A' }}>{selectedCampaign.discount_percentage}% OFF</strong></div>
                                        <div>Min Purchase: <strong style={{ color: '#0F172A' }}>₹{selectedCampaign.minimum_purchase}</strong></div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Automation & Scheduling */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.25rem' }}>⏰ Dispatch & Schedule</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                                        <div>Date: <strong style={{ color: '#0F172A' }}>{selectedCampaign.scheduled_date || 'N/A'}</strong></div>
                                        <div>Time: <strong style={{ color: '#0F172A' }}>{selectedCampaign.scheduled_time || 'N/A'}</strong></div>
                                        <div>Recurring: <strong style={{ color: '#0F172A' }}>{selectedCampaign.recurring_campaign ? `Yes (${selectedCampaign.recurrence_frequency})` : 'No (One time)'}</strong></div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.25rem' }}>⚙️ Loyalty & Automation</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                                        <div>Points Granted: <strong style={{ color: '#0F172A' }}>{selectedCampaign.reward_points}</strong></div>
                                        <div>Referral Bonus: <strong style={{ color: '#0F172A' }}>₹{selectedCampaign.referral_bonus} ({selectedCampaign.referral_code || 'None'})</strong></div>
                                        <div>Auto-Trigger Event: <strong style={{ color: '#0F172A' }}>{selectedCampaign.trigger_event !== 'none' ? selectedCampaign.trigger_event : 'Manual Send'}</strong></div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Sales Team and Owners */}
                            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '1rem' }}>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>👨💼 Campaign Ownership</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                                    <div>Owner / Manager: <strong style={{ color: '#0F172A' }}>{selectedCampaign.campaign_owner}</strong></div>
                                    <div>Assigned Representative: <strong style={{ color: '#0F172A' }}>{selectedCampaign.assigned_salesperson}</strong></div>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', marginTop: '2rem' }}>
                            <button 
                                onClick={() => { setIsDetailsOpen(false); setSelectedCampaign(null); }}
                                style={{ width: '100%', background: '#F1F5F9', border: 'none', padding: '0.75rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '750', cursor: 'pointer', color: '#475569' }}
                            >
                                Close Details Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessMarketing;
