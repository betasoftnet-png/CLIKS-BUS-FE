import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import {
    AccordionRoot,
    AccordionItem,
    AccordionTrigger,
    AccordionContent
} from '../components/ui/accordion';

const FAQ = () => {
    const faqs = [
        {
            question: "How do I reset my password?",
            answer: "You can reset your password by going to the Profile page, navigating to the 'Security & Access' tab (if available) or clicking 'Forgot Password' on the login screen. Follow the email instructions to create a new one."
        },
        {
            question: "Can I export my financial data?",
            answer: "Yes! Navigate to the 'Profile' page and select the 'Data & Backup' tab. There you will find options to export your data as CSV or JSON format."
        },
        {
            question: "How do I add a new team member?",
            answer: "Team management features are available in the 'People' section under 'Books'. You can invite members via email and assign them roles such as Admin, Editor, or Viewer."
        },
        {
            question: "Is my data secure?",
            answer: "We use industry-standard encryption for all data transmission and storage. Your financial information is never shared with third parties without your explicit consent."
        },
        {
            question: "Can I use the app offline?",
            answer: "Currently, the application requires an active internet connection to sync data in real-time. An offline mode is planned for future updates."
        }
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Breadcrumbs />
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.5rem' }}>Help & Support</h1>
                <p style={{ color: '#64748B' }}>Find answers to common questions.</p>
            </div>

            {/* FAQ Accordion */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>

                <AccordionRoot>
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </AccordionRoot>
            </div>
        </div>
    );
};

export default FAQ;
