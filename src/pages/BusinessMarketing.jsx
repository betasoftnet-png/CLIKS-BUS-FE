import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService, mailService, marketingService, settingsService } from '../services';

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
import { customConfirm } from '../utils/customConfirm';

// Pre-defined initial mock campaigns with all required fields
const INITIAL_CAMPAIGNS = [
    {
        campaign_id: 'CAMP-001',
        campaign_name: 'Festival Dhamaka 2026',
        campaign_type: 'Email',
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
        whatsapp_template: '',
        sms_template: '',
        email_template: 'festival_promo_html_v2',
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
        campaign_type: 'Email',
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
        sms_template: '',
        email_template: 'retargeting_html_v1',
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
        campaign_type: 'Email',
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
        whatsapp_template: '',
        sms_template: '',
        email_template: 'birthday_auto_email_v1',
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
    { id: 't1', title: 'Festival Discount Newsletter', body: 'Hi {name}, celebrate Diwali/New Year with 20% OFF using code FEST20. Valid till Monday!', type: 'Email', label: 'Festival Offer' },
    { id: 't2', title: 'Abandoned Cart Recovery', body: 'Hey {name}, you left something behind! Complete your order now and get 5% additional discount. Code: CART5', type: 'Email', label: 'Automation' },
    { id: 't3', title: 'Product Launch Newsletter', body: 'Dear {name}, we are thrilled to introduce our new laptop line up. Enjoy exclusive wholesale pre-booking pricing inside.', type: 'Email', label: 'Promotional' },
    { id: 't4', title: 'Birthday Gift Email', body: 'Happy Birthday {name}! Grab 15% OFF on your special day using code BDAY15.', type: 'Email', label: 'Birthday' },
    { id: 't5', title: 'Quick Feedback Survey', body: 'Hi {name}, how was your shopping experience? Rate us to earn 50 reward points instantly!', type: 'Email', label: 'Engagement' }
];

const BusinessMarketing = () => {
    const queryClient = useQueryClient();

    // 1. Fetch Campaigns from DB with 10s auto-refresh
    const { data: campaigns = [] } = useQuery({
        queryKey: ['marketing-campaigns'],
        queryFn: marketingService.getCampaigns,
        refetchInterval: 10000
    });

    // 2. Mutations
    const createMutation = useMutation({
        mutationFn: marketingService.createCampaign,
        onSuccess: () => queryClient.invalidateQueries(['marketing-campaigns'])
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => marketingService.updateCampaign(id, data),
        onSuccess: () => queryClient.invalidateQueries(['marketing-campaigns'])
    });

    const deleteMutation = useMutation({
        mutationFn: marketingService.deleteCampaign,
        onSuccess: () => queryClient.invalidateQueries(['marketing-campaigns'])
    });

    // 3. Custom Templates Queries & Mutations
    const { data: dbTemplates = [] } = useQuery({
        queryKey: ['marketing-templates'],
        queryFn: marketingService.getTemplates,
        refetchInterval: 10000
    });

    const createTemplateMutation = useMutation({
        mutationFn: marketingService.createTemplate,
        onSuccess: () => queryClient.invalidateQueries(['marketing-templates'])
    });

    const updateTemplateMutation = useMutation({
        mutationFn: ({ id, data }) => marketingService.updateTemplate(id, data),
        onSuccess: () => queryClient.invalidateQueries(['marketing-templates'])
    });

    const deleteTemplateMutation = useMutation({
        mutationFn: marketingService.deleteTemplate,
        onSuccess: () => queryClient.invalidateQueries(['marketing-templates'])
    });

    // 4. Trigger Automations Queries & Mutations
    const { data: automations = [] } = useQuery({
        queryKey: ['marketing-automations'],
        queryFn: marketingService.getAutomations,
        refetchInterval: 10000
    });

    const createAutomationMutation = useMutation({
        mutationFn: marketingService.createAutomation,
        onSuccess: () => queryClient.invalidateQueries(['marketing-automations'])
    });

    const updateAutomationMutation = useMutation({
        mutationFn: ({ id, data }) => marketingService.updateAutomation(id, data),
        onSuccess: () => queryClient.invalidateQueries(['marketing-automations'])
    });

    const toggleAutomationMutation = useMutation({
        mutationFn: marketingService.toggleAutomation,
        onSuccess: () => queryClient.invalidateQueries(['marketing-automations'])
    });

    const triggerAutomationMutation = useMutation({
        mutationFn: marketingService.triggerAutomation,
        onSuccess: () => queryClient.invalidateQueries(['marketing-automations'])
    });

    const deleteAutomationMutation = useMutation({
        mutationFn: marketingService.deleteAutomation,
        onSuccess: () => queryClient.invalidateQueries(['marketing-automations'])
    });

    const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'templates' | 'automation' | 'segments' | 'reports'
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateFormData, setTemplateFormData] = useState({
        title: '',
        subject: '',
        body: '',
        type: 'Email',
        label: 'Promotional'
    });
    const [templateFilter, setTemplateFilter] = useState('All'); // 'All' | 'Custom' | 'Premade'
    const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
    const [editingAutomation, setEditingAutomation] = useState(null);
    const [autoFormData, setAutoFormData] = useState({
        event_name: '',
        trigger_event: 'customer_birthday',
        channel: 'Email',
        timing_delay: 'Instant (09:00 AM)',
        scheduled_time: '09:00 AM',
        subject: '',
        message_body: '',
        status: 'active'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isLaunching, setIsLaunching] = useState(false);

    const { data: serverSettings } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsService.getSettings,
        refetchOnWindowFocus: false
    });
    const cfg = serverSettings?.data || serverSettings || {};
    const loyaltyEnabled = cfg.loyaltyEnabled !== false && cfg.loyalty !== false;

    const [formData, setFormData] = useState({
        campaign_name: '',
        campaign_type: 'Email',
        campaign_status: 'Draft',
        target_audience: 'All Customers',
        customer_segment: 'Retail Customers',
        total_recipients: 0,
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

    const [selectedCustomCustomerIds, setSelectedCustomCustomerIds] = useState([]);
    const [customCustomerSearch, setCustomCustomerSearch] = useState('');

    // 1. Fetch Customers to map audience
    const { data: customerData = [] } = useQuery({
        queryKey: ['marketing-customers'],
        queryFn: async () => {
            const res = await crmService.getCustomers();
            if (Array.isArray(res)) return res;
            if (res?.data && Array.isArray(res.data)) return res.data;
            if (res?.customers && Array.isArray(res.customers)) return res.customers;
            return [];
        }
    });

    useEffect(() => {
        if (customerData.length > 0 && selectedCustomCustomerIds.length === 0) {
            setSelectedCustomCustomerIds(customerData.map(c => c.id));
        }
    }, [customerData]);

    // 2. Auto-populate recipients count based on audience selection
    useEffect(() => {
        const activeCount = customerData.length > 0 ? customerData.length : 100;
        if (formData.target_audience === 'All Customers') {
            setFormData(prev => ({ ...prev, total_recipients: activeCount }));
        } else if (formData.target_audience === 'Repeat Customers') {
            setFormData(prev => ({ ...prev, total_recipients: Math.max(1, Math.floor(activeCount * 0.4)) }));
        } else if (formData.target_audience === 'Inactive Customers') {
            setFormData(prev => ({ ...prev, total_recipients: Math.max(1, Math.floor(activeCount * 0.2)) }));
        } else if (formData.target_audience === 'Custom Customers') {
            setFormData(prev => ({ ...prev, total_recipients: selectedCustomCustomerIds.length }));
        }
    }, [formData.target_audience, customerData, selectedCustomCustomerIds]);

    const resetFormData = () => {
        setFormData({
            campaign_name: '',
            campaign_type: 'Email',
            campaign_status: 'Draft',
            target_audience: 'All Customers',
            customer_segment: 'Retail Customers',
            total_recipients: customerData.length > 0 ? customerData.length : 100,
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
        setSelectedCustomCustomerIds(customerData.map(c => c.id));
    };

    const handleCloseCompose = () => {
        resetFormData();
        setIsComposeOpen(false);
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        // Clean out any loaded templates or lingering draft state when moving across sections
        resetFormData();
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        const trimmedName = (formData.campaign_name || '').trim();
        if (!trimmedName) {
            alert('Please enter a campaign name.');
            return;
        }
        if (trimmedName.length > 50) {
            alert('Campaign name cannot exceed 50 characters.');
            return;
        }

        // Determine recipient list based on selected target audience
        const targetCustomers = formData.target_audience === 'Custom Customers'
            ? customerData.filter(c => selectedCustomCustomerIds.includes(c.id))
            : (formData.target_audience === 'All Customers' 
                ? customerData 
                : customerData.slice(0, formData.total_recipients || customerData.length));

        const targetEmails = targetCustomers
            .map(c => c.email)
            .filter(e => e && typeof e === 'string' && e.includes('@'));

        if (formData.campaign_status === 'Sent' && targetEmails.length === 0) {
            alert("No valid recipient email addresses found. Please assign or select customers with an email address.");
            return;
        }

        const activeRecipients = targetEmails.length > 0 ? targetEmails.length : (formData.total_recipients || (customerData.length > 0 ? customerData.length : 1));

        const payload = {
            ...formData,
            campaign_name: trimmedName,
            total_recipients: activeRecipients,
            recipient_emails: targetEmails,
            recurring_campaign: Boolean(formData.recurring_campaign),
            recurrence_frequency: formData.recurring_campaign ? (formData.recurrence_frequency && formData.recurrence_frequency !== 'none' ? formData.recurrence_frequency : 'Weekly') : 'none'
        };

        setIsLaunching(true);
        try {
            // If "Sent" (Execute Immediately), dispatch actual emails via mailService
            if (formData.campaign_status === 'Sent') {
                if (targetEmails.length > 0) {
                    try {
                        await mailService.bulkSend({
                            recipients: targetEmails,
                            subject: formData.message_title || trimmedName,
                            body: formData.message_content || 'Special Offer from CLIKS Business',
                            isHtml: true
                        });
                        console.log('[Marketing] Mail sent successfully to', targetEmails.length, 'recipients');
                    } catch (mailErr) {
                        console.error('[Marketing] Direct mail send notice:', mailErr);
                        const proceed = await customConfirm(`Mail Gateway Notice: ${mailErr.message || 'Could not verify remote mail gateway'}. Do you still want to record the campaign in the system?`);
                        if (!proceed) {
                            setIsLaunching(false);
                            return;
                        }
                    }
                }
            }

            await createMutation.mutateAsync(payload);
            queryClient.invalidateQueries(['marketing-campaigns']);
            setIsComposeOpen(false);

            if (formData.campaign_status === 'Sent') {
                alert(`Campaign "${trimmedName}" executed and dispatched successfully to ${targetEmails.length} recipient(s)!`);
            } else if (formData.campaign_status === 'Scheduled') {
                alert(`Campaign "${trimmedName}" scheduled successfully for ${formData.scheduled_date} at ${formData.scheduled_time}!`);
            } else {
                alert(`Campaign "${trimmedName}" saved successfully as Draft!`);
            }

            // Reset Form
            resetFormData();
        } catch (err) {
            console.error('[Create Campaign Error]', err);
            alert(err.response?.data?.message || err.message || 'Failed to save campaign. Please try again.');
        } finally {
            setIsLaunching(false);
        }
    };

    const handleDeleteCampaign = async (id) => {
        if (await customConfirm('Are you sure you want to delete this campaign?')) {
            try {
                await deleteMutation.mutateAsync(id);
                if (selectedCampaign?.id === id) {
                    setIsDetailsOpen(false);
                    setSelectedCampaign(null);
                }
            } catch {
                alert('Failed to delete campaign');
            }
        }
    };

    // ── Template List & Management Helpers ──
    const allTemplates = [
        ...(Array.isArray(dbTemplates) ? dbTemplates.map(t => ({ ...t, is_custom: true })) : []),
        ...PREMADE_TEMPLATES.map(t => ({ ...t, is_custom: false }))
    ];

    const filteredTemplates = allTemplates.filter(t => {
        if (templateFilter === 'Custom') return t.is_custom;
        if (templateFilter === 'Premade') return !t.is_custom;
        return true;
    });

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        const trimmedTitle = (templateFormData.title || '').trim();
        const trimmedBody = (templateFormData.body || '').trim();
        if (!trimmedTitle || !trimmedBody) {
            alert('Please provide both a template title and message body.');
            return;
        }

        try {
            if (editingTemplate) {
                await updateTemplateMutation.mutateAsync({ 
                    id: editingTemplate.id, 
                    data: { ...templateFormData, title: trimmedTitle, body: trimmedBody } 
                });
                alert(`Template "${trimmedTitle}" updated successfully!`);
            } else {
                await createTemplateMutation.mutateAsync({ 
                    ...templateFormData, 
                    title: trimmedTitle, 
                    body: trimmedBody 
                });
                alert(`Custom template "${trimmedTitle}" created successfully!`);
            }
            setIsTemplateModalOpen(false);
            setEditingTemplate(null);
            setTemplateFormData({ title: '', subject: '', body: '', type: 'Email', label: 'Promotional' });
        } catch (err) {
            console.error('[Save Template Error]', err);
            alert(err.response?.data?.message || err.message || 'Failed to save template. Please try again.');
        }
    };

    const handleDeleteTemplate = async (id, title) => {
        if (await customConfirm(`Are you sure you want to delete custom template "${title}"?`)) {
            try {
                await deleteTemplateMutation.mutateAsync(id);
            } catch (err) {
                alert('Failed to delete template');
            }
        }
    };

    const handleUseTemplate = (temp) => {
        setFormData(prev => ({
            ...prev,
            campaign_name: `${temp.title} Campaign`.slice(0, 50),
            campaign_type: temp.type || 'Email',
            message_title: temp.subject || temp.title,
            message_content: temp.body,
            whatsapp_template: temp.type === 'WhatsApp' ? 'custom_whatsapp_v1' : '',
            sms_template: temp.type === 'SMS' ? 'custom_sms_v1' : '',
            email_template: temp.type === 'Email' ? 'custom_html_v1' : ''
        }));
        setIsComposeOpen(true);
    };

    // ── Automations Management Helpers ──
    const handleSaveAutomation = async (e) => {
        e.preventDefault();
        const trimmedName = (autoFormData.event_name || '').trim();
        if (!trimmedName) {
            alert('Please provide an event name for this trigger automation.');
            return;
        }

        try {
            if (editingAutomation) {
                await updateAutomationMutation.mutateAsync({
                    id: editingAutomation.id,
                    data: { ...autoFormData, event_name: trimmedName }
                });
                alert(`Automation "${trimmedName}" updated successfully!`);
            } else {
                await createAutomationMutation.mutateAsync({
                    ...autoFormData,
                    event_name: trimmedName
                });
                alert(`New automation "${trimmedName}" created successfully!`);
            }
            setIsAutoModalOpen(false);
            setEditingAutomation(null);
            setAutoFormData({
                event_name: '',
                trigger_event: 'customer_birthday',
                channel: 'Email',
                timing_delay: 'Instant (09:00 AM)',
                scheduled_time: '09:00 AM',
                subject: '',
                message_body: '',
                status: 'active'
            });
        } catch (err) {
            console.error('[Save Automation Error]', err);
            alert(err.response?.data?.message || err.message || 'Failed to save automation.');
        }
    };

    const handleToggleAutomation = async (auto) => {
        try {
            await toggleAutomationMutation.mutateAsync(auto.id);
        } catch (err) {
            alert('Failed to update automation status.');
        }
    };

    const handleRunAutomationNow = async (auto) => {
        if (await customConfirm(`Execute trigger "${auto.event_name}" now for eligible customers?`)) {
            try {
                const res = await triggerAutomationMutation.mutateAsync(auto.id);
                alert(res?.message || `Trigger "${auto.event_name}" executed successfully!`);
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to execute trigger.');
            }
        }
    };

    const handleDeleteAutomation = async (id, name) => {
        if (await customConfirm(`Are you sure you want to delete trigger automation "${name}"?`)) {
            try {
                await deleteAutomationMutation.mutateAsync(id);
            } catch (err) {
                alert('Failed to delete automation.');
            }
        }
    };

    // Derived Statistics
    const totalSentCampaigns = campaigns.filter(c => c.campaign_status === 'Sent' || c.sent_count > 0).length;
    const totalRecipientsReached = campaigns.reduce((sum, c) => sum + (c.sent_count || c.total_recipients || 0), 0);
    const avgConversionRate = (campaigns.filter(c => (c.sent_count || c.total_recipients) > 0).reduce((sum, c) => sum + (c.lead_conversion_rate || 15), 0) / (totalSentCampaigns || 1)).toFixed(1);
    const avgROI = Math.round(campaigns.filter(c => (c.sent_count || c.total_recipients) > 0).reduce((sum, c) => sum + (c.roi_percentage || 180), 0) / (totalSentCampaigns || 1));

    const filteredCampaigns = campaigns.filter(c => {
        const matchesSearch = (c.campaign_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (c.coupon_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (c.customer_segment || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'All' || c.campaign_type === typeFilter;
        const matchesStatus = statusFilter === 'All' || c.campaign_status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const triggerManualLaunch = async (camp) => {
        console.log('[Campaign Launch] Entry point reached for campaign:', camp.id);

        if (!(await customConfirm(`Are you sure you want to launch and send "${camp.campaign_name}" to recipients?`))) {
            console.log('[Campaign Launch] User cancelled the confirmation dialog.');
            return;
        }

        setIsLaunching(true);
        try {
            // Retrieve recipient emails
            let targetEmails = [];
            if (camp.recipient_emails) {
                try {
                    const parsed = typeof camp.recipient_emails === 'string' ? JSON.parse(camp.recipient_emails) : camp.recipient_emails;
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        targetEmails = parsed;
                    }
                } catch (e) {}
            }
            if (targetEmails.length === 0 && customerData.length > 0) {
                targetEmails = customerData.map(c => c.email).filter(e => e && e.includes('@'));
            }

            if (targetEmails.length > 0) {
                try {
                    await mailService.bulkSend({
                        recipients: targetEmails,
                        subject: camp.message_title || camp.campaign_name,
                        body: camp.message_content || 'Special Offer from CLIKS Business',
                        isHtml: true
                    });
                } catch (mErr) {
                    console.warn('[Direct Mail Dispatch Notice]:', mErr.message);
                }
            }

            await marketingService.launchCampaign(camp.id);
            queryClient.invalidateQueries(['marketing-campaigns']);
            alert(`Campaign "${camp.campaign_name}" launched and sent successfully!`);
        } catch (error) {
            console.error('[Launch Campaign Error]', error);
            alert(error.response?.data?.message || error.message || 'Failed to launch campaign');
        } finally {
            setIsLaunching(false);
        }
    };

    return (
        <div style={{ padding: '1rem 1.75rem', background: '#FAFDFB', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>
            {/* Header section with Premium Aesthetic */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 3px 8px rgba(27, 107, 58, 0.15)' }}>
                            <Megaphone size={18} className="animate-pulse" />
                        </div>
                        <h1 style={{ fontSize: '1.65rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Email Campaigns & Engagement</h1>
                    </div>
                    <p style={{ color: '#64748B', fontWeight: '500', fontSize: '0.88rem' }}>Draft and automate high-conversion Email newsletters, promotional codes, and automated follow-ups.</p>
                </div>
                <button 
                    onClick={() => {
                        resetFormData();
                        setIsComposeOpen(true);
                    }}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', 
                        borderRadius: '10px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                        color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem',
                        boxShadow: '0 6px 12px rgba(27, 107, 58, 0.2)', transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0px)'}
                >
                    <Plus size={16} /> Create Email Campaign
                </button>
            </div>

            {/* Premium Stats Grid - Standardized & Tightened */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                {[
                    { label: 'Total Reach', value: totalRecipientsReached.toLocaleString(), icon: Users, color: '#1B6B3A', bg: '#DCF2E4' },
                    { label: 'Avg. ROI', value: `${avgROI}%`, icon: TrendingUp, color: '#0D9488', bg: '#CCFBF1' },
                    { label: 'Active Automations', value: automations.filter(a => (a.status || '').toLowerCase() === 'active').length, icon: Clock, color: '#3B82F6', bg: '#DBEAFE' },
                    { label: 'Conv. Rate', value: `${avgConversionRate}%`, icon: Target, color: '#8B5CF6', bg: '#EDE9FE' }
                ].map((stat, idx) => (
                    <div 
                        key={idx} 
                        className="stat-card" 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', transition: 'transform 0.2s ease-in-out', cursor: 'default' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0px)'}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                            <p style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.01em', margin: 0 }}>{stat.value}</h3>
                        </div>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                            <stat.icon size={18} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.25rem', marginBottom: '1.25rem' }}>
                <button 
                    onClick={() => handleTabChange('campaigns')}
                    style={{ padding: '0.5rem 1.25rem', background: 'none', border: 'none', color: activeTab === 'campaigns' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.9rem', cursor: 'pointer', borderBottom: activeTab === 'campaigns' ? '3px solid #1B6B3A' : '3px solid transparent', transition: 'all 0.2s' }}
                >
                    📢 All Campaigns
                </button>
                <button 
                    onClick={() => handleTabChange('templates')}
                    style={{ padding: '0.5rem 1.25rem', background: 'none', border: 'none', color: activeTab === 'templates' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.9rem', cursor: 'pointer', borderBottom: activeTab === 'templates' ? '3px solid #1B6B3A' : '3px solid transparent', transition: 'all 0.2s' }}
                >
                    💬 Message Templates
                </button>
                <button 
                    onClick={() => handleTabChange('automation')}
                    style={{ padding: '0.5rem 1.25rem', background: 'none', border: 'none', color: activeTab === 'automation' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.9rem', cursor: 'pointer', borderBottom: activeTab === 'automation' ? '3px solid #1B6B3A' : '3px solid transparent', transition: 'all 0.2s' }}
                >
                    ⚙️ Trigger Automations
                </button>
                <button 
                    onClick={() => handleTabChange('reports')}
                    style={{ padding: '0.5rem 1.25rem', background: 'none', border: 'none', color: activeTab === 'reports' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.9rem', cursor: 'pointer', borderBottom: activeTab === 'reports' ? '3px solid #1B6B3A' : '3px solid transparent', transition: 'all 0.2s' }}
                >
                    📊 Advanced ROI Reports
                </button>
            </div>

            {/* Scrollable Tab Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {/* TAB CONTENT: 1. ALL CAMPAIGNS */}
            {activeTab === 'campaigns' && (
                <div>
                    {/* Filter & Search Bar - Tightened */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: 'white', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                            <Search size={16} style={{ color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search campaigns by name, coupon code or target audience..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ width: '100%', border: 'none', outline: 'none', fontWeight: '500', fontSize: '0.88rem', color: '#1E293B' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>Filter Status:</span>
                            <select 
                                value={statusFilter} 
                                onChange={e => setStatusFilter(e.target.value)}
                                style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontWeight: '600', outline: 'none', fontSize: '0.8rem' }}
                            >
                                <option value="All">All Status</option>
                                <option value="Sent">Sent</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                    </div>

                    {/* Campaigns Grid/List - Compact Pack */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filteredCampaigns.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', color: '#64748B' }}>
                                <Megaphone size={36} style={{ margin: '0 auto 0.75rem', color: '#94A3B8' }} />
                                <h4 style={{ fontWeight: '800', color: '#1E293B', marginBottom: '0.2rem' }}>No Campaigns Found</h4>
                                <p style={{ fontSize: '0.8rem' }}>Create a new Email campaign to get started with bulk customer promotions.</p>
                            </div>
                        ) : (
                            filteredCampaigns.map((camp) => (
                                <div 
                                    key={camp.id}
                                    style={{ 
                                        background: 'white', padding: '0.9rem 1.25rem', borderRadius: '14px', 
                                        border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        transition: 'all 0.2s ease-in-out', cursor: 'default'
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 16px -4px rgba(0,0,0,0.08)';
                                        e.currentTarget.style.borderColor = '#CBD5E1';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.transform = 'translateY(0px)';
                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                                        e.currentTarget.style.borderColor = '#E2E8F0';
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        {/* Premium Rounded Mail Icon */}
                                        <div style={{ 
                                            width: '42px', height: '42px', borderRadius: '10px', 
                                            background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#3B82F6', flexShrink: 0
                                        }}>
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B' }}>{camp.campaign_name}</h4>
                                                <span style={{ 
                                                    fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.45rem', borderRadius: '5px',
                                                    background: camp.campaign_status === 'Sent' ? '#DCF2E4' : camp.campaign_status === 'Scheduled' ? '#EFF6FF' : '#F1F5F9',
                                                    color: camp.campaign_status === 'Sent' ? '#1B6B3A' : camp.campaign_status === 'Scheduled' ? '#3B82F6' : '#475569'
                                                }}>
                                                    {camp.campaign_status}
                                                </span>
                                                {Boolean(camp.recurring_campaign && camp.recurring_campaign !== '0' && camp.recurring_campaign !== 'false' && camp.recurring_campaign !== 'none') && (
                                                    <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.45rem', borderRadius: '5px', background: '#FEF3C7', color: '#D97706' }}>
                                                        🔄 {camp.recurrence_frequency && camp.recurrence_frequency !== 'none' ? (camp.recurrence_frequency.charAt(0).toUpperCase() + camp.recurrence_frequency.slice(1)) : 'Weekly'}
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '500' }}>
                                                ID: <strong style={{ color: '#334155' }}>#{camp.id}</strong> • Target: <strong style={{ color: '#334155' }}>{camp.customer_segment || 'All'} ({camp.total_recipients} users)</strong>
                                                {camp.coupon_code && <> • Coupon: <span style={{ color: '#1B6B3A', background: '#E8F5EE', padding: '0.05rem 0.35rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '750' }}>{camp.coupon_code}</span></>}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action items */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {camp.campaign_status === 'Sent' ? (
                                            <div style={{ textAlign: 'right', marginRight: '0.75rem' }}>
                                                <div style={{ fontSize: '0.88rem', fontWeight: '850', color: '#1B6B3A' }}>{camp.roi_percentage}% ROI</div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>{camp.conversion_count} Conv.</div>
                                            </div>
                                        ) : (
                                            <div style={{ marginRight: '0.5rem' }}>
                                                <button 
                                                    disabled={isLaunching}
                                                    onClick={() => triggerManualLaunch(camp)}
                                                    style={{ background: '#1B6B3A', border: 'none', color: 'white', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '750', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', opacity: isLaunching ? 0.6 : 1 }}
                                                >
                                                    <Send size={10} /> {isLaunching ? 'Sending...' : 'Launch'}
                                                </button>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => { setSelectedCampaign(camp); setIsDetailsOpen(true); }}
                                            style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', color: '#475569', transition: 'background 0.2s' }}
                                            onMouseOver={e => e.currentTarget.style.background = '#F1F5F9'}
                                            onMouseOut={e => e.currentTarget.style.background = '#F8FAFC'}
                                        >
                                            Details
                                        </button>

                                        <button 
                                            onClick={() => handleDeleteCampaign(camp.id)}
                                            style={{ background: 'none', border: 'none', padding: '0.4rem', color: '#EF4444', cursor: 'pointer', borderRadius: '6px', opacity: 0.75 }}
                                            onMouseOver={e => e.currentTarget.style.opacity = 1}
                                            onMouseOut={e => e.currentTarget.style.opacity = 0.75}
                                            title="Delete Campaign"
                                        >
                                            <Trash2 size={15} />
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '0.25rem' }}>Message Templates</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Choose from verified templates or create and reuse your own custom campaign templates.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {/* Filter pills */}
                                <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.25rem', borderRadius: '10px' }}>
                                    {[
                                        { id: 'All', label: `All (${allTemplates.length})` },
                                        { id: 'Custom', label: `⭐ Custom (${dbTemplates.length})` },
                                        { id: 'Premade', label: `Verified (${PREMADE_TEMPLATES.length})` }
                                    ].map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => setTemplateFilter(f.id)}
                                            style={{
                                                border: 'none',
                                                background: templateFilter === f.id ? '#FFFFFF' : 'transparent',
                                                color: templateFilter === f.id ? '#064E3B' : '#64748B',
                                                fontWeight: templateFilter === f.id ? '800' : '650',
                                                fontSize: '0.78rem',
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                boxShadow: templateFilter === f.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => {
                                        setEditingTemplate(null);
                                        setTemplateFormData({ title: '', subject: '', body: '', type: 'Email', label: 'Custom' });
                                        setIsTemplateModalOpen(true);
                                    }}
                                    style={{ background: '#1B6B3A', border: 'none', color: 'white', padding: '0.55rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '750', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(27,107,58,0.2)' }}
                                >
                                    <Plus size={16} /> Create Custom Template
                                </button>
                            </div>
                        </div>

                        {filteredTemplates.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#FAFDFB', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                                <FileText size={36} style={{ color: '#94A3B8', marginBottom: '0.75rem' }} />
                                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.35rem' }}>No Templates Found</h4>
                                <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1.25rem' }}>
                                    {templateFilter === 'Custom' 
                                        ? 'You have not created any custom templates yet. Click below to add your first template!' 
                                        : 'No templates match the selected filter.'}
                                </p>
                                <button
                                    onClick={() => {
                                        setEditingTemplate(null);
                                        setTemplateFormData({ title: '', subject: '', body: '', type: 'Email', label: 'Custom' });
                                        setIsTemplateModalOpen(true);
                                    }}
                                    style={{ background: '#1B6B3A', border: 'none', color: 'white', padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '750', cursor: 'pointer' }}
                                >
                                    <Plus size={14} style={{ display: 'inline', marginRight: '0.3rem' }} /> Add Custom Template
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                {filteredTemplates.map((temp) => (
                                    <div 
                                        key={temp.id} 
                                        style={{ 
                                            background: '#FAFDFB', 
                                            padding: '1.25rem', 
                                            borderRadius: '16px', 
                                            border: temp.is_custom ? '1.5px solid #86EFAC' : '1px solid #DCF2E4', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            justifyContent: 'space-between',
                                            boxShadow: temp.is_custom ? '0 2px 8px rgba(34, 197, 94, 0.08)' : 'none'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: '800', background: temp.type === 'WhatsApp' ? '#1B6B3A' : temp.type === 'Email' ? '#3B82F6' : '#EA580C', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                                        {temp.type || 'Email'}
                                                    </span>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748B', background: '#F1F5F9', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                                                        {temp.label || 'General'}
                                                    </span>
                                                    {temp.is_custom && (
                                                        <span style={{ fontSize: '0.68rem', fontWeight: '800', background: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                                                            ⭐ Custom
                                                        </span>
                                                    )}
                                                </div>

                                                {temp.is_custom && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <button
                                                            onClick={() => {
                                                                setEditingTemplate(temp);
                                                                setTemplateFormData({
                                                                    title: temp.title,
                                                                    subject: temp.subject || '',
                                                                    body: temp.body,
                                                                    type: temp.type || 'Email',
                                                                    label: temp.label || 'Custom'
                                                                });
                                                                setIsTemplateModalOpen(true);
                                                            }}
                                                            style={{ border: 'none', background: '#F1F5F9', padding: '0.35rem', borderRadius: '6px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}
                                                            title="Edit Template"
                                                        >
                                                            <Edit size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTemplate(temp.id, temp.title)}
                                                            style={{ border: 'none', background: '#FEE2E2', padding: '0.35rem', borderRadius: '6px', cursor: 'pointer', color: '#DC2626', display: 'flex', alignItems: 'center' }}
                                                            title="Delete Template"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.3rem' }}>
                                                {temp.title}
                                            </h5>
                                            {temp.subject && (
                                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1B6B3A', marginBottom: '0.5rem' }}>
                                                    Subject: {temp.subject}
                                                </div>
                                            )}
                                            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: '1.5', fontStyle: 'italic', background: 'white', padding: '0.75rem', borderRadius: '10px', border: '1px dashed #CBD5E1', marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                                                "{temp.body}"
                                            </p>
                                        </div>

                                        <button 
                                            onClick={() => handleUseTemplate(temp)}
                                            style={{ width: '100%', background: 'white', border: '1.5px solid #1B6B3A', color: '#1B6B3A', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                                            onMouseOver={e => { e.currentTarget.style.background = '#1B6B3A'; e.currentTarget.style.color = 'white'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#1B6B3A'; }}
                                        >
                                            <Sparkles size={13} /> Use This Template
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: 3. AUTOMATION */}
            {activeTab === 'automation' && (
                <div>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '0.25rem' }}>Marketing & Engagement Automations</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Configure automated messages triggered by customer lifecycle events with live status and one-click dispatch.</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setEditingAutomation(null);
                                    setAutoFormData({
                                        event_name: '',
                                        trigger_event: 'customer_birthday',
                                        channel: 'Email',
                                        timing_delay: 'Instant (09:00 AM)',
                                        scheduled_time: '09:00 AM',
                                        subject: '',
                                        message_body: '',
                                        status: 'active'
                                    });
                                    setIsAutoModalOpen(true);
                                }}
                                style={{ background: '#1B6B3A', border: 'none', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '750', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(27,107,58,0.2)' }}
                            >
                                <Plus size={16} /> Configure New Trigger
                            </button>
                        </div>

                        {automations.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#FAFDFB', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                                <Zap size={36} style={{ color: '#94A3B8', marginBottom: '0.75rem' }} />
                                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.35rem' }}>No Automations Configured</h4>
                                <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1.25rem' }}>
                                    Set up automated customer lifecycle messages for birthdays, payment reminders, and follow-ups.
                                </p>
                                <button
                                    onClick={() => {
                                        setEditingAutomation(null);
                                        setAutoFormData({
                                            event_name: '',
                                            trigger_event: 'customer_birthday',
                                            channel: 'Email',
                                            timing_delay: 'Instant (09:00 AM)',
                                            scheduled_time: '09:00 AM',
                                            subject: '',
                                            message_body: '',
                                            status: 'active'
                                        });
                                        setIsAutoModalOpen(true);
                                    }}
                                    style={{ background: '#1B6B3A', border: 'none', color: 'white', padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '750', cursor: 'pointer' }}
                                >
                                    <Plus size={14} style={{ display: 'inline', marginRight: '0.3rem' }} /> Configure First Trigger
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {automations.map((auto) => {
                                    const isActive = (auto.status || '').toLowerCase() === 'active';
                                    return (
                                        <div 
                                            key={auto.id} 
                                            style={{ 
                                                padding: '1.35rem 1.5rem', 
                                                borderRadius: '16px', 
                                                border: isActive ? '1.5px solid #A7F3D0' : '1px solid #E2E8F0', 
                                                background: isActive ? '#FAFDFB' : '#F8FAFC', 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                                gap: '1rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', gap: '1.1rem', alignItems: 'center' }}>
                                                <div style={{ 
                                                    width: '44px', height: '44px', borderRadius: '12px', 
                                                    background: isActive ? '#DCF2E4' : '#E2E8F0', 
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                    color: isActive ? '#1B6B3A' : '#64748B',
                                                    flexShrink: 0 
                                                }}>
                                                    <Zap size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                                                        <h4 style={{ fontWeight: '800', color: '#1E293B', fontSize: '1rem', margin: 0 }}>
                                                            {auto.event_name}
                                                        </h4>
                                                        <span style={{ 
                                                            fontSize: '0.68rem', fontWeight: '800', 
                                                            background: auto.channel === 'WhatsApp' ? '#1B6B3A' : auto.channel === 'Email' ? '#3B82F6' : '#EA580C', 
                                                            color: 'white', padding: '0.15rem 0.45rem', borderRadius: '4px' 
                                                        }}>
                                                            {auto.channel || 'Email'}
                                                        </span>
                                                    </div>
                                                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                                                        Trigger: <strong style={{ color: '#1E293B' }}>{auto.trigger_event}</strong> • Timing: <strong style={{ color: '#1E293B' }}>{auto.timing_delay || auto.scheduled_time || 'Instant'}</strong>
                                                        {auto.last_run_at && (
                                                            <span style={{ marginLeft: '0.5rem', color: '#10B981', fontSize: '0.72rem', fontWeight: '600' }}>
                                                                • Last Ran: {new Date(auto.last_run_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                {/* Sent / Conversion Stats */}
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1B6B3A' }}>
                                                        Sent: {auto.sent_count || 0}
                                                    </div>
                                                    <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '600' }}>
                                                        Conversions: {auto.conversion_count || 0}
                                                    </div>
                                                </div>

                                                {/* Active / Paused Toggle Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleAutomation(auto)}
                                                    style={{
                                                        fontSize: '0.76rem',
                                                        fontWeight: '800',
                                                        color: isActive ? '#15803D' : '#DC2626',
                                                        background: isActive ? '#DCFCE7' : '#FEE2E2',
                                                        border: isActive ? '1px solid #86EFAC' : '1px solid #FCA5A5',
                                                        padding: '0.35rem 0.75rem',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    title={`Click to ${isActive ? 'pause' : 'activate'} this trigger automation`}
                                                >
                                                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isActive ? '#16A34A' : '#DC2626', display: 'inline-block' }} />
                                                    {isActive ? 'Active' : 'Paused'}
                                                </button>

                                                {/* Action Buttons: Run Trigger, Edit, Delete */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRunAutomationNow(auto)}
                                                        style={{
                                                            background: '#1B6B3A',
                                                            border: 'none',
                                                            color: 'white',
                                                            padding: '0.4rem 0.75rem',
                                                            borderRadius: '8px',
                                                            fontSize: '0.76rem',
                                                            fontWeight: '750',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.35rem',
                                                            boxShadow: '0 2px 4px rgba(27,107,58,0.15)'
                                                        }}
                                                        title="Trigger and execute this automated flow right now"
                                                    >
                                                        <Zap size={13} /> Run Trigger
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingAutomation(auto);
                                                            setAutoFormData({
                                                                event_name: auto.event_name,
                                                                trigger_event: auto.trigger_event || 'customer_birthday',
                                                                channel: auto.channel || 'Email',
                                                                timing_delay: auto.timing_delay || 'Instant (09:00 AM)',
                                                                scheduled_time: auto.scheduled_time || '09:00 AM',
                                                                subject: auto.subject || '',
                                                                message_body: auto.message_body || '',
                                                                status: auto.status || 'active'
                                                            });
                                                            setIsAutoModalOpen(true);
                                                        }}
                                                        style={{ border: 'none', background: '#F1F5F9', padding: '0.45rem', borderRadius: '8px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}
                                                        title="Edit Trigger Configuration"
                                                    >
                                                        <Edit size={14} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteAutomation(auto.id, auto.event_name)}
                                                        style={{ border: 'none', background: '#FEE2E2', padding: '0.45rem', borderRadius: '8px', cursor: 'pointer', color: '#DC2626', display: 'flex', alignItems: 'center' }}
                                                        title="Delete Trigger"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}



            {/* TAB CONTENT: 5. ROI REPORTS */}
            {activeTab === 'reports' && (
                <div>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>📈 Email Category Campaign ROI Analysis</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#F0F9F4', border: '1px solid #DCF2E4' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontWeight: '800', color: '#1B6B3A' }}>Bulk Marketing Emails</h4>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#1B6B3A', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>38% Open</span>
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
                                    <h4 style={{ fontWeight: '800', color: '#2563EB' }}>Transactional Emails</h4>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#2563EB', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>82% Open</span>
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
                                    <h4 style={{ fontWeight: '800', color: '#EA580C' }}>Trigger & Auto-Flows</h4>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#EA580C', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>74% Open</span>
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
            </div>

            {/* COMPOSE / CREATE CAMPAIGN MODAL - Premium Compact Redesign */}
            {isComposeOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
                    <div style={{ background: 'white', width: '550px', maxHeight: '92vh', borderRadius: '24px', overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={18} style={{ color: '#1B6B3A' }} />
                                <h2 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#064E3B' }}>Compose Email Campaign</h2>
                            </div>
                            <button type="button" onClick={handleCloseCompose} style={{ border: 'none', background: '#F1F5F9', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={18} /></button>
                        </div>

                        <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* SIMPLIFIED DENSE FLOW */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                
                                {/* SECTION 1: BASICS */}
                                <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: '850', color: '#1B6B3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>📌 1. Campaign Basics</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>Campaign Name *</label>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: (formData.campaign_name || '').length >= 50 ? '#DC2626' : '#64748B' }}>
                                                    {(formData.campaign_name || '').length}/50 chars
                                                </span>
                                            </div>
                                            <input 
                                                type="text" 
                                                required
                                                maxLength={50}
                                                value={formData.campaign_name} 
                                                onChange={e => setFormData({ ...formData, campaign_name: e.target.value.slice(0, 50) })}
                                                placeholder="e.g. Summer Clearance Blast"
                                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: (formData.campaign_name || '').length >= 50 ? '1.5px solid #F59E0B' : '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Status</label>
                                            <select 
                                                value={formData.campaign_status} 
                                                onChange={e => setFormData({ ...formData, campaign_status: e.target.value })}
                                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', background: 'white', boxSizing: 'border-box' }}
                                            >
                                                <option value="Draft">Draft (Save as Draft)</option>
                                                <option value="Scheduled">Scheduled (Send at specific date & time)</option>
                                                <option value="Sent">Sent (Execute & Dispatch Immediately)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {formData.campaign_status === 'Scheduled' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Scheduled Date *</label>
                                                <input 
                                                    type="date" 
                                                    required
                                                    value={formData.scheduled_date} 
                                                    onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })}
                                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Scheduled Time *</label>
                                                <input 
                                                    type="time" 
                                                    required
                                                    value={formData.scheduled_time} 
                                                    onChange={e => setFormData({ ...formData, scheduled_time: e.target.value })}
                                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* RECURRING CAMPAIGN TOGGLE & FREQUENCY SELECTOR */}
                                    <div style={{ 
                                        marginTop: '1rem', 
                                        padding: '0.85rem', 
                                        borderRadius: '12px', 
                                        background: formData.recurring_campaign ? '#F0FDF4' : '#F8FAFC', 
                                        border: formData.recurring_campaign ? '1.5px solid #86EFAC' : '1px solid #E2E8F0',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', margin: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                <input 
                                                    type="checkbox"
                                                    checked={Boolean(formData.recurring_campaign)}
                                                    onChange={e => {
                                                        const isChecked = e.target.checked;
                                                        setFormData({
                                                            ...formData,
                                                            recurring_campaign: isChecked,
                                                            recurrence_frequency: isChecked 
                                                                ? (formData.recurrence_frequency && formData.recurrence_frequency !== 'none' ? formData.recurrence_frequency : 'Weekly') 
                                                                : 'none'
                                                        });
                                                    }}
                                                    style={{ accentColor: '#16A34A', width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                                <div>
                                                    <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F172A' }}>
                                                        🔄 Repeat Campaign (Recurring Mail)
                                                    </span>
                                                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }}>
                                                        Automatically re-dispatch this campaign on an ongoing schedule
                                                    </p>
                                                </div>
                                            </div>
                                            {Boolean(formData.recurring_campaign) && (
                                                <span style={{ fontSize: '0.68rem', fontWeight: '800', background: '#DCFCE7', color: '#15803D', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                                                    Active
                                                </span>
                                            )}
                                        </label>

                                        {Boolean(formData.recurring_campaign) && (
                                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#334155' }}>
                                                    Recurrence Frequency:
                                                </label>
                                                <select 
                                                    value={formData.recurrence_frequency || 'Weekly'}
                                                    onChange={e => setFormData({ ...formData, recurrence_frequency: e.target.value })}
                                                    style={{ 
                                                        padding: '0.4rem 0.75rem', 
                                                        borderRadius: '8px', 
                                                        border: '1.5px solid #86EFAC', 
                                                        fontSize: '0.82rem', 
                                                        fontWeight: '750', 
                                                        color: '#166534',
                                                        outline: 'none', 
                                                        background: 'white',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="Daily">Daily (Every 24 Hours)</option>
                                                    <option value="Weekly">Weekly (Every 7 Days - Recommended)</option>
                                                    <option value="Bi-Weekly">Bi-Weekly (Every 14 Days)</option>
                                                    <option value="Monthly">Monthly (Every 30 Days)</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SECTION 2: AUDIENCE */}
                                <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: '850', color: '#1B6B3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>👥 2. Target Audience</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Audience Group</label>
                                            <select 
                                                value={formData.target_audience} 
                                                onChange={e => setFormData({ ...formData, target_audience: e.target.value })}
                                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', background: 'white', boxSizing: 'border-box' }}
                                            >
                                                <option value="All Customers">All Registered Customers ({customerData.length})</option>
                                                <option value="Repeat Customers">Repeat Customers ({Math.floor(customerData.length * 0.4)})</option>
                                                <option value="Inactive Customers">Inactive Customers ({Math.floor(customerData.length * 0.2)})</option>
                                                <option value="Custom Customers">Custom Selected Customers ({selectedCustomCustomerIds.length})</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Expected Recipients</label>
                                            <input 
                                                type="number" 
                                                readOnly
                                                value={formData.total_recipients} 
                                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.88rem', fontWeight: '750', background: '#F8FAFC', color: '#1B6B3A', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                    </div>

                                    {/* CUSTOM REGISTERED CUSTOMER SELECTION LIST */}
                                    {formData.target_audience === 'Custom Customers' && (
                                        <div style={{ marginTop: '1rem', background: '#FFFFFF', padding: '0.85rem', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                                <h5 style={{ margin: 0, fontSize: '0.75rem', fontWeight: '850', color: '#064E3B', textTransform: 'uppercase' }}>📋 Select Registered Customers for Bulk Email</h5>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setSelectedCustomCustomerIds(customerData.map(c => c.id))}
                                                        style={{ border: 'none', background: '#E8F5EE', color: '#1B6B3A', fontSize: '0.7rem', fontWeight: '750', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        Select All
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setSelectedCustomCustomerIds([])}
                                                        style={{ border: 'none', background: '#FEE2E2', color: '#DC2626', fontSize: '0.7rem', fontWeight: '750', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        Deselect All
                                                    </button>
                                                </div>
                                            </div>

                                            <input 
                                                type="text"
                                                placeholder="Search registered customers by name or email..."
                                                value={customCustomerSearch}
                                                onChange={e => setCustomCustomerSearch(e.target.value)}
                                                style={{ width: '100%', padding: '0.4rem 0.65rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.78rem', marginBottom: '0.6rem', outline: 'none', boxSizing: 'border-box' }}
                                            />

                                            <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '4px' }}>
                                                {customerData
                                                    .filter(c => {
                                                        const q = customCustomerSearch.toLowerCase().trim();
                                                        return !q || (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
                                                    })
                                                    .map(cust => {
                                                        const isSelected = selectedCustomCustomerIds.includes(cust.id);
                                                        return (
                                                            <label 
                                                                key={cust.id} 
                                                                style={{ 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    justify: 'space-between', 
                                                                    padding: '0.4rem 0.6rem', 
                                                                    borderRadius: '8px', 
                                                                    background: isSelected ? '#ECFDF5' : '#F8FAFC', 
                                                                    border: isSelected ? '1px solid #A7F3D0' : '1px solid #F1F5F9',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.78rem'
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                                                                    <input 
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSelectedCustomCustomerIds(prev => [...prev, cust.id]);
                                                                            } else {
                                                                                setSelectedCustomCustomerIds(prev => prev.filter(id => id !== cust.id));
                                                                            }
                                                                        }}
                                                                        style={{ cursor: 'pointer' }}
                                                                    />
                                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                        <span style={{ fontWeight: '800', color: '#0F172A' }}>{cust.name}</span>
                                                                        <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{cust.email || 'No email provided'}</span>
                                                                    </div>
                                                                </div>
                                                                {loyaltyEnabled && (
                                                                    <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#B45309', background: '#FFFBEB', padding: '0.1rem 0.35rem', borderRadius: '4px', flexShrink: 0 }}>
                                                                        ⭐ {cust.loyalty_points || cust.points || 0} Pts
                                                                    </span>
                                                                )}
                                                            </label>
                                                        );
                                                    })
                                                }
                                                {customerData.length === 0 && (
                                                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94A3B8', padding: '0.5rem' }}>No registered customers found.</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* RECIPIENT EMAIL PREVIEW LIST */}
                                    {customerData.length > 0 && (
                                        <div style={{ marginTop: '1rem', background: '#FFFFFF', padding: '0.85rem', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                                <h5 style={{ margin: 0, fontSize: '0.72rem', fontWeight: '850', color: '#475569', textTransform: 'uppercase' }}>📧 Selected Recipient Emails</h5>
                                                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#1B6B3A', background: '#E8F5EE', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                                    {formData.target_audience === 'Custom Customers' ? selectedCustomCustomerIds.length : (formData.target_audience === 'All Customers' ? customerData.length : formData.total_recipients)} Recipients
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
                                                {(formData.target_audience === 'Custom Customers' 
                                                    ? customerData.filter(c => selectedCustomCustomerIds.includes(c.id))
                                                    : (formData.target_audience === 'All Customers' ? customerData : customerData.slice(0, formData.total_recipients))
                                                ).map((c, i) => (
                                                    <div key={i} style={{ 
                                                        fontSize: '0.7rem', 
                                                        background: '#F1F5F9', 
                                                        padding: '0.3rem 0.6rem', 
                                                        borderRadius: '6px', 
                                                        color: '#334155', 
                                                        fontWeight: '600',
                                                        border: '1px solid #E2E8F0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem'
                                                    }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                                                        {c.email || `${c.name.split(' ')[0].toLowerCase()}@cliks.in`}
                                                    </div>
                                                ))}
                                                {customerData.length === 0 && (
                                                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>No customer data available...</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 3: CONTENT */}
                                <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <h4 style={{ fontSize: '0.8rem', fontWeight: '850', color: '#1B6B3A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>✉️ 3. Email Content</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            {(formData.message_title || formData.message_content) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            message_title: '',
                                                            message_content: '',
                                                            campaign_name: (prev.campaign_name && prev.campaign_name.endsWith(' Campaign')) ? '' : prev.campaign_name
                                                        }));
                                                    }}
                                                    style={{
                                                        fontSize: '0.72rem',
                                                        fontWeight: '750',
                                                        color: '#DC2626',
                                                        background: '#FEE2E2',
                                                        border: 'none',
                                                        padding: '0.25rem 0.55rem',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}
                                                    title="Reject and clear template content"
                                                >
                                                    <X size={12} /> Clear Content
                                                </button>
                                            )}
                                            {allTemplates.length > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '750' }}>Fill from template:</span>
                                                    <select
                                                        defaultValue=""
                                                        onChange={(e) => {
                                                            const selected = allTemplates.find(t => String(t.id) === String(e.target.value));
                                                            if (selected) {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    message_title: selected.subject || selected.title,
                                                                    message_content: selected.body,
                                                                    campaign_type: selected.type || prev.campaign_type
                                                                }));
                                                            }
                                                            e.target.value = '';
                                                        }}
                                                        style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', background: 'white', cursor: 'pointer' }}
                                                    >
                                                        <option value="" disabled>Select Template...</option>
                                                        {allTemplates.map(t => (
                                                            <option key={t.id} value={t.id}>
                                                                {t.is_custom ? '⭐ ' : ''}{t.title} ({t.type || 'Email'})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>Email Subject Line *</label>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: (formData.message_title || '').length >= 100 ? '#DC2626' : '#64748B' }}>
                                                    {(formData.message_title || '').length}/100 chars
                                                </span>
                                            </div>
                                            <input 
                                                type="text" 
                                                required
                                                maxLength={100}
                                                value={formData.message_title} 
                                                onChange={e => setFormData({ ...formData, message_title: e.target.value.slice(0, 100) })}
                                                placeholder="e.g. Exclusive Offer for You!"
                                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>Message Body *</label>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: (formData.message_content || '').length >= 2000 ? '#DC2626' : '#64748B' }}>
                                                    {(formData.message_content || '').length}/2000 chars
                                                </span>
                                            </div>
                                            <textarea 
                                                required
                                                maxLength={2000}
                                                value={formData.message_content} 
                                                onChange={e => setFormData({ ...formData, message_content: e.target.value.slice(0, 2000) })}
                                                placeholder="Write your email body here. Use {name} for personalization."
                                                style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', minHeight: '120px', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: '1.5' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseCompose}
                                    style={{
                                        flex: 1,
                                        padding: '0.85rem',
                                        borderRadius: '10px',
                                        border: '1px solid #CBD5E1',
                                        background: '#F8FAFC',
                                        color: '#64748B',
                                        fontWeight: '750',
                                        fontSize: '0.88rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.4rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#F1F5F9'}
                                    onMouseOut={e => e.currentTarget.style.background = '#F8FAFC'}
                                >
                                    <X size={15} /> Discard & Exit
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isLaunching}
                                    style={{ 
                                        flex: 2,
                                        padding: '0.85rem', borderRadius: '10px', 
                                        background: formData.campaign_status === 'Draft' 
                                            ? 'linear-gradient(135deg, #475569 0%, #334155 100%)' 
                                            : (formData.campaign_status === 'Scheduled' 
                                                ? 'linear-gradient(135deg, #0D9488 0%, #065F46 100%)' 
                                                : 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)'), 
                                        color: 'white', border: 'none', fontWeight: '800', fontSize: '0.92rem', 
                                        cursor: isLaunching ? 'not-allowed' : 'pointer', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        boxShadow: formData.campaign_status === 'Draft' ? '0 6px 16px rgba(51, 65, 85, 0.2)' : '0 6px 16px rgba(27, 107, 58, 0.2)', 
                                        opacity: isLaunching ? 0.75 : 1
                                    }}
                                >
                                    {isLaunching ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" /> Dispatching Emails...
                                        </>
                                    ) : formData.campaign_status === 'Draft' ? (
                                        <>
                                            <FileText size={16} /> Save Campaign as Draft
                                        </>
                                    ) : formData.campaign_status === 'Scheduled' ? (
                                        <>
                                            <Clock size={16} /> Schedule Email Campaign
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} /> Send & Execute Immediately
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isDetailsOpen && selectedCampaign && (
                <div 
                    onClick={() => { setIsDetailsOpen(false); setSelectedCampaign(null); }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(8px)', padding: '1.5rem' }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                            background: 'white', 
                            width: '100%', 
                            maxWidth: '760px', 
                            maxHeight: '90vh', 
                            overflowY: 'auto', 
                            borderRadius: '24px', 
                            padding: '2.25rem', 
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', 
                            display: 'flex', 
                            flexDirection: 'column',
                            border: '1px solid #E2E8F0'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.25)', flexShrink: 0 }}>
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: '850', background: '#E8F5EE', color: '#1B6B3A', padding: '0.15rem 0.55rem', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {selectedCampaign.campaign_type}
                                        </span>
                                        <span style={{ fontSize: '0.72rem', fontWeight: '850', background: selectedCampaign.campaign_status === 'Sent' ? '#DCFCE7' : '#FEF3C7', color: selectedCampaign.campaign_status === 'Sent' ? '#15803D' : '#D97706', padding: '0.15rem 0.55rem', borderRadius: '6px', textTransform: 'uppercase' }}>
                                            {selectedCampaign.campaign_status}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>{selectedCampaign.campaign_name}</h3>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setIsDetailsOpen(false); setSelectedCampaign(null); }} 
                                style={{ border: 'none', background: '#F1F5F9', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', transition: 'all 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = '#E2E8F0'}
                                onMouseOut={e => e.currentTarget.style.background = '#F1F5F9'}
                            >
                                <X size={18} />
                            </button>
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
                                        <div>Recurring: <strong style={{ color: '#0F172A' }}>
                                            {(selectedCampaign.recurring_campaign && selectedCampaign.recurring_campaign !== '0' && selectedCampaign.recurring_campaign !== 'false' && selectedCampaign.recurring_campaign !== 'none') 
                                                ? `Yes (${selectedCampaign.recurrence_frequency && selectedCampaign.recurrence_frequency !== 'none' ? (selectedCampaign.recurrence_frequency.charAt(0).toUpperCase() + selectedCampaign.recurrence_frequency.slice(1)) : 'Weekly'})` 
                                                : 'No (One time)'}
                                        </strong></div>
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
                            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>👨💼 Campaign Ownership</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                                    <div>Owner / Manager: <strong style={{ color: '#0F172A' }}>{selectedCampaign.campaign_owner}</strong></div>
                                    <div>Assigned Representative: <strong style={{ color: '#0F172A' }}>{selectedCampaign.assigned_salesperson}</strong></div>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem', marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button 
                                onClick={() => handleDeleteCampaign(selectedCampaign.id)}
                                style={{ flex: 1, background: '#FEF2F2', border: '1px solid #FEE2E2', padding: '0.85rem', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '850', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = '#FEE2E2'}
                                onMouseOut={e => e.currentTarget.style.background = '#FEF2F2'}
                            >
                                <Trash2 size={18} /> Delete Campaign
                            </button>
                            <button 
                                onClick={() => { setIsDetailsOpen(false); setSelectedCampaign(null); }}
                                style={{ flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '750', cursor: 'pointer', color: '#64748B', transition: 'all 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = '#F1F5F9'}
                                onMouseOut={e => e.currentTarget.style.background = '#F8FAFC'}
                            >
                                Close Details Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE / EDIT CUSTOM TEMPLATE MODAL */}
            {isTemplateModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(6px)' }}>
                    <div style={{ background: 'white', width: '540px', maxHeight: '90vh', borderRadius: '24px', overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={20} style={{ color: '#1B6B3A' }} />
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>
                                    {editingTemplate ? 'Edit Custom Template' : 'Create Custom Template'}
                                </h2>
                            </div>
                            <button 
                                onClick={() => { setIsTemplateModalOpen(false); setEditingTemplate(null); }}
                                style={{ border: 'none', background: '#F1F5F9', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Template Title *</label>
                                <input 
                                    type="text"
                                    required
                                    maxLength={60}
                                    value={templateFormData.title}
                                    onChange={e => setTemplateFormData({ ...templateFormData, title: e.target.value })}
                                    placeholder="e.g. VIP Seasonal Flash Offer"
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Channel / Type</label>
                                    <select
                                        value={templateFormData.type}
                                        onChange={e => setTemplateFormData({ ...templateFormData, type: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', background: 'white', boxSizing: 'border-box' }}
                                    >
                                        <option value="Email">Email</option>
                                        <option value="WhatsApp">WhatsApp</option>
                                        <option value="SMS">SMS</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Category Label</label>
                                    <select
                                        value={templateFormData.label}
                                        onChange={e => setTemplateFormData({ ...templateFormData, label: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', background: 'white', boxSizing: 'border-box' }}
                                    >
                                        <option value="Promotional">Promotional</option>
                                        <option value="Offer">Special Offer</option>
                                        <option value="Festival">Festival</option>
                                        <option value="Birthday">Birthday / Anniversary</option>
                                        <option value="Engagement">Engagement / Follow-up</option>
                                        <option value="Custom">Custom</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Email Subject Line</label>
                                <input 
                                    type="text"
                                    maxLength={100}
                                    value={templateFormData.subject}
                                    onChange={e => setTemplateFormData({ ...templateFormData, subject: e.target.value })}
                                    placeholder="e.g. Special Deal Awaits You at CLIKS!"
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>Message Content / Body *</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>Insert tag:</span>
                                        {['{name}', '{coupon}', '{company}'].map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => setTemplateFormData(prev => ({ ...prev, body: (prev.body || '') + tag }))}
                                                style={{ border: 'none', background: '#E8F5EE', color: '#1B6B3A', fontSize: '0.68rem', fontWeight: '750', padding: '0.15rem 0.45rem', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                +{tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea 
                                    required
                                    rows={5}
                                    value={templateFormData.body}
                                    onChange={e => setTemplateFormData({ ...templateFormData, body: e.target.value })}
                                    placeholder="Hi {name}, we are pleased to offer you special discounts this week..."
                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: '1.5' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => { setIsTemplateModalOpen(false); setEditingTemplate(null); }}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: 'white', color: '#475569', fontWeight: '750', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 2, padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(27,107,58,0.25)' }}
                                >
                                    {editingTemplate ? 'Update Template' : 'Save Custom Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CONFIGURE TRIGGER AUTOMATION MODAL */}
            {isAutoModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(6px)' }}>
                    <div style={{ background: 'white', width: '540px', maxHeight: '90vh', borderRadius: '24px', overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Zap size={20} style={{ color: '#1B6B3A' }} />
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>
                                    {editingAutomation ? 'Edit Trigger Automation' : 'Configure New Trigger Automation'}
                                </h2>
                            </div>
                            <button 
                                onClick={() => { setIsAutoModalOpen(false); setEditingAutomation(null); }}
                                style={{ border: 'none', background: '#F1F5F9', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAutomation} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Automation Event Name *</label>
                                <input 
                                    type="text"
                                    required
                                    maxLength={60}
                                    value={autoFormData.event_name}
                                    onChange={e => setAutoFormData({ ...autoFormData, event_name: e.target.value })}
                                    placeholder="e.g. Birthday Special Discount or Payment Follow-up"
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Trigger Lifecycle Event</label>
                                    <select
                                        value={autoFormData.trigger_event}
                                        onChange={e => setAutoFormData({ ...autoFormData, trigger_event: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', background: 'white', boxSizing: 'border-box' }}
                                    >
                                        <option value="customer_birthday">🎂 Customer Birthday</option>
                                        <option value="customer_anniversary">🎉 Customer Anniversary</option>
                                        <option value="invoice_due">📋 Invoice Due / Overdue</option>
                                        <option value="cart_abandoned">🛒 Inactive Customer / Cart Win-back</option>
                                        <option value="new_customer">👋 New Customer Registration</option>
                                        <option value="loyalty_milestone">⭐ Loyalty Milestone Reached</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Dispatch Channel</label>
                                    <select
                                        value={autoFormData.channel}
                                        onChange={e => setAutoFormData({ ...autoFormData, channel: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', background: 'white', boxSizing: 'border-box' }}
                                    >
                                        <option value="Email">Email</option>
                                        <option value="WhatsApp">WhatsApp</option>
                                        <option value="SMS">SMS</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Timing & Trigger Delay</label>
                                    <select
                                        value={autoFormData.timing_delay}
                                        onChange={e => setAutoFormData({ ...autoFormData, timing_delay: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', background: 'white', boxSizing: 'border-box' }}
                                    >
                                        <option value="Instant (09:00 AM)">Instant (09:00 AM)</option>
                                        <option value="Instant (10:00 AM)">Instant (10:00 AM)</option>
                                        <option value="1 Day before due date">1 Day before due date</option>
                                        <option value="2 Days after due date">2 Days after due date</option>
                                        <option value="4 Hours after abandonment">4 Hours after abandonment</option>
                                        <option value="Same Day (06:00 PM)">Evening (06:00 PM)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Status</label>
                                    <select
                                        value={autoFormData.status}
                                        onChange={e => setAutoFormData({ ...autoFormData, status: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', background: 'white', boxSizing: 'border-box' }}
                                    >
                                        <option value="active">Active (Auto-Running)</option>
                                        <option value="paused">Paused (Manual Only)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Subject Line (for Email)</label>
                                <input 
                                    type="text"
                                    maxLength={100}
                                    value={autoFormData.subject}
                                    onChange={e => setAutoFormData({ ...autoFormData, subject: e.target.value })}
                                    placeholder="e.g. A Special Gift on Your Birthday!"
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>Message Template Body *</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>Insert tag:</span>
                                        {['{name}', '{coupon}', '{company}'].map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => setAutoFormData(prev => ({ ...prev, message_body: (prev.message_body || '') + tag }))}
                                                style={{ border: 'none', background: '#E8F5EE', color: '#1B6B3A', fontSize: '0.68rem', fontWeight: '750', padding: '0.15rem 0.45rem', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                +{tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea 
                                    required
                                    rows={4}
                                    value={autoFormData.message_body}
                                    onChange={e => setAutoFormData({ ...autoFormData, message_body: e.target.value })}
                                    placeholder="Write your automated message content here..."
                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: '1.5' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => { setIsAutoModalOpen(false); setEditingAutomation(null); }}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: 'white', color: '#475569', fontWeight: '750', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 2, padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(27,107,58,0.25)' }}
                                >
                                    {editingAutomation ? 'Update Automation' : 'Save & Activate Trigger'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessMarketing;
