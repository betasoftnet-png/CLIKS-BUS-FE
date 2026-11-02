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
    const clean = String(value || '').trim();

    useEffect(() => {
        if (!svgRef.current || !clean) return;
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
            try {
                JsBarcode(svgRef.current, clean, {
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
    }, [clean, width, height, fontSize, displayValue]);

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
                ...style 
            }}
        >
            <svg ref={svgRef} />
        </div>
    );
};

export default ProductBarcodeGraphic;

