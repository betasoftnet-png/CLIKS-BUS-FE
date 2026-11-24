import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

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
    const svgRef = useRef(null);
    const clean = String(value || '').trim().slice(0, 24);
    const isEan13 = /^\d{13}$/.test(clean);

    useEffect(() => {
        if (!svgRef.current || !clean) return;
        try {
            JsBarcode(svgRef.current, clean, {
                format: isEan13 ? "EAN13" : "CODE128",
                width: isEan13 ? Math.max(1.3, width) : width,
                height,
                fontSize,
                displayValue,
                margin: 4,
                background: "#FFFFFF",
                lineColor: "#000000"
            });
        } catch {
            try {
                JsBarcode(svgRef.current, clean, {
                    format: "CODE128",
                    width,
                    height,
                    fontSize,
                    displayValue,
                    margin: 2,
                    background: "#FFFFFF",
                    lineColor: "#000000"
                });
            } catch {
                // gracefully ignore invalid inputs
            }
        }
    }, [clean, width, height, fontSize, displayValue, isEan13]);

    if (!clean) return null;

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
                maxWidth: '100%',
                overflow: 'hidden',
                ...style 
            }}
        >
            <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
        </div>
    );
};

export default ProductBarcodeGraphic;

