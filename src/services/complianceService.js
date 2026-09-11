import { apiClient } from '../api/client';

/**
 * Compliance Service
 * 
 * Masters India GST Compliance integration:
 * 1. GSTIN Search & Verification (Taxpayer details, Trade Name, Legal Name, Address, Type)
 * 2. E-Invoicing IRN Generation (AckNo, AckDt, Irn, SignedQRCode)
 * 3. E-Way Bill Generation (ewayBillNo, validUpto, PDF URL)
 */
export const complianceService = {
  /**
   * Verify GSTIN and fetch official taxpayer details
   * @param {string} gstin 15-character alphanumeric GSTIN
   */
  verifyGstin: async (gstin) => {
    if (!gstin || typeof gstin !== 'string' || gstin.trim().length !== 15) {
      throw new Error('Valid 15-character GSTIN is required.');
    }
    const cleanGstin = gstin.trim().toUpperCase();
    const res = await apiClient.get(`/compliance/verify-gstin/${cleanGstin}`);
    return res.data?.data || res.data || res;
  },

  /**
   * Generate IRN for an invoice
   * @param {Object} invoiceData Invoice payload
   */
  generateIRN: async (invoiceData) => {
    const res = await apiClient.post('/compliance/generate-irn', invoiceData);
    return res.data?.data || res.data || res;
  },

  /**
   * Generate E-Way Bill for delivery shipment
   * @param {Object} shipmentData Shipment payload including vehicleNumber & distance
   */
  generateEWayBill: async (shipmentData) => {
    const res = await apiClient.post('/compliance/generate-ewaybill', shipmentData);
    return res.data?.data || res.data || res;
  }
};

export default complianceService;
