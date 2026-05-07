import React from 'react';
import { motion as Motion } from 'framer-motion';

export const Toggle = ({ checked, onChange, size = 'md', label, disabled = false }) => {
    // Dimensions based on size prop (currently just 'md' supported as standard)
    const dimensions = {
        md: { width: 44, height: 24, handle: 20, padding: 2 },
        sm: { width: 36, height: 20, handle: 16, padding: 2 },
        lg: { width: 52, height: 28, handle: 24, padding: 2 },
    };

    const { width, height, handle, padding } = dimensions[size] || dimensions.md;

    return (
        <label
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1
            }}
        >
            <div
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    backgroundColor: checked ? '#1B6B3A' : '#CBD5E1',
                    borderRadius: '999px',
                    position: 'relative',
                    transition: 'background-color 0.2s ease',
                    flexShrink: 0
                }}
            >
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    style={{ position: 'absolute', opacity: 0, cursor: 'inherit', height: '100%', width: '100%', margin: 0 }}
                    aria-label={label}
                />
                <Motion.div
                    initial={false}
                    animate={{ x: checked ? width - handle - padding : padding }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{
                        width: `${handle}px`,
                        height: `${handle}px`,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: `${padding}px`,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                />
            </div>
            {label && (
                <span style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 500 }}>
                    {label}
                </span>
            )}
        </label>
    );
};
