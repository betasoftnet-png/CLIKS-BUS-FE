import React from 'react';
import Barcode from 'react-barcode';

/**
 * ProductBarcodeGraphic
 * Inline visual barcode zebra stripes component
 */
export const ProductBarcodeGraphic = ({
    value,
    width = 1.6,
    height = 48,
    fontSize = 11,
    displayValue = true,
    style = {}
}) => {
    if (!value || !String(value).trim()) return null;
    const clean = String(value).trim();

    try {
        return (
            <div 
                style={{ 
                    background: '#FFFFFF', 
                    padding: '4px 6px', 
                    borderRadius: '8px', 
                    display: 'inline-flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid #E2E8F0',
                    boxSizing: 'border-box',
                    ...style 
                }}
            >
                <Barcode
                    value={clean}
                    format="CODE128"
                    width={width}
                    height={height}
                    fontSize={fontSize}
                    margin={2}
                    background="#FFFFFF"
                    lineColor="#000000"
                    displayValue={displayValue}
                />
            </div>
        );
    } catch (err) {
        return (
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#166534', fontWeight: '800' }}>
                {clean}
            </span>
        );
    }
};

export default ProductBarcodeGraphic;
