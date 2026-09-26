import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, Minus, Check, Save, UserPlus, Users, Loader2 } from 'lucide-react';

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
        label: 'FinTech',
        children: [
          { id: 140, label: 'Finance FinTech Access' }
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
          { id: 214, label: 'Sales Warranty Claims' }
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

  const [subIds, setSubIds] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Create Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    prefix: '', password: '', firstName: '', lastName: ''
  });

  const getAuthToken = () => localStorage.getItem('bnx_auth_token');

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
  }, []);

  const handleSelectSubId = (subId) => {
    setSelectedSubId(subId);
    setSelectedPermissions(subId.permissions || []);
    setShowCreateForm(false);
  };

  const handleTogglePermissions = (ids, check) => {
    setSelectedPermissions(prev => {
      if (check) {
        // Add all ids that aren't already there
        const newIds = ids.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
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

    const payload = {
      ...createForm,
      accountType: 'BUSINESS',
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

      if (!response.ok) throw new Error('Failed to create Sub-ID');

      showToast('Sub-ID created successfully!', 'success');
      setShowCreateForm(false);
      setCreateForm({ prefix: '', password: '', firstName: '', lastName: '' });
      fetchSubIds(); // Refresh list
    } catch (error) {
      console.error(error);
      showToast('Failed to create Sub-ID.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
            <Users size={18} className="text-gray-600" /> Sub-IDs
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
          ) : subIds.length === 0 ? (
            <div className="text-center p-6 text-sm text-gray-500">
              No Sub-IDs found. Create one to get started.
            </div>
          ) : (
            subIds.map(subId => (
              <button
                key={subId.id}
                onClick={() => handleSelectSubId(subId)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedSubId?.id === subId.id
                    ? 'bg-green-50 border-green-500 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-300'
                  }`}
              >
                <div className="font-bold text-gray-800">{subId.firstName} {subId.lastName}</div>
                {subId.email && <div className="text-xs text-gray-500 mt-1 truncate" title={subId.email}>{subId.email}</div>}
                <div className="text-xs text-gray-400 mt-0.5 font-mono">ID: {subId.username || subId.prefix || subId.id}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-white p-8">

        {showCreateForm ? (
          <div className="max-w-md mx-auto mt-10 p-8 border border-gray-200 rounded-2xl shadow-sm bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Sub-ID</h2>
            <form onSubmit={handleCreateSubId} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Prefix / Username</label>
                <input required type="text" value={createForm.prefix} onChange={e => setCreateForm({ ...createForm, prefix: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" placeholder="e.g. staff_01" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                  <input required type="text" value={createForm.firstName} onChange={e => setCreateForm({ ...createForm, firstName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                  <input required type="text" value={createForm.lastName} onChange={e => setCreateForm({ ...createForm, lastName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input required type="password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="••••••••" />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-6 bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                Create Account
              </button>
            </form>
          </div>
        ) : selectedSubId ? (
          <div className="max-w-4xl mx-auto">

            <div className="flex justify-between items-center mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div>
                <h1 className="text-2xl font-black text-gray-900">Manage Permissions</h1>
                <p className="text-gray-500 mt-1">Configuring access for <strong className="text-gray-800">{selectedSubId.firstName} {selectedSubId.lastName}</strong></p>
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
