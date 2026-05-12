import React, { useState } from 'react';
import { 
    ArrowLeft, Save, Sliders, FileText, RefreshCw, Building2, 
    ShieldCheck, CheckCircle2, Truck, ArrowRightLeft, Database, 
    Printer, MessageSquare, Users, Smartphone, LayoutGrid, Eye, Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { Toggle } from '../components/ui/toggle';

const BusinessCustomization = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const [config, setConfig] = useState({
        // GENERAL
        passcode: false, gstin: true, negativeStock: false, blockItems: false, 
        blockParties: false, deliveryChallan: true, godown: false, autoBackup: true, auditTrail: true,

        // TRANSACTION
        invoiceBillNo: true, addTime: false, cashSale: false, billingName: true, custPO: false,
        inclusiveTax: true, displayPurchase: true, last5Sale: false, last5Purchase: false, freeQty: false,
        txnTax: false, txnDiscount: false, roundOff: true,
        billingType: 'full', 

        // PRINT
        printerType: 'regular', repeatHeader: true, printName: 'My Company', printLogo: true,
        paperSize: 'A4',

        // GST
        enableGst: true, hsnCode: true, cess: false, reverseCharge: false,
        placeSupply: true, compositeScheme: false, enableTcs: false, enableTds: false,

        // MESSAGE
        msgMethod: 'Vyapar', msgToParty: true, msgUpdate: false, msgCopySelf: false,
        autoSendSales: true, autoSendPurchase: true, autoSendReturn: true,

        // PARTY
        partyGroup: false, shipAddr: false, partyStatus: false, payReminder: true,
        loyalty: true
    });

    const handleToggle = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => { setIsSaving(false); }, 800);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Sliders, gradient: 'linear-gradient(135deg, #1B6B3A 0%, #135029 100%)', shadow: 'rgba(27, 107, 58, 0.2)' },
        { id: 'transaction', label: 'Transaction', icon: FileText, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadow: 'rgba(59, 130, 246, 0.2)' },
        { id: 'print', label: 'Print', icon: Printer, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', shadow: 'rgba(139, 92, 246, 0.2)' },
        { id: 'gst', label: 'Taxes & GST', icon: ShieldCheck, gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', shadow: 'rgba(16, 185, 129, 0.2)' },
        { id: 'message', label: 'Message', icon: MessageSquare, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', shadow: 'rgba(245, 158, 11, 0.2)' },
        { id: 'party', label: 'Party', icon: Users, gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', shadow: 'rgba(236, 72, 153, 0.2)' }
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'general': return renderGeneral();
            case 'transaction': return renderTransaction();
            case 'print': return renderPrint();
            case 'gst': return renderGst();
            case 'message': return renderMessage();
            case 'party': return renderParty();
            default: return null;
        }
    };

    const renderGeneral = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CustomizationCard title="Application Core" icon={Sliders}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <PremiumToggleItem label="Security Passcode" desc="Validate auth tokens before destructive operations." active={config.passcode} onToggle={() => handleToggle('passcode')} />
                        <Divider />
                        <PremiumToggleItem label="Prevent Negative Inventory" desc="Restrict invoicing items when stock level <= 0." active={config.negativeStock} onToggle={() => handleToggle('negativeStock')} />
                        <Divider />
                        <PremiumToggleItem label="Lock Party Generation" desc="Prevent new party records within standard transaction forms." active={config.blockParties} onToggle={() => handleToggle('blockParties')} />
                    </div>
                </CustomizationCard>
                <CustomizationCard title="Operational Features" icon={Truck}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <PremiumToggleItem label="Activate Delivery Challans" active={config.deliveryChallan} onToggle={() => handleToggle('deliveryChallan')} />
                        {config.deliveryChallan && (
                            <div style={{ marginLeft: '2.75rem', padding: '1rem', background: '#F8FAFC', borderRadius: '8px', display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                                    <input type="checkbox" defaultChecked style={{ accentColor: '#1B6B3A' }} /> Reverse Goods Logic
                                </label>
                                <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ accentColor: '#1B6B3A' }} /> Display Amount
                                </label>
                            </div>
                        )}
                    </div>
                </CustomizationCard>
            </div>
            <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CustomizationCard title="Company Scope" icon={Building2}>
                    <div style={{ background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)', padding: '1rem', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '750', fontSize: '0.85rem' }}>My Default Firm</span>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '800' }}>ACTIVE</span>
                    </div>
                </CustomizationCard>
                <CustomizationCard title="Warehousing" icon={ArrowRightLeft}>
                    <PremiumToggleItem label="Godown Links" active={config.godown} onToggle={() => handleToggle('godown')} />
                </CustomizationCard>
                <CustomizationCard title="Integrity" icon={Database}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <PremiumToggleItem label="Auto Backup" active={config.autoBackup} onToggle={() => handleToggle('autoBackup')} />
                        <PremiumToggleItem label="Audit Trail" active={config.auditTrail} onToggle={() => handleToggle('auditTrail')} />
                    </div>
                </CustomizationCard>
            </div>
        </div>
    );

    const renderTransaction = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CustomizationCard title="Transaction Header & Table" icon={LayoutGrid}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>Header Logic</h4>
                            <CheckboxWithLabel label="Include Invoice/Bill No." checked={config.invoiceBillNo} onChange={() => handleToggle('invoiceBillNo')} />
                            <CheckboxWithLabel label="Timestamp Transactions" checked={config.addTime} onChange={() => handleToggle('addTime')} />
                            <CheckboxWithLabel label="Set Cash Sale as Default" checked={config.cashSale} onChange={() => handleToggle('cashSale')} />
                            <CheckboxWithLabel label="Capture PO Detail Reference" checked={config.custPO} onChange={() => handleToggle('custPO')} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>Items Grid</h4>
                            <CheckboxWithLabel label="Inclusive/Exclusive Tax Toggle" checked={config.inclusiveTax} onChange={() => handleToggle('inclusiveTax')} />
                            <CheckboxWithLabel label="Show Purchase Price to Staff" checked={config.displayPurchase} onChange={() => handleToggle('displayPurchase')} />
                            <CheckboxWithLabel label="Enable Last 5 Sales Price History" checked={config.last5Sale} onChange={() => handleToggle('last5Sale')} />
                            <CheckboxWithLabel label="Manage Free Item Quantities" checked={config.freeQty} onChange={() => handleToggle('freeQty')} />
                        </div>
                    </div>
                </CustomizationCard>

                <CustomizationCard title="Billing Calculations" icon={Sliders}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h4 style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', margin: 0 }}>Discounts & Totals</h4>
                            <CheckboxWithLabel label="Transaction-wise General Tax" checked={config.txnTax} onChange={() => handleToggle('txnTax')} />
                            <CheckboxWithLabel label="Transaction-level Discount %" checked={config.txnDiscount} onChange={() => handleToggle('txnDiscount')} />
                            <div style={{ height: '1px', background: '#F1F5F9' }} />
                            <PremiumToggleItem label="Automatic Total Round Off" active={config.roundOff} onToggle={() => handleToggle('roundOff')} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h4 style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', margin: 0 }}>Billing Interface Style</h4>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div onClick={() => setConfig(p => ({...p, billingType: 'lite'}))} style={{ flex: 1, padding: '1rem', border: config.billingType === 'lite' ? '2px solid #3B82F6' : '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', background: config.billingType === 'lite' ? '#EFF6FF' : 'white' }}>
                                    <h5 style={{ margin: 0, fontWeight: '700', fontSize: '0.85rem' }}>Lite Sale</h5>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748B' }}>Optimized for quick checkout.</p>
                                </div>
                                <div onClick={() => setConfig(p => ({...p, billingType: 'full'}))} style={{ flex: 1, padding: '1rem', border: config.billingType === 'full' ? '2px solid #3B82F6' : '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', background: config.billingType === 'full' ? '#EFF6FF' : 'white' }}>
                                    <h5 style={{ margin: 0, fontWeight: '700', fontSize: '0.85rem' }}>Full Sale</h5>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748B' }}>Comprehensive inventory details.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CustomizationCard>
            </div>
            <div style={{ gridColumn: 'span 4' }}>
                <CustomizationCard title="Format Prefixes" icon={Edit}>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem' }}>Define tracking prefix templates.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {['Sale Invoice', 'Purchase Order', 'Estimate', 'Delivery Challan', 'Credit Note'].map(item => (
                            <div key={item} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>{item}</label>
                                <input type="text" placeholder="NONE" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.8rem' }} />
                            </div>
                        ))}
                    </div>
                </CustomizationCard>
            </div>
        </div>
    );

    const renderPrint = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CustomizationCard title="Printer & Engine" icon={Printer}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button onClick={() => setConfig(p => ({...p, printerType: 'regular'}))} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: config.printerType === 'regular' ? '#8B5CF6' : '#F1F5F9', color: config.printerType === 'regular' ? 'white' : '#64748B', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                            REGULAR PRINTER
                        </button>
                        <button onClick={() => setConfig(p => ({...p, printerType: 'thermal'}))} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: config.printerType === 'thermal' ? '#8B5CF6' : '#F1F5F9', color: config.printerType === 'thermal' ? 'white' : '#64748B', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                            THERMAL PRINTER
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <CheckboxWithLabel label="Force Default Printer Engine" checked={true} onChange={() => {}} />
                        <CheckboxWithLabel label="Repeat Header in multi-page Prints" checked={config.repeatHeader} onChange={() => handleToggle('repeatHeader')} />
                    </div>
                </CustomizationCard>

                <CustomizationCard title="Company Info Overrides" icon={Building2}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input type="checkbox" checked={config.printName} onChange={() => handleToggle('printName')} style={{ accentColor: '#8B5CF6' }} />
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '2px' }}>Custom Company Display Name</label>
                                <input type="text" defaultValue="My Super Company" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }} disabled={!config.printName} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input type="checkbox" defaultChecked style={{ accentColor: '#8B5CF6' }} />
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '2px' }}>Printing Email</label>
                                <input type="text" placeholder="billing@company.com" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Sheet Format:</span>
                            <select style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.8rem' }}>
                                <option>A4 Size</option>
                                <option>A5 Size</option>
                                <option>Letter</option>
                            </select>
                        </div>
                    </div>
                </CustomizationCard>
            </div>

            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '1rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Eye size={16} color="#8B5CF6" /> LIVE PREVIEW</h4>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#8B5CF6' }}>Template: Tally Classic</span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ border: '1px solid #94A3B8', minHeight: '300px', background: 'white', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ borderBottom: '1px solid #94A3B8', padding: '1rem', textAlign: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1rem' }}>TAX INVOICE</h2>
                        </div>
                        <div style={{ padding: '1rem', borderBottom: '1px solid #94A3B8', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '0.9rem' }}>{config.printName ? 'My Super Company' : '---'}</h3>
                                <div style={{ fontSize: '0.6rem', color: '#64748B' }}>GSTIN: 27ABCDE1234FZ1</div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.65rem' }}>
                                <div>INV-101</div>
                                <div>Date: 12/05/2026</div>
                            </div>
                        </div>
                        <div style={{ flex: 1, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#94A3B8' }}>
                            [ ITEM TABLE AREA ]
                        </div>
                        <div style={{ borderTop: '1px solid #94A3B8', padding: '0.5rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: '700' }}>
                            TOTAL: ₹ 0.00
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderGst = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <CustomizationCard title="Global Compliance Framework" icon={ShieldCheck}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <PremiumToggleItem label="Enable Unified GST Engine" active={config.enableGst} onToggle={() => handleToggle('enableGst')} />
                        <Divider />
                        <PremiumToggleItem label="Activate HSN / SAC Mandatory Fields" active={config.hsnCode} onToggle={() => handleToggle('hsnCode')} />
                        <Divider />
                        <PremiumToggleItem label="Place of Supply Mapping" active={config.placeSupply} onToggle={() => handleToggle('placeSupply')} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <CheckboxWithLabel label="Charge Reverse Charge Mechanics (RCM)" checked={config.reverseCharge} onChange={() => handleToggle('reverseCharge')} />
                        <CheckboxWithLabel label="Additional Cess Computation on Items" checked={config.cess} onChange={() => handleToggle('cess')} />
                        <CheckboxWithLabel label="Operational under Composition Scheme" checked={config.compositeScheme} onChange={() => handleToggle('compositeScheme')} />
                        <Divider />
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <CheckboxWithLabel label="Enable TCS" checked={config.enableTcs} onChange={() => handleToggle('enableTcs')} />
                            <CheckboxWithLabel label="Enable TDS" checked={config.enableTds} onChange={() => handleToggle('enableTds')} />
                        </div>
                    </div>
                </div>
            </CustomizationCard>
            
            <div style={{ background: '#F0FDF4', border: '1px solid #DCF2E4', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle2 size={20} color="#10B981" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#065F46' }}>Advanced Tax Matrix Engine is currently running v3.1</span>
                </div>
                <button style={{ padding: '0.4rem 1rem', borderRadius: '6px', background: '#10B981', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>CONFIGURE TAX SLABS</button>
            </div>
        </div>
    );

    const renderMessage = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CustomizationCard title="Message Gateway" icon={MessageSquare}>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div onClick={() => setConfig(p => ({...p, msgMethod: 'Vyapar'}))} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: config.msgMethod === 'Vyapar' ? '2px solid #F59E0B' : '1px solid #E2E8F0', background: config.msgMethod === 'Vyapar' ? '#FFFBEB' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Smartphone size={16}/></div>
                            <span style={{ fontWeight: '750', fontSize: '0.85rem' }}>SMS Gateway</span>
                        </div>
                        <div onClick={() => setConfig(p => ({...p, msgMethod: 'WhatsApp'}))} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: config.msgMethod === 'WhatsApp' ? '2px solid #10B981' : '1px solid #E2E8F0', background: config.msgMethod === 'WhatsApp' ? '#F0FDF4' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Smartphone size={16}/></div>
                            <span style={{ fontWeight: '750', fontSize: '0.85rem' }}>Personal WhatsApp</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <CheckboxWithLabel label="Broadcast Notifications to Client Parties" checked={config.msgToParty} onChange={() => handleToggle('msgToParty')} />
                        <CheckboxWithLabel label="Send Modification/Update Alerts" checked={config.msgUpdate} onChange={() => handleToggle('msgUpdate')} />
                        <CheckboxWithLabel label="Blind CC Copy to Self Mobile" checked={config.msgCopySelf} onChange={() => handleToggle('msgCopySelf')} />
                    </div>
                </CustomizationCard>

                <CustomizationCard title="Automated Delivery Workflows" icon={RefreshCw}>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem' }}>Fire automated messages immediately upon these actions:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <CheckboxWithLabel label="Post Sales Invoice" checked={config.autoSendSales} onChange={() => handleToggle('autoSendSales')} />
                        <CheckboxWithLabel label="On Purchase Registry" checked={config.autoSendPurchase} onChange={() => handleToggle('autoSendPurchase')} />
                        <CheckboxWithLabel label="Sales Return Received" checked={config.autoSendReturn} onChange={() => handleToggle('autoSendReturn')} />
                        <CheckboxWithLabel label="Quote Estimates" checked={false} onChange={() => {}} />
                        <CheckboxWithLabel label="Delivery Created" checked={false} onChange={() => {}} />
                        <CheckboxWithLabel label="Canceled Invoice Notification" checked={true} onChange={() => {}} />
                    </div>
                </CustomizationCard>
            </div>

            <div>
                <div style={{ padding: '1rem', background: '#064E3B', borderRadius: '16px 16px 0 0', color: 'white', fontSize: '0.9rem', fontWeight: '800' }}>
                    SMS PREVIEW BUBBLE
                </div>
                <div style={{ background: '#e5ddd5', padding: '1.5rem', minHeight: '350px', borderRadius: '0 0 16px 16px', position: 'relative' }}>
                    <div style={{ background: '#dcf8c6', padding: '0.75rem', borderRadius: '8px', maxWidth: '90%', boxShadow: '0 1px 1px rgba(0,0,0,0.1)', position: 'relative' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#1E293B', lineHeight: '1.4' }}>
                            Thanks for your purchase with us!!<br/>
                            Invoice No: #INV-1001<br/>
                            Amount: ₹15,490<br/>
                            <span style={{ color: '#3B82F6' }}>Click to view: web.cliks.io/t/983hdsf</span>
                        </p>
                        <span style={{ position: 'absolute', bottom: '4px', right: '8px', fontSize: '0.6rem', color: '#64748B' }}>11:22 AM</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderParty = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <CustomizationCard title="Client Management" icon={Users}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <PremiumToggleItem label="Party Grouping Clusters" desc="Categorize distinct vendors, distinct distributors." active={config.partyGroup} onToggle={() => handleToggle('partyGroup')} />
                    <Divider />
                    <PremiumToggleItem label="Extended Shipping Directives" desc="Toggle between Billing Addr vs Shipping Addr." active={config.shipAddr} onToggle={() => handleToggle('shipAddr')} />
                    <Divider />
                    <PremiumToggleItem label="Party Status Manager" desc="Mark vendors as Active, Suspended, Waitlist." active={config.partyStatus} onToggle={() => handleToggle('partyStatus')} />
                </div>
            </CustomizationCard>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CustomizationCard title="Retention & Reminders" icon={RefreshCw}>
                    <PremiumToggleItem label="Enable Auto Payment Reminders" active={config.payReminder} onToggle={() => handleToggle('payReminder')} />
                    {config.payReminder && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#475569' }}>Remind me for payment due in:</span>
                            <input type="number" defaultValue={3} style={{ width: '50px', padding: '0.25rem', textAlign: 'center', borderRadius: '4px', border: '1px solid #CBD5E1' }} />
                            <span style={{ fontSize: '0.8rem', color: '#475569' }}>days</span>
                        </div>
                    )}
                    <div style={{ height: '1.5rem' }} />
                    <PremiumToggleItem label="Loyalty Points Wallet" desc="Award cashback pts on consistent bill clears." active={config.loyalty} onToggle={() => handleToggle('loyalty')} />
                </CustomizationCard>
            </div>
        </div>
    );

    return (
        <div className="premium-container" style={{ paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <button 
                        onClick={() => navigate('/business/settings')}
                        style={{ background: 'transparent', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '0.5rem', padding: 0 }}
                    >
                        <ArrowLeft size={16} /> BACK
                    </button>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>Advanced Engine Configuration</h1>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>Override default system settings and manage module deployment toggles.</p>
                </div>

                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #1B6B3A 0%, #135029 100%)',
                        color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700',
                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)',
                        opacity: isSaving ? 0.7 : 1, fontSize: '0.85rem'
                    }}
                >
                    <Save size={18} />
                    {isSaving ? 'Processing...' : 'Save System State'}
                </button>
            </div>

            {/* Enhanced Tab Switcher */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', background: 'white', padding: '0.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', overflowX: 'auto' }}>
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.6rem 1rem', borderRadius: '8px', border: 'none',
                                background: isActive ? tab.gradient : 'transparent',
                                color: isActive ? 'white' : '#64748B',
                                fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: isActive ? `0 4px 12px ${tab.shadow}` : 'none',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <tab.icon size={16} strokeWidth={isActive ? 3 : 2} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Dynamic View Context */}
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {renderContent()}
            </div>
        </div>
    );
};

// Sub-components for consistency
const CustomizationCard = ({ title, icon: Icon, desc, children }) => (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#FAFBFC' }}>
            <Icon size={18} color="#1B6B3A" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#1E293B' }}>{title}</h3>
        </div>
        <div style={{ padding: '1.25rem' }}>{children}</div>
    </div>
);

const PremiumToggleItem = ({ label, desc, active, onToggle }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
        <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '750', color: '#334155' }}>{label}</h4>
            {desc && <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem', lineHeight: '1.4' }}>{desc}</p>}
        </div>
        <Toggle checked={active} onChange={onToggle} size="md" />
    </div>
);

const CheckboxWithLabel = ({ label, checked, onChange }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ width: '16px', height: '16px', accentColor: '#1B6B3A', cursor: 'pointer' }} />
        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>{label}</span>
    </label>
);

const Divider = () => <div style={{ height: '1px', background: '#F1F5F9' }} />;

export default BusinessCustomization;
