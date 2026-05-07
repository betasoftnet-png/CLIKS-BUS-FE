import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const AccordionRoot = ({ children, className = '' }) => {
    return (
        <div className={`accordion-root ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {children}
        </div>
    );
};

const AccordionItem = ({ children, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={`accordion-item ${className}`}
            data-state={isOpen ? 'open' : 'closed'}
            style={{
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: isOpen ? '1rem' : '0'
            }}
        >
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { isOpen, setIsOpen });
                }
                return child;
            })}
        </div>
    );
};

const AccordionTrigger = ({ children, isOpen, setIsOpen, className = '' }) => {
    return (
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`accordion-trigger ${className}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '1rem 0',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#1E293B'
            }}
        >
            {children}
            <ChevronDown
                size={18}
                className="accordion-chevron"
                style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: '#64748B'
                }}
            />
        </button>
    );
};

const AccordionContent = ({ children, isOpen, className = '' }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                >
                    <div className={`accordion-content ${className}`} style={{ paddingBottom: '0.5rem', paddingTop: '0', color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export { AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent };
