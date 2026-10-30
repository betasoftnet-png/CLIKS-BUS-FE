import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronDown, Minus, Check, Save, UserPlus, Users, Loader2, Receipt, Building, MapPin, Store } from 'lucide-react';
import { branchService } from '../services/branchService';
import { useAuth } from '../context';

const PERMISSIONS_HIERARCHY = [
  {
    label: 'Finance',
    children: [
      {
        label: 'Accounting',
        children: [
          { id: 110, label: 'Finance Accounting All' },
          { id: 111, label: 'Finance P&L' },
          { id: 112, label: 'Finance Balance Sheet' },
          { id: 113, label: 'Finance Receivables & Payables' },
          { id: 114, label: 'Finance Expenses' },
          { id: 115, label: 'Finance Cash & Bank' }
        ]
      },
      {
        label: 'Expenses',
        children: [
          { id: 120, label: 'Finance Expenses All' },
          { id: 121, label: 'Finance Exp Registry ITC' },
          { id: 122, label: 'Finance Exp Recurring' },
          { id: 123, label: 'Finance Exp Dept Budgets' },
          { id: 124, label: 'Finance Exp Staff Reimburse' }
        ]
      },
      {
        label: 'Tax',
        children: [
          { id: 130, label: 'Finance Tax All' },
          { id: 131, label: 'Finance Tax GSTR1' },
          { id: 132, label: 'Finance Tax GSTR2' },
          { id: 133, label: 'Finance Tax GSTR3B' },
          { id: 134, label: 'Finance Tax GSTR9' },
          { id: 135, label: 'Finance Tax E-Invoice' },
          { id: 136, label: 'Finance Tax E-Way' }
        ]
      },
      {
        label: 'Audit Center',
        children: [
          { id: 140, label: 'Finance Audit Center Access' }
        ]
      }
    ]
  },
  {
    label: 'Sales',
    children: [
      {
        label: 'Sales Invoice',
        children: [
          { id: 210, label: 'Sales Section All' },
          { id: 211, label: 'Sales Invoice' },
          { id: 212, label: 'Sales Orders List' },
          { id: 213, label: 'Sales Returns' },
          { id: 214, label: 'Sales Warranty Claims' },
          { id: 215, label: 'Generate Invoice Only (Strict: No Other Access)' }
        ]
      },
      {
        label: 'Customers',
        children: [
          { id: 220, label: 'Sales Cust All' },
          { id: 221, label: 'Sales Cust List' },
          { id: 222, label: 'Sales Cust Aging Reports' },
          { id: 223, label: 'Sales Cust Points Rules' }
        ]
      }
    ]
  },
  {
    label: 'Purchases',
    children: [
      {
        label: 'Purchase Invoice',
        children: [
          { id: 310, label: 'Purchases Section All' },
          { id: 311, label: 'Purchases Invoice' },
          { id: 312, label: 'Purchases Orders PO' },
          { id: 313, label: 'Purchases Bills Invoices' },
          { id: 314, label: 'Purchases Returns' }
        ]
      },
      {
        label: 'Suppliers',
        children: [
          { id: 320, label: 'Purchases Supp All' },
          { id: 321, label: 'Purchases Supp List' },
          { id: 322, label: 'Purchases Supp Ledger' },
          { id: 323, label: 'Purchases Supp Aging Reminders' }
        ]
      }
    ]
  },
  {
    label: 'Inventory',
    children: [
      {
        label: 'Products',
        children: [
          { id: 411, label: 'Inventory Products' }
        ]
      },
      {
        label: 'Stock',
        children: [
          { id: 410, label: 'Inventory Section All' },
          { id: 412, label: 'Inventory Stock' },
          { id: 413, label: 'Inventory Stock Registry' },
          { id: 414, label: 'Inventory Inward Outward' },
          { id: 415, label: 'Inventory Transfers' },
          { id: 416, label: 'Inventory Batches Expiry' }
        ]
      },
      {
        label: 'Warehouse',
        children: [
          { id: 420, label: 'Inventory WH All' },
          { id: 421, label: 'Inventory WH Godowns' },
          { id: 422, label: 'Inventory WH Stock Registry' },
          { id: 423, label: 'Inventory WH Goods Logs' },
          { id: 424, label: 'Inventory WH Inter Transfers' }
        ]
      }
    ]
  },
  {
    label: 'HR',
    children: [
      {
        label: 'Staff',
        children: [
          { id: 510, label: 'HR Staff All' },
          { id: 511, label: 'HR Staff Profiles' },
          { id: 512, label: 'HR Staff Leave Rosters' },
          { id: 513, label: 'HR Staff Appraisals' },
          { id: 514, label: 'HR Staff Reimbursements' }
        ]
      },
      {
        label: 'Attendance',
        children: [
          { id: 520, label: 'HR Att All' },
          { id: 521, label: 'HR Att Today Logs' },
          { id: 522, label: 'HR Att History Ledgers' },
          { id: 523, label: 'HR Att Shift Configs' },
          { id: 524, label: 'HR Att GPS Fencing' },
          { id: 525, label: 'HR Att Correction Verify' },
          { id: 526, label: 'HR Att Calendar' }
        ]
      },
      {
        label: 'Payroll',
        children: [
          { id: 530, label: 'HR Pay All' },
          { id: 531, label: 'HR Pay Monthly Register' },
          { id: 532, label: 'HR Pay Salary Structures' },
          { id: 533, label: 'HR Pay Compliance' },
          { id: 534, label: 'HR Pay Loans Advances' }
        ]
      }
    ]
  },
  {
    label: 'POS Billing',
    children: [
      { id: 600, label: 'POS Billing' }
    ]
  },
  {
    label: 'Simple Billing',
    children: [
      { id: 1100, label: 'Simple Billing' }
    ]
  },
  {
    label: 'Reports',
    children: [
      { id: 700, label: 'Reports' }
    ]
  },
  {
    label: 'Barcode Gen',
    children: [
      { id: 800, label: 'Barcode Gen' }
    ]
  },
  {
    label: 'Marketing',
    children: [
      { id: 900, label: 'Marketing' }
    ]
  }
];

// Helper to get all leaf IDs for a node
const getLeafIds = (node) => {
  if (node.id) return [node.id];
  let ids = [];
  if (node.children) {
    node.children.forEach(child => {
      ids = [...ids, ...getLeafIds(child)];
    });
  }
  return ids;
};

// Recursive Component for Tree Nodes
const PermissionNode = ({ node, selectedIds, onToggle }) => {
  const [expanded, setExpanded] = useState(true);

  const isLeaf = !!node.id;
  const leafIds = useMemo(() => getLeafIds(node), [node]);

  const checkedCount = leafIds.filter(id => selectedIds.includes(id)).length;
  const isChecked = checkedCount === leafIds.length && leafIds.length > 0;
  const isIndeterminate = checkedCount > 0 && checkedCount < leafIds.length;

  const handleCheck = () => {
    onToggle(leafIds, !isChecked);
  };

  return (
    <div className="ml-6 mt-2">
      <div className="flex items-center gap-2 py-1">
        {!isLeaf ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-5 h-5 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <div className="w-5" /> // spacer
        )}

        <div
          onClick={handleCheck}
          className={`
            w-4 h-4 rounded border flex items-center justify-center cursor-pointer
            ${isChecked ? 'bg-green-600 border-green-600' : isIndeterminate ? 'bg-green-100 border-green-600' : 'border-gray-300 bg-white hover:border-green-500'}
          `}
        >
          {isChecked && <Check size={12} className="text-white" />}
          {isIndeterminate && <Minus size={12} className="text-green-600" />}
        </div>

        <span
          onClick={handleCheck}
          className="text-sm text-gray-700 cursor-pointer select-none font-medium"
        >
          {node.label}
        </span>
      </div>

      {expanded && node.children && (
        <div className="border-l border-gray-200 ml-2.5">
          {node.children.map((child, idx) => (
            <PermissionNode
              key={child.id || child.label + idx}
              node={child}
              selectedIds={selectedIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PermissionManager = () => {
  const API_BASE = import.meta.env.VITE_API_SUB_BASE_URL || '';
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const isBranchManager = Boolean(user && (user.is_sub_id || user.role === 'sub_id' || user.role === 'SUB_ID') && user.branch_id);
  const managerBranchId = user?.branch_id ? String(user.branch_id) : null;

  const [subIds, setSubIds] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [branches, setBranches] = useState([]);
  const [isUpdatingBranch, setIsUpdatingBranch] = useState(false);

  // Create Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    prefix: '', password: '', firstName: '', lastName: '', branchId: '', branchName: ''
  });

  // Handle incoming showroom navigation or branch manager default lock
  useEffect(() => {
    const passedBranchId = location.state?.branchId || searchParams.get('branchId') || (isBranchManager ? managerBranchId : null);
    const passedBranchName = location.state?.branchName || searchParams.get('branchName') || (isBranchManager ? user?.branch_name : null);
    const shouldOpenCreate = location.state?.autoCreate || searchParams.get('action') === 'create' || Boolean(passedBranchId);

    if (shouldOpenCreate) {
      setShowCreateForm(true);
      setSelectedSubId(null);
    }
    if (passedBranchId) {
      setCreateForm(prev => ({
        ...prev,
        branchId: String(passedBranchId),
        branchName: passedBranchName || prev.branchName
      }));
    }
  }, [location.state, searchParams, isBranchManager, managerBranchId, user?.branch_name]);

  const getAuthToken = () => localStorage.getItem('bnx_auth_token') || localStorage.getItem('books_auth_token');

  const fetchBranches = async () => {
    try {
      const res = await branchService.getBranches();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setBranches(list);
    } catch (e) {
      console.warn('[PermissionManager] Could not load branches:', e.message);
    }
  };

  const fetchSubIds = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/subid/list`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (!response.ok) throw new Error('Failed to fetch Sub-IDs');
      const data = await response.json();
      
      let parsedSubIds = [];
      if (Array.isArray(data)) {
        parsedSubIds = data;
      } else if (data && Array.isArray(data.data)) {
        parsedSubIds = data.data;
      } else if (data && Array.isArray(data.subIds)) {
        parsedSubIds = data.subIds;
      } else if (data && Array.isArray(data.subids)) {
        parsedSubIds = data.subids;
      }

      setSubIds(parsedSubIds);

      // If list is empty, prompt creation automatically
      if (parsedSubIds.length === 0) {
        setShowCreateForm(true);
      }
    } catch (error) {
      console.error(error);
      showToast('Error fetching Sub-IDs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubIds();
    fetchBranches();
  }, []);

  const handleSelectSubId = (subId) => {
    setSelectedSubId(subId);
    setSelectedPermissions(subId.permissions || []);
    setShowCreateForm(false);
  };

  const handleTogglePermissions = (ids, check) => {
    setSelectedPermissions(prev => {
      if (check) {
        // If checking GENERATE_INVOICE_ONLY (215)
        if (ids.includes(215)) {
          // Strict invoice-only mode isolates permission to only 215
          return [215];
        }
        // If checking other permissions, remove 215 if present
        const without215 = prev.filter(id => id !== 215);
        const newIds = ids.filter(id => !without215.includes(id));
        return [...without215, ...newIds];
      } else {
        // Remove all ids
        return prev.filter(id => !ids.includes(id));
      }
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedSubId) return;
    setIsSaving(true);

    try {
      const response = await fetch(`${API_BASE}/api/subid/${selectedSubId.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedPermissions)
      });

      if (!response.ok) throw new Error('Failed to save permissions');

      showToast('Permissions saved successfully!', 'success');

      // Update local state to reflect change
      setSubIds(prev => prev.map(s => s.id === selectedSubId.id ? { ...s, permissions: selectedPermissions } : s));
      setSelectedSubId(prev => ({ ...prev, permissions: selectedPermissions }));

    } catch (error) {
      console.error(error);
      showToast('Failed to save permissions.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSubId = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const assignedBranchId = isBranchManager ? managerBranchId : createForm.branchId;
    const selectedBranch = branches.find(b => String(b.id) === String(assignedBranchId));
    const assignedBranchName = isBranchManager
      ? (user?.branch_name || selectedBranch?.name || createForm.branchName)
      : (selectedBranch ? selectedBranch.name : (createForm.branchName || undefined));

    const payload = {
      prefix: createForm.prefix.trim(),
      password: createForm.password,
      firstName: createForm.firstName.trim(),
      lastName: createForm.lastName.trim(),
      accountType: 'BUSINESS',
      branchId: assignedBranchId ? parseInt(assignedBranchId) : undefined,
      branchName: assignedBranchName || undefined,
      permissions: []
    };

    try {
      const response = await fetch(`${API_BASE}/api/subid/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create Sub-ID');
      }

      showToast('Sub-ID created successfully with branch assignment!', 'success');
      setShowCreateForm(false);
      setCreateForm({ prefix: '', password: '', firstName: '', lastName: '', branchId: '', branchName: '' });
      fetchSubIds(); // Refresh list
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Failed to create Sub-ID.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSubIdBranch = async (subId, newBranchId) => {
    setIsUpdatingBranch(true);
    try {
      const found = branches.find(b => b.id === newBranchId);
      const bName = found ? found.name : '';
      await branchService.updateSubIdBranch(subId, { branchId: newBranchId, branchName: bName });
      showToast('Showroom branch updated successfully!', 'success');
      setSubIds(prev => prev.map(s => s.id === subId ? { ...s, branchId: newBranchId, branchName: bName } : s));
      setSelectedSubId(prev => prev?.id === subId ? { ...prev, branchId: newBranchId, branchName: bName } : prev);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update branch assignment', 'error');
    } finally {
      setIsUpdatingBranch(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const displayedSubIds = (isBranchManager && managerBranchId)
    ? subIds.filter(s => String(s.branchId) === String(managerBranchId))
    : subIds;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 font-sans">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-6 px-4 py-3 rounded shadow-lg z-50 text-white text-sm font-semibold transition-opacity duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Sidebar: Sub-ID List */}
      <div className="w-1/4 min-w-[250px] bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users size={18} className="text-gray-600" />
            {isBranchManager ? `${user?.branch_name || 'Showroom'} Staff` : 'Sub-IDs'}
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-2 text-green-700 bg-green-100 rounded-full hover:bg-green-200 transition"
            title="Create New Sub-ID"
          >
            <UserPlus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="flex justify-center p-6"><Loader2 className="animate-spin text-gray-400" /></div>
          ) : displayedSubIds.length === 0 ? (
            <div className="text-center p-6 text-sm text-gray-500">
              {isBranchManager ? 'No staff Sub-IDs created for this showroom yet.' : 'No Sub-IDs found. Create one to get started.'}
            </div>
          ) : (
            displayedSubIds.map(subId => (
              <button
                key={subId.id}
                onClick={() => handleSelectSubId(subId)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedSubId?.id === subId.id
                    ? 'bg-green-50 border-green-500 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-300'
                  }`}
              >
                <div className="font-bold text-gray-800 flex items-center justify-between">
                  <span>{subId.firstName} {subId.lastName}</span>
                </div>
                {subId.email && <div className="text-xs text-gray-500 mt-0.5 truncate" title={subId.email}>{subId.email}</div>}
                
                {/* Branch Assignment Badge */}
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    subId.branchName || subId.branchId
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Building size={11} className={subId.branchName || subId.branchId ? 'text-emerald-600' : 'text-gray-400'} />
                    {subId.branchName || (subId.branchId ? `Branch #${subId.branchId}` : 'All Showrooms')}
                  </span>
                </div>

                <div className="text-[11px] text-gray-400 mt-1 font-mono">ID: {subId.username || subId.prefix || subId.id}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-white p-8">

        {showCreateForm ? (
          <div className="max-w-md mx-auto mt-6 p-8 border border-gray-200 rounded-2xl shadow-sm bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <UserPlus className="text-emerald-600" /> Create New Sub-ID
            </h2>

            {createForm.branchId && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-sm text-emerald-900">
                <Building className="text-emerald-600 flex-shrink-0" size={20} />
                <div>
                  <div className="font-bold">Showroom Manager Account</div>
                  <div className="text-xs text-emerald-700">Assigning to: <strong>{createForm.branchName || `Branch #${createForm.branchId}`}</strong></div>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateSubId} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Prefix / Username</label>
                <input required type="text" value={createForm.prefix} onChange={e => setCreateForm({ ...createForm, prefix: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" placeholder="e.g. cashier_tambaram" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                  <input required type="text" value={createForm.firstName} onChange={e => setCreateForm({ ...createForm, firstName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Ramesh" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                  <input required type="text" value={createForm.lastName} onChange={e => setCreateForm({ ...createForm, lastName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Kumar" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input required type="password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="••••••••" />
              </div>

              {/* Showroom / Branch Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Building size={15} className="text-emerald-600" />
                  Assign Showroom / Branch
                </label>
                {isBranchManager ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                      <Building size={16} className="text-emerald-600" />
                      {user?.branch_name || (branches.find(b => String(b.id) === String(managerBranchId))?.name) || `Showroom #${managerBranchId}`}
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">
                      🔒 As Showroom Manager, all Sub-IDs you create are automatically locked to your showroom.
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      value={createForm.branchId}
                      onChange={e => {
                        const bId = e.target.value;
                        const found = branches.find(b => String(b.id) === String(bId));
                        setCreateForm({
                          ...createForm,
                          branchId: bId,
                          branchName: found ? found.name : ''
                        });
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-gray-800 text-sm font-medium"
                    >
                      <option value="">-- All Showrooms (HQ Admin) --</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code || `BR-${b.id}`})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Locks this Sub-ID to this showroom's stock and POS billing counter.
                    </p>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-6 bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                Create Sub-ID Account
              </button>
            </form>
          </div>
        ) : selectedSubId ? (
          <div className="max-w-4xl mx-auto">

            <div className="flex justify-between items-center mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-200 flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900">Manage Permissions</h1>
                <p className="text-gray-500 mt-1">Configuring access for <strong className="text-gray-800">{selectedSubId.firstName} {selectedSubId.lastName}</strong> ({selectedSubId.username || selectedSubId.email})</p>

                {/* Showroom Branch Reassignment */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                    <Building size={14} className="text-emerald-600" /> Assigned Showroom:
                  </span>
                  {isBranchManager ? (
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {selectedSubId.branchName || (selectedSubId.branchId ? `Branch #${selectedSubId.branchId}` : user?.branch_name || 'Your Showroom')}
                    </span>
                  ) : (
                    <select
                      value={selectedSubId.branchId || ''}
                      disabled={isUpdatingBranch}
                      onChange={(e) => {
                        const newId = e.target.value ? parseInt(e.target.value) : null;
                        handleUpdateSubIdBranch(selectedSubId.id, newId);
                      }}
                      className="px-3 py-1 text-xs font-bold rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 outline-none cursor-pointer shadow-sm"
                    >
                      <option value="">All Showrooms / Global</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  )}
                  {isUpdatingBranch && <Loader2 size={14} className="animate-spin text-emerald-600" />}
                </div>
              </div>

              <button
                onClick={handleSavePermissions}
                disabled={isSaving}
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Changes
              </button>
            </div>

            {/* Quick Preset: Only Generate Invoice (Strict Mode) */}
            <div className={`mb-6 p-5 rounded-2xl border transition-all ${
                selectedPermissions.includes(215)
                  ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300'
            }`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                    selectedPermissions.includes(215) ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Receipt size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-gray-900">Only Generate Invoice Control (Strict Mode)</h3>
                      {selectedPermissions.includes(215) ? (
                        <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-200 text-amber-900 rounded-full">ACTIVE</span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">INACTIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">
                      Restricts this Sub-ID to <strong>only generating invoices</strong>. All other access (Dashboard, customer databases, purchase lists, stock, financial reports, simple billing, and business settings) is completely blocked.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedPermissions.includes(215)) {
                      setSelectedPermissions(prev => prev.filter(id => id !== 215));
                    } else {
                      setSelectedPermissions([215]);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
                    selectedPermissions.includes(215)
                      ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                      : 'bg-gray-900 text-white hover:bg-black shadow-sm'
                  }`}
                >
                  {selectedPermissions.includes(215) ? 'Disable Strict Mode' : '⚡ Enable Invoice Only'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Access Control Hierarchy</div>

              <div className="-ml-6">
                {PERMISSIONS_HIERARCHY.map((module, idx) => (
                  <PermissionNode
                    key={module.label + idx}
                    node={module}
                    selectedIds={selectedPermissions}
                    onToggle={handleTogglePermissions}
                  />
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Users size={64} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">Select a Sub-ID from the sidebar to manage permissions</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PermissionManager;
