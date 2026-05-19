import React, { useState } from 'react';
import { 
    Truck, 
    Package, 
    MapPin, 
    User, 
    Phone, 
    Shield, 
    CheckCircle2, 
    Clock, 
    Plus, 
    X, 
    Search, 
    Filter, 
    Calendar, 
    TrendingUp, 
    Smartphone, 
    MessageSquare, 
    Camera, 
    FileText, 
    Award, 
    Activity, 
    RefreshCw, 
    AlertCircle, 
    ThumbsUp,
    PenTool
} from 'lucide-react';
import '../App.css';
import { useQuery } from '@tanstack/react-query';
import { settingsService } from '../services';
import FilterableTableHead from '../components/FilterableTableHead';
import { applyTableFilters } from '../utils/filterUtils';

const INITIAL_DELIVERIES = [
    {
        delivery_id: 'DLV-401',
        delivery_number: 'CLIKS/DEL/26/101',
        delivery_status: 'Out For Delivery',
        delivery_date: '2026-05-06',
        shipment_id: 'SHP-8802',
        tracking_number: 'TRK998248102',
        courier_name: 'CLIKS Logistics',
        dispatch_date: '2026-05-06 09:30 AM',
        estimated_delivery_date: '2026-05-06',
        delivered_date: '',
        delivery_staff_id: 'STF-05',
        driver_name: 'Satish Yadav',
        vehicle_number: 'MH-12-QB-8821',
        contact_number: '+91 98234 56789',
        customer_name: 'Aman Deep',
        shipping_address: 'Flat 402, Green Meadows, Senapati Bapat Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411016',
        geo_location: '18.5308, 73.8315',
        package_count: 2,
        package_weight: 4.5,
        packing_status: 'packed',
        packaging_notes: 'Fragile electronics inside. Handle with care.',
        warehouse_id: 'WH-MAIN-01',
        dispatch_by: 'Kiran Mane',
        stock_reserved: true,
        dispatch_status: 'dispatched',
        challan_number: 'CHL-2026-4402',
        challan_type: 'GST',
        challan_date: '2026-05-06',
        linked_invoice_id: 'INV-40292',
        otp_code: '5829',
        customer_signature: '',
        delivery_photo: '',
        delivery_feedback: 0,
        pickup_request_id: '',
        pickup_status: '',
        failed_delivery_reason: '',
        reverse_logistics_status: ''
    },
    {
        delivery_id: 'DLV-402',
        delivery_number: 'CLIKS/DEL/26/102',
        delivery_status: 'Delivered',
        delivery_date: '2026-05-05',
        shipment_id: 'SHP-8791',
        tracking_number: 'TRK998248091',
        courier_name: 'Delhivery',
        dispatch_date: '2026-05-05 10:15 AM',
        estimated_delivery_date: '2026-05-05',
        delivered_date: '2026-05-05 04:45 PM',
        delivery_staff_id: 'STF-02',
        driver_name: 'Rajesh Patil',
        vehicle_number: 'MH-14-EU-4592',
        contact_number: '+91 91234 56711',
        customer_name: 'Megha Sharma',
        shipping_address: 'Sector 21, Plot 14, Nigdi Pradhikaran',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411044',
        geo_location: '18.6472, 73.7745',
        package_count: 1,
        package_weight: 1.2,
        packing_status: 'packed',
        packaging_notes: 'Standard box package.',
        warehouse_id: 'WH-MAIN-01',
        dispatch_by: 'Kiran Mane',
        stock_reserved: true,
        dispatch_status: 'dispatched',
        challan_number: 'CHL-2026-4403',
        challan_type: 'GST',
        challan_date: '2026-05-05',
        linked_invoice_id: 'INV-40280',
        otp_code: '1102',
        customer_signature: 'Megha S.',
        delivery_photo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
        delivery_feedback: 5,
        pickup_request_id: '',
        pickup_status: '',
        failed_delivery_reason: '',
        reverse_logistics_status: ''
    },
    {
        delivery_id: 'DLV-403',
        delivery_number: 'CLIKS/DEL/26/103',
        delivery_status: 'Failed Attempt',
        delivery_date: '2026-05-04',
        shipment_id: 'SHP-8750',
        tracking_number: 'TRK998248002',
        courier_name: 'CLIKS Logistics',
        dispatch_date: '2026-05-04 11:00 AM',
        estimated_delivery_date: '2026-05-04',
        delivered_date: '',
        delivery_staff_id: 'STF-05',
        driver_name: 'Satish Yadav',
        vehicle_number: 'MH-12-QB-8821',
        contact_number: '+91 98234 56789',
        customer_name: 'Rahul Varma',
        shipping_address: 'Building B, Apartment 801, Hinjewadi Phase 1',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411057',
        geo_location: '18.5913, 73.7389',
        package_count: 3,
        package_weight: 12.8,
        packing_status: 'packed',
        packaging_notes: 'Heavy weight desktop unit. Lift delivery required.',
        warehouse_id: 'WH-TECH-02',
        dispatch_by: 'Suresh Patil',
        stock_reserved: true,
        dispatch_status: 'dispatched',
        challan_number: 'CHL-2026-4390',
        challan_type: 'GST',
        challan_date: '2026-05-04',
        linked_invoice_id: 'INV-40250',
        otp_code: '4452',
        customer_signature: '',
        delivery_photo: '',
        delivery_feedback: 0,
        pickup_request_id: 'RET-9901',
        pickup_status: 'scheduled',
        failed_delivery_reason: 'Customer out of town / Premises locked',
        reverse_logistics_status: 'Return to warehouse initiated'
    },
    {
        delivery_id: 'DLV-404',
        delivery_number: 'CLIKS/DEL/26/104',
        delivery_status: 'Packed',
        delivery_date: '2026-05-07',
        shipment_id: 'SHP-8820',
        tracking_number: '',
        courier_name: 'Pending Assignment',
        dispatch_date: '',
        estimated_delivery_date: '2026-05-07',
        delivered_date: '',
        delivery_staff_id: '',
        driver_name: '',
        vehicle_number: '',
        contact_number: '',
        customer_name: 'Snehal Deshmukh',
        shipping_address: 'Flat 101, Shivneri Sadan, Kothrud',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411038',
        geo_location: '18.5074, 73.8077',
        package_count: 1,
        package_weight: 2.0,
        packing_status: 'packed',
        packaging_notes: 'Fragile printer cartridge.',
        warehouse_id: 'WH-MAIN-01',
        dispatch_by: 'Kiran Mane',
        stock_reserved: true,
        dispatch_status: 'pending',
        challan_number: 'CHL-2026-4420',
        challan_type: 'Non-GST',
        challan_date: '2026-05-06',
        linked_invoice_id: '',
        otp_code: '8910',
        customer_signature: '',
        delivery_photo: '',
        delivery_feedback: 0,
        pickup_request_id: '',
        pickup_status: '',
        failed_delivery_reason: '',
        reverse_logistics_status: ''
    }
];

const INITIAL_STAFF = [
    { staff_id: 'STF-01', name: 'Ramesh Sawant', vehicle: 'MH-12-SA-9102', mobile: '+91 99234 88102', status: 'Available', delivery_success_rate: 98, avg_time: '45 mins' },
    { staff_id: 'STF-02', name: 'Rajesh Patil', vehicle: 'MH-14-EU-4592', mobile: '+91 91234 56711', status: 'On Delivery', delivery_success_rate: 94, avg_time: '52 mins' },
    { staff_id: 'STF-05', name: 'Satish Yadav', vehicle: 'MH-12-QB-8821', mobile: '+91 98234 56789', status: 'On Delivery', delivery_success_rate: 91, avg_time: '61 mins' }
];

const BusinessDelivery = () => {
    // Fetch customization settings dynamically to enforce master configurations
    const { data: userSettings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsService.getSettings,
        refetchOnWindowFocus: false
    });
    const activeConfig = userSettings?.data || userSettings || {};

    const [deliveries, setDeliveries] = useState(() => {
        const local = localStorage.getItem('cliks_deliveries');
        return local ? JSON.parse(local) : INITIAL_DELIVERIES;
    });

    const staff = INITIAL_STAFF;
    const [activeTab, setActiveTab] = useState('all');
    const [colFilters, setColFilters] = React.useState({}); // 'all' | 'staff' | 'challans' | 'returns' | 'reports'
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isActionOpen, setIsActionOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    
    // Search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    // Confirm Delivery Fields
    const [otpInput, setOtpInput] = useState('');
    const [signatureInput, setSignatureInput] = useState('');
    const [feedbackInput, setFeedbackInput] = useState(5);
    const [failedReasonInput, setFailedReasonInput] = useState('');

    // Create Form State
    const [formData, setFormData] = useState(() => ({
        delivery_number: `CLIKS/DEL/26/${100 + deliveries.length + 1}`,
        delivery_status: 'Packed',
        delivery_date: '',
        shipment_id: `SHP-${8800 + deliveries.length + 1}`,
        tracking_number: '',
        courier_name: 'CLIKS Logistics',
        dispatch_date: '',
        estimated_delivery_date: '',
        delivery_staff_id: '',
        driver_name: '',
        vehicle_number: '',
        contact_number: '',
        customer_name: '',
        shipping_address: '',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '',
        geo_location: '',
        package_count: 1,
        package_weight: 1.0,
        packing_status: 'packed',
        packaging_notes: '',
        warehouse_id: 'WH-MAIN-01',
        dispatch_by: 'Kiran Mane',
        challan_number: `CHL-2026-${4420 + deliveries.length + 1}`,
        challan_type: 'GST',
        challan_date: '2026-05-06',
        linked_invoice_id: '',
        otp_code: Math.floor(1000 + Math.random() * 9000).toString(),
    }));

    const saveDeliveries = (updated) => {
        setDeliveries(updated);
        localStorage.setItem('cliks_deliveries', JSON.stringify(updated));
    };

    const handleCreateDelivery = (e) => {
        e.preventDefault();
        
        let assignedDriver = '';
        let assignedVehicle = '';
        let assignedMobile = '';

        if (formData.delivery_staff_id) {
            const stf = staff.find(s => s.staff_id === formData.delivery_staff_id);
            if (stf) {
                assignedDriver = stf.name;
                assignedVehicle = stf.vehicle;
                assignedMobile = stf.mobile;
            }
        }

        const newDlv = {
            ...formData,
            delivery_id: `DLV-${500 + deliveries.length + 1}`,
            driver_name: assignedDriver,
            vehicle_number: assignedVehicle,
            contact_number: assignedMobile,
            stock_reserved: true,
            dispatch_status: formData.delivery_status === 'Packed' ? 'pending' : 'dispatched',
            dispatch_date: formData.delivery_status !== 'Packed' ? new Date().toISOString().slice(0, 10) + ' 10:00 AM' : '',
            customer_signature: '',
            delivery_photo: '',
            delivery_feedback: 0,
            pickup_request_id: '',
            pickup_status: '',
            failed_delivery_reason: '',
            reverse_logistics_status: ''
        };

        const updated = [newDlv, ...deliveries];
        saveDeliveries(updated);
        setIsCreateOpen(false);
        // Reset
        setFormData({
            delivery_number: `CLIKS/DEL/26/${100 + updated.length + 1}`,
            delivery_status: 'Packed',
            delivery_date: '',
            shipment_id: `SHP-${8800 + updated.length + 1}`,
            tracking_number: '',
            courier_name: 'CLIKS Logistics',
            dispatch_date: '',
            estimated_delivery_date: '',
            delivery_staff_id: '',
            driver_name: '',
            vehicle_number: '',
            contact_number: '',
            customer_name: '',
            shipping_address: '',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '',
            geo_location: '',
            package_count: 1,
            package_weight: 1.0,
            packing_status: 'packed',
            packaging_notes: '',
            warehouse_id: 'WH-MAIN-01',
            dispatch_by: 'Kiran Mane',
            challan_number: `CHL-2026-${4420 + updated.length + 1}`,
            challan_type: 'GST',
            challan_date: '2026-05-06',
            linked_invoice_id: '',
            otp_code: Math.floor(1000 + Math.random() * 9000).toString(),
        });
    };

    const handleConfirmDelivery = () => {
        if (!otpInput) {
            alert('Please enter the customer delivery verification OTP.');
            return;
        }
        if (otpInput !== selectedDelivery.otp_code) {
            alert('Incorrect verification OTP. Please try again.');
            return;
        }

        const updated = deliveries.map(d => {
            if (d.delivery_id === selectedDelivery.delivery_id) {
                return {
                    ...d,
                    delivery_status: 'Delivered',
                    delivered_date: new Date().toISOString().replace('T', ' ').slice(0, 16),
                    customer_signature: signatureInput || d.customer_name,
                    delivery_feedback: feedbackInput,
                    failed_delivery_reason: '',
                    reverse_logistics_status: ''
                };
            }
            return d;
        });

        saveDeliveries(updated);
        setIsActionOpen(false);
        alert(`Order ${selectedDelivery.delivery_number} successfully verified and delivered!`);
    };

    const handleMarkFailed = () => {
        if (!failedReasonInput) {
            alert('Please select or write a reason for delivery failure.');
            return;
        }

        const updated = deliveries.map(d => {
            if (d.delivery_id === selectedDelivery.delivery_id) {
                return {
                    ...d,
                    delivery_status: 'Failed Attempt',
                    failed_delivery_reason: failedReasonInput,
                    pickup_request_id: `RET-${Math.floor(9000 + Math.random() * 999)}`,
                    pickup_status: 'scheduled',
                    reverse_logistics_status: 'Return dispatch back to warehouse scheduled'
                };
            }
            return d;
        });

        saveDeliveries(updated);
        setIsActionOpen(false);
        alert(`Delivery attempt marked as Failed. Return logistics initiated.`);
    };

    const handleAssignDriver = (dlvId, staffId) => {
        const stf = staff.find(s => s.staff_id === staffId);
        if (!stf) return;

        const updated = deliveries.map(d => {
            if (d.delivery_id === dlvId) {
                return {
                    ...d,
                    delivery_staff_id: staffId,
                    driver_name: stf.name,
                    vehicle_number: stf.vehicle,
                    contact_number: stf.mobile,
                    delivery_status: 'Dispatched',
                    dispatch_status: 'dispatched',
                    dispatch_date: new Date().toISOString().replace('T', ' ').slice(0, 16)
                };
            }
            return d;
        });

        saveDeliveries(updated);
        alert(`Assigned driver ${stf.name} to shipment.`);
    };

    const filteredDeliveries = deliveries.filter(d => {
        const matchesSearch = d.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              d.delivery_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              d.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (d.driver_name && d.driver_name.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = statusFilter === 'All' || d.delivery_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Statistics Calculation
    const totalCount = deliveries.length;
    const deliveredCount = deliveries.filter(d => d.delivery_status === 'Delivered').length;
    const failedCount = deliveries.filter(d => d.delivery_status === 'Failed Attempt').length;
    const pendingCount = totalCount - deliveredCount - failedCount;
    const successRate = totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 100;

    if (!isLoadingSettings && activeConfig.deliveryChallan === false) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '500px', background: '#F8FAFC', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
                <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '3rem', borderRadius: '24px', maxWidth: '500px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', margin: '0 auto 1.5rem', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.1)' }}>
                        <Truck size={40} style={{ color: '#10B981' }} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Logistics Engine Locked</h2>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem', fontWeight: '500' }}>
                        Delivery challans, shipment tracking, fleet performance, and reverse logistics are currently disabled. You can activate full Logistics & Challans anytime from the Engine Customizer panel.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <button 
                            onClick={() => window.location.href = '/customization'}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                                padding: '0.75rem 1.5rem', borderRadius: '12px', 
                                background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                                fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem',
                                boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)'
                            }}
                        >
                            Activate Logistics Engine
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.25rem 2.5rem', background: '#F9FCFA', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header section */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)' }}>
                            <Truck size={22} />
                        </div>
                        <h1 style={{ fontSize: '1.85rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Logistics & Delivery</h1>
                    </div>
                    <p style={{ color: '#64748B', fontWeight: '500', fontSize: '0.95rem' }}>Fulfill client shipments, generate delivery challans, track fleet routing, and verify customer arrivals.</p>
                </div>
                <button 
                    onClick={() => setIsCreateOpen(true)}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem', 
                        borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                        color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer',
                        boxShadow: '0 8px 16px rgba(27, 107, 58, 0.25)'
                    }}
                >
                    <Plus size={18} /> Dispatch Shipment
                </button>
            </div>

            {/* Stats Dashboard Grid */}
            {/* Modern Delivery Accent Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Delivery Success Rate', value: `${successRate}%`, icon: Award, color: '#1B6B3A', bg: '#DCF2E4' },
                    { label: 'Avg Delivery Speed', value: '52 mins', icon: Clock, color: '#0D9488', bg: '#CCFBF1' },
                    { label: 'Failed Attempts', value: failedCount, icon: AlertCircle, color: '#EF4444', bg: '#FEE2E2' },
                    { label: 'Ongoing Shipments', value: pendingCount, icon: Activity, color: '#3B82F6', bg: '#DBEAFE' }
                ].map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', cursor: 'default', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {/* Decorative background watermark */}
                        <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.06, color: stat.color, transform: 'rotate(-15deg)' }}>
                            <stat.icon size={70} />
                        </div>
                        
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                            <stat.icon size={20} />
                        </div>
                        
                        <h3 style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.03em', margin: '0 0 0.25rem 0', position: 'relative', zIndex: 1 }}>{stat.value}</h3>
                        <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em', position: 'relative', zIndex: 1 }}>{stat.label}</p>
                        
                        {/* Colored bottom border accent */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: stat.color, opacity: 0.7 }} />
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.25rem', marginBottom: '2rem' }}>
                <button 
                    onClick={() => setActiveTab('all')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'all' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'all' ? '3px solid #1B6B3A' : '3px solid transparent' }}
                >
                    📦 Shipments & Real-Time Status
                </button>
                <button 
                    onClick={() => setActiveTab('challans')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'challans' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'challans' ? '3px solid #1B6B3A' : '3px solid transparent' }}
                >
                    📄 Delivery Challans
                </button>
                <button 
                    onClick={() => setActiveTab('staff')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'staff' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'staff' ? '3px solid #1B6B3A' : '3px solid transparent' }}
                >
                    👨💼 Delivery Staff & Driver Performance
                </button>
                <button 
                    onClick={() => setActiveTab('returns')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'returns' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'returns' ? '3px solid #1B6B3A' : '3px solid transparent' }}
                >
                    🔄 Reverse Logistics (Returns)
                </button>
            </div>

            {/* Scrollable Tab Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {/* TAB CONTENT: SHIPMENTS */}
            {activeTab === 'all' && (
                <div>
                    {/* Search & Filters */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                            <Search size={18} style={{ color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search deliveries by customer name, order number, city, or driver..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ width: '100%', border: 'none', outline: 'none', fontWeight: '500', fontSize: '0.9rem', color: '#1E293B' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B' }}>Status:</span>
                            <select 
                                value={statusFilter} 
                                onChange={e => setStatusFilter(e.target.value)}
                                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontWeight: '600', outline: 'none', fontSize: '0.85rem' }}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Packed">Packed</option>
                                <option value="Dispatched">Dispatched</option>
                                <option value="Out For Delivery">Out For Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Failed Attempt">Failed Attempt</option>
                            </select>
                        </div>
                    </div>

                    {/* Shipments List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredDeliveries.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', color: '#64748B' }}>
                                <Package size={48} style={{ margin: '0 auto 1rem', color: '#94A3B8' }} />
                                <h4 style={{ fontWeight: '800', color: '#1E293B', marginBottom: '0.25rem' }}>No Shipments Found</h4>
                                <p style={{ fontSize: '0.85rem' }}>Click "Dispatch Shipment" to create a new logistics order.</p>
                            </div>
                        ) : (
                            filteredDeliveries.map((dlv) => (
                                <div key={dlv.delivery_id} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                        <div style={{ 
                                            width: '50px', height: '50px', borderRadius: '12px', 
                                            background: dlv.delivery_status === 'Delivered' ? '#E8F5EE' : dlv.delivery_status === 'Failed Attempt' ? '#FEE2E2' : '#EFF6FF',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: dlv.delivery_status === 'Delivered' ? '#1B6B3A' : dlv.delivery_status === 'Failed Attempt' ? '#EF4444' : '#3B82F6'
                                        }}>
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B' }}>{dlv.customer_name}</h4>
                                                <span style={{ 
                                                    fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '6px',
                                                    background: dlv.delivery_status === 'Delivered' ? '#DCF2E4' : dlv.delivery_status === 'Failed Attempt' ? '#FEE2E2' : '#EFF6FF',
                                                    color: dlv.delivery_status === 'Delivered' ? '#1B6B3A' : dlv.delivery_status === 'Failed Attempt' ? '#EF4444' : '#3B82F6'
                                                }}>
                                                    {dlv.delivery_status}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '500' }}>
                                                Ref: <strong style={{ color: '#334155' }}>{dlv.delivery_number}</strong> • City: <strong style={{ color: '#334155' }}>{dlv.city}</strong> • Courier: <strong style={{ color: '#334155' }}>{dlv.courier_name}</strong>
                                                {dlv.tracking_number && <> • Tracking: <span style={{ color: '#1B6B3A', fontWeight: '750' }}>{dlv.tracking_number}</span></>}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        {dlv.driver_name ? (
                                            <div style={{ textAlign: 'right', marginRight: '1rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Assigned Driver</span>
                                                <strong style={{ fontSize: '0.9rem', color: '#1E293B' }}>{dlv.driver_name}</strong>
                                                <span style={{ fontSize: '0.75rem', color: '#475569', display: 'block' }}>{dlv.vehicle_number}</span>
                                            </div>
                                        ) : (
                                            <div style={{ marginRight: '1.5rem' }}>
                                                <select 
                                                    onChange={(e) => handleAssignDriver(dlv.delivery_id, e.target.value)}
                                                    defaultValue=""
                                                    style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                                                >
                                                    <option value="" disabled>Assign Driver</option>
                                                    {staff.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(s => (
                                                        <option key={s.staff_id} value={s.staff_id}>{s.name} ({s.vehicle})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => { setSelectedDelivery(dlv); setOtpInput(''); setSignatureInput(''); setFailedReasonInput(''); setIsActionOpen(true); }}
                                            style={{ background: '#FAFDFB', border: '1px solid #1B6B3A', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '750', cursor: 'pointer', color: '#1B6B3A' }}
                                        >
                                            Challan & Confirm
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: CHALLANS */}
            {activeTab === 'challans' && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>📄 Generated Delivery Challans (Product Dispatches)</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <FilterableTableHead columns={[
        { key: 'challan_number', label: 'Challan No', placeholder: 'e.g. CH-001' },
        { key: 'type', label: 'Type', placeholder: 'e.g. Outward' },
        { key: 'customer_name', label: 'Customer', placeholder: 'Name' },
        { key: 'dispatch_date', label: 'Dispatch Date', placeholder: 'e.g. 2026-05' },
        { key: 'linked_invoice', label: 'Linked Invoice', placeholder: 'INV-' },
        { key: 'status', label: 'Status', placeholder: 'e.g. Delivered' },
        { key: '_actions', label: 'Action', noFilter: true }
    ]} onFilterChange={setColFilters} />
                        <tbody>
                            {deliveries.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((dlv) => (
                                <tr key={dlv.delivery_id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.9rem', color: '#334155' }}>
                                    <td style={{ padding: '1rem', fontWeight: '750', color: '#0F172A' }}>{dlv.challan_number}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', background: dlv.challan_type === 'GST' ? '#DCF2E4' : '#F1F5F9', color: dlv.challan_type === 'GST' ? '#1B6B3A' : '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                            {dlv.challan_type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: '600' }}>{dlv.customer_name}</td>
                                    <td style={{ padding: '1rem' }}>{dlv.challan_date}</td>
                                    <td style={{ padding: '1rem' }}>{dlv.linked_invoice_id || <span style={{ color: '#EF4444', fontWeight: '700' }}>Unbilled</span>}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '750', color: dlv.delivery_status === 'Delivered' ? '#1B6B3A' : '#3B82F6' }}>
                                            {dlv.delivery_status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {!dlv.linked_invoice_id ? (
                                            <button 
                                                onClick={() => {
                                                    const updated = deliveries.map(d => {
                                                        if (d.delivery_id === dlv.delivery_id) {
                                                            return { ...d, linked_invoice_id: `INV-${Math.floor(40000 + Math.random() * 900)}` };
                                                        }
                                                        return d;
                                                    });
                                                    saveDeliveries(updated);
                                                    alert('Challan converted into formal linked Invoice.');
                                                }}
                                                style={{ padding: '0.3rem 0.6rem', border: 'none', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                                            >
                                                Convert to Invoice
                                            </button>
                                        ) : (
                                            <span style={{ color: '#1B6B3A', fontWeight: '750', fontSize: '0.8rem' }}>Invoiced ✓</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB CONTENT: DELIVERY STAFF */}
            {activeTab === 'staff' && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>👨💼 Delivery Staff Performance & Fleet Assignments</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        {staff.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((stf) => (
                            <div key={stf.staff_id} style={{ background: '#FAFDFB', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E8F5EE' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div>
                                        <h4 style={{ fontWeight: '800', color: '#0F172A', fontSize: '1.05rem' }}>{stf.name}</h4>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>ID: {stf.staff_id}</span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', background: stf.status === 'Available' ? '#DCF2E4' : '#EFF6FF', color: stf.status === 'Available' ? '#1B6B3A' : '#3B82F6', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                        {stf.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
                                    <div>Vehicle: <strong style={{ color: '#1E293B' }}>{stf.vehicle}</strong></div>
                                    <div>Mobile: <strong style={{ color: '#1E293B' }}>{stf.mobile}</strong></div>
                                    <div>Avg Delivery Speed: <strong style={{ color: '#1E293B' }}>{stf.avg_time}</strong></div>
                                </div>
                                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '750' }}>
                                        <span>Delivery Success Rate</span>
                                        <span style={{ color: '#1B6B3A' }}>{stf.delivery_success_rate}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginTop: '0.25rem' }}>
                                        <div style={{ width: `${stf.delivery_success_rate}%`, height: '100%', background: '#1B6B3A' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: RETURNS */}
            {activeTab === 'returns' && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>🔄 Reverse Logistics (Return pick-ups & Failures)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {deliveries.filter(d => d.failed_delivery_reason || d.pickup_request_id).map((dlv) => (
                            <div key={dlv.delivery_id} style={{ background: '#FFFDFD', border: '1px solid #FEE2E2', padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <h4 style={{ fontWeight: '800', color: '#1E293B' }}>{dlv.customer_name}</h4>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#FEE2E2', color: '#EF4444', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                            Pickup ID: {dlv.pickup_request_id}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>
                                        Failure Reason: <strong style={{ color: '#EF4444' }}>"{dlv.failed_delivery_reason}"</strong>
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                                        Logistics Action: <strong style={{ color: '#334155' }}>{dlv.reverse_logistics_status}</strong>
                                    </p>
                                </div>
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#EA580C', background: '#FFF7ED', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                                    {dlv.pickup_status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            </div>

            {/* CREATE DELIVERY ORDER MODAL */}
            {isCreateOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '760px', maxHeight: '90vh', borderRadius: '24px', overflowY: 'auto', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Truck style={{ color: '#1B6B3A' }} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>Fulfill & Dispatch New Delivery</h2>
                            </div>
                            <button onClick={() => setIsCreateOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* SECTION 1: BASIC FIELDS */}
                            <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', marginBottom: '1rem' }}>📌 1. Basic Delivery Fields</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Delivery Reference No</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.delivery_number}
                                            onChange={e => setFormData({ ...formData, delivery_number: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Delivery Date</label>
                                        <input 
                                            type="date" 
                                            required
                                            value={formData.delivery_date}
                                            onChange={e => setFormData({ ...formData, delivery_date: e.target.value, estimated_delivery_date: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Delivery Status</label>
                                        <select 
                                            value={formData.delivery_status}
                                            onChange={e => setFormData({ ...formData, delivery_status: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="Packed">Packed</option>
                                            <option value="Dispatched">Dispatched</option>
                                            <option value="Out For Delivery">Out For Delivery</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: DESTINATION ADDRESS */}
                            <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', marginBottom: '1rem' }}>📍 2. Shipping Address & Receiver</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Receiver/Customer Name *</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="Aman Deep"
                                            value={formData.customer_name}
                                            onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Postal Pincode *</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="411016"
                                            value={formData.pincode}
                                            onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Full Shipping Location *</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="Flat 402, Green Meadows..."
                                            value={formData.shipping_address}
                                            onChange={e => setFormData({ ...formData, shipping_address: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: WAREHOUSE DISPATCH & PACKING */}
                            <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', marginBottom: '1rem' }}>📦 3. Packing & Warehouse Dispatch</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Warehouse Source</label>
                                        <select 
                                            value={formData.warehouse_id}
                                            onChange={e => setFormData({ ...formData, warehouse_id: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="WH-MAIN-01">WH-MAIN-01 (Pune)</option>
                                            <option value="WH-TECH-02">WH-TECH-02 (Hinjewadi)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Package Count</label>
                                        <input 
                                            type="number" 
                                            value={formData.package_count}
                                            onChange={e => setFormData({ ...formData, package_count: parseInt(e.target.value) || 1 })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Total Weight (Kg)</label>
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            value={formData.package_weight}
                                            onChange={e => setFormData({ ...formData, package_weight: parseFloat(e.target.value) || 1.0 })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Challan Type</label>
                                        <select 
                                            value={formData.challan_type}
                                            onChange={e => setFormData({ ...formData, challan_type: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="GST">GST Challan</option>
                                            <option value="Non-GST">Non-GST Challan</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Packaging Notes</label>
                                    <input 
                                        type="text" 
                                        placeholder="Add instructions, fragile notices, or handling remarks..."
                                        value={formData.packaging_notes}
                                        onChange={e => setFormData({ ...formData, packaging_notes: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                    />
                                </div>
                            </div>

                            {/* SECTION 4: DELIVERY STAFF ASSIGNMENT */}
                            <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', marginBottom: '1rem' }}>👨💼 4. Fleet & Courier Assignment</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Internal Delivery Staff</label>
                                        <select 
                                            value={formData.delivery_staff_id}
                                            onChange={e => setFormData({ ...formData, delivery_staff_id: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="">Select Internal Driver</option>
                                            {staff.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(s => (
                                                <option key={s.staff_id} value={s.staff_id}>{s.name} ({s.vehicle})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>External Courier (if not internal)</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Delhivery, BlueDart"
                                            value={formData.courier_name}
                                            onChange={e => setFormData({ ...formData, courier_name: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
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
                                <Truck size={18} /> Generate Challan & Dispatch
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ACTION & CONFIRMATION MODAL WITH ALL THE FIELDS */}
            {isActionOpen && selectedDelivery && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(6px)' }}>
                    <div style={{ background: 'white', width: '580px', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A' }}>Shipment Dispatch Information</h3>
                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Challan No: {selectedDelivery.challan_number}</span>
                            </div>
                            <button onClick={() => { setIsActionOpen(false); }} style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Section: Shipment Basic info */}
                            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                                <div style={{ marginBottom: '0.25rem' }}>Receiver: <strong>{selectedDelivery.customer_name}</strong></div>
                                <div style={{ marginBottom: '0.25rem' }}>Location: {selectedDelivery.shipping_address}, {selectedDelivery.city} - {selectedDelivery.pincode}</div>
                                <div>Weight / Count: {selectedDelivery.package_weight} Kg / {selectedDelivery.package_count} packages</div>
                            </div>

                            {selectedDelivery.delivery_status !== 'Delivered' ? (
                                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Smartphone size={16} /> Customer OTP Delivery Verification
                                    </h4>
                                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.75rem' }}>
                                        Verification OTP code generated: <strong style={{ color: '#0F172A', background: '#FEF3C7', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{selectedDelivery.otp_code}</strong>
                                    </p>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#475569', marginBottom: '0.4rem' }}>Enter OTP to Confirm *</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. 5829"
                                                value={otpInput}
                                                onChange={e => setOtpInput(e.target.value)}
                                                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#475569', marginBottom: '0.4rem' }}>Signature/Signee Proof</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. Megha Sharma"
                                                value={signatureInput}
                                                onChange={e => setSignatureInput(e.target.value)}
                                                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Photo / Proof Upload Mocked</span>
                                            <div style={{ padding: '0.6rem', border: '1px dashed #1B6B3A', borderRadius: '8px', background: '#FAFDFB', color: '#1B6B3A', fontSize: '0.8rem', fontWeight: '700', textAlign: 'center' }}>
                                                <Camera size={14} style={{ display: 'inline', marginRight: '0.25rem' }} /> Proof Photo Captured ✓
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#475569', marginBottom: '0.4rem' }}>Feedback Rating</label>
                                            <select 
                                                value={feedbackInput}
                                                onChange={e => setFeedbackInput(parseInt(e.target.value))}
                                                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                            >
                                                <option value={5}>5 Stars Excellent</option>
                                                <option value={4}>4 Stars Good</option>
                                                <option value={3}>3 Stars Fair</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleConfirmDelivery}
                                        style={{ width: '100%', padding: '0.85rem', background: '#1B6B3A', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', marginBottom: '1.5rem' }}
                                    >
                                        Verify OTP & Confirm Delivery
                                    </button>

                                    {/* Action Failed Attempt */}
                                    <div style={{ borderTop: '1px dashed #EF4444', paddingTop: '1.25rem' }}>
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#EF4444', marginBottom: '0.75rem' }}>⚠️ Failed Attempt / Return Management</h4>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <select 
                                                value={failedReasonInput}
                                                onChange={e => setFailedReasonInput(e.target.value)}
                                                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                            >
                                                <option value="">Select Failure Reason</option>
                                                <option value="Premises Locked / Customer Out of Town">Premises Locked / Customer Out of Town</option>
                                                <option value="Incorrect shipping address">Incorrect shipping address</option>
                                                <option value="Customer refused delivery">Customer refused delivery</option>
                                            </select>
                                            <button 
                                                onClick={handleMarkFailed}
                                                style={{ background: '#EF4444', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '750', cursor: 'pointer' }}
                                            >
                                                Mark Failed
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', textAlign: 'center', paddingBottom: '1rem' }}>
                                    <CheckCircle2 size={42} style={{ color: '#1B6B3A', margin: '0 auto 0.75rem' }} />
                                    <h4 style={{ fontWeight: '850', color: '#1B6B3A' }}>Package Delivered</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem' }}>
                                        Signed by: <strong>{selectedDelivery.customer_signature}</strong> • Verified via OTP • Feedback: {selectedDelivery.delivery_feedback} Stars
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessDelivery;
