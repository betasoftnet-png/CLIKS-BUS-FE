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
    const res = await apiClient.post('/compliance/generate-einvoice', invoiceData);
    return res.data?.data || res.data || res;
  },

  /**
   * Generate Government E-Invoice (IRN)
   * @param {Object} invoiceData Invoice payload
   */
  generateEInvoice: async (invoiceData) => {
    const res = await apiClient.post('/compliance/generate-einvoice', invoiceData);
    return res.data?.data || res.data || res;
  },

  /**
   * Generate E-Way Bill for delivery shipment
   * @param {Object} shipmentData Shipment payload including vehicleNumber & distance
   */
  generateEWayBill: async (shipmentData) => {
    const res = await apiClient.post('/compliance/generate-ewaybill', shipmentData);
    return res.data?.data || res.data || res;
  },

  /**
   * Fetch generated E-Way Bills
   */
  getEWayBills: async () => {
    const res = await apiClient.get('/compliance/ewaybills');
    return res.data?.data || res.data?.results?.ewayBills || res.data || [];
  },

  /**
   * Fetch Delivery Challans & Shipments
   */
  getDeliveryChallans: async () => {
    const res = await apiClient.get('/compliance/challans');
    return res.data?.data || res.data?.deliveries || [];
  },

  /**
   * Create a new Delivery Challan & Dispatch Shipment
   * @param {Object} challanData
   */
  createDeliveryChallan: async (challanData) => {
    const res = await apiClient.post('/compliance/challans', challanData);
    return res.data?.data || res.data;
  },

  /**
   * Confirm Delivery Challan with OTP verification
   * @param {string|number} id Challan or delivery ID
   * @param {Object} verificationData { otp_code, ... }
   */
  confirmDeliveryChallan: async (id, verificationData) => {
    const res = await apiClient.post(`/compliance/challans/${id}/confirm`, verificationData);
    return res.data?.data || res.data;
  },

  /**
   * Fetch Delivery Drivers / Fleet Staff
   */
  getDrivers: async () => {
    const res = await apiClient.get('/compliance/drivers');
    return res.data?.data || res.data?.drivers || [];
  },

  /**
   * Add a new Delivery Driver
   * @param {Object} driverData { name, vehicle_number, mobile, vehicle_type, status }
   */
  addDriver: async (driverData) => {
    const res = await apiClient.post('/compliance/drivers', driverData);
    return res.data?.data || res.data;
  },

  /**
   * Update an existing Delivery Driver
   * @param {string|number} id
   * @param {Object} driverData
   */
  updateDriver: async (id, driverData) => {
    const res = await apiClient.put(`/compliance/drivers/${id}`, driverData);
    return res.data?.data || res.data;
  },

  /**
   * Delete a Delivery Driver
   * @param {string|number} id
   */
  deleteDriver: async (id) => {
    const res = await apiClient.delete(`/compliance/drivers/${id}`);
    return res.data;
  }
};

export default complianceService;

