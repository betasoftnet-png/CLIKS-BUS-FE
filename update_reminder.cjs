const fs = require('fs');
const path = '/Users/hi/Desktop/Cliks/CLIKS-BUS-FE/src/pages/BusinessAccounting.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update the state
const stateTarget = `    // Send Reminder Form State
    const [reminderForm, setReminderForm] = useState({
        channel: 'WhatsApp',
        template: 'Standard Reminder'
    });`;

const stateReplace = `    // Send Reminder Form State
    const [reminderForm, setReminderForm] = useState({
        channel: 'WhatsApp',
        template: 'Standard Reminder',
        toEmail: ''
    });

    useEffect(() => {
        if (isReminderOpen && selectedInvoiceForModal) {
            setReminderForm(prev => ({ ...prev, toEmail: selectedInvoiceForModal.client_email || '' }));
        }
    }, [isReminderOpen, selectedInvoiceForModal]);`;

if (content.includes(stateTarget)) {
    content = content.replace(stateTarget, stateReplace);
}

// 2. Update the modal UI
const uiTarget = `                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Recipient</label>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '750', color: '#1E293B' }}>{selectedInvoiceForModal.client_name} ({selectedInvoiceForModal.client_email || 'No email'})</p>
                                        </div>`;

const uiReplace = `                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Recipient ({selectedInvoiceForModal.client_name})</label>
                                            <input 
                                                type="email" 
                                                value={reminderForm.toEmail} 
                                                onChange={(e) => setReminderForm(prev => ({ ...prev, toEmail: e.target.value }))}
                                                placeholder="Enter recipient email address"
                                                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', background: 'white' }}
                                            />
                                        </div>`;

if (content.includes(uiTarget)) {
    content = content.replace(uiTarget, uiReplace);
}

// 3. Update the send logic
const sendTarget = `                                                        const toEmail = selectedInvoiceForModal.client_email;
                                                        if (!toEmail) {
                                                            alert("Client email is missing. Please update the invoice with a valid email address.");
                                                            return;
                                                        }`;

const sendReplace = `                                                        const toEmail = reminderForm.toEmail;
                                                        if (!toEmail) {
                                                            alert("Please provide a valid recipient email address.");
                                                            return;
                                                        }`;

if (content.includes(sendTarget)) {
    content = content.replace(sendTarget, sendReplace);
}

fs.writeFileSync(path, content);
console.log('Successfully updated BusinessAccounting.jsx reminder logic');
