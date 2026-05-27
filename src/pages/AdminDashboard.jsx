import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://esp-backend-1ufi.onrender.com';

const STATUS_OPTIONS = [
  'PENDING', 'UNDER_REVIEW', 'NEEDS_INSPECTION', 'INSPECTION_DONE', 
  'WAITING_WORKER', 'WORKER_ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'
];

export default function AdminDashboard() {
  // --- SUPER ADMIN STATES ---
  const [upgradeEmail, setUpgradeEmail] = useState('');
  const [upgradeRole, setUpgradeRole] = useState('INSPECTOR');
  
  // --- DATA STATES ---
  const [requests, setRequests] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [inspectors, setInspectors] = useState([]); 
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({ totalTasks: 0, activeWorkers: 0, totalEarned: 0, pendingKYC: 0 });
  
  // --- UI STATES ---
  const [activeMainTab, setActiveMainTab] = useState('ANALYTICS'); // ANALYTICS, TASKS, WORKERS, CLIENTS
  const [requestFilter, setRequestFilter] = useState('ALL'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // --- INPUT STATES ---
  const [quoteInputs, setQuoteInputs] = useState({});
  const [adminNotes, setAdminNotes] = useState({});
  
  const navigate = useNavigate();

  // --------------------------------------------------------
  // DATA FETCHING (No Mock Data - 100% Database Driven)
  // --------------------------------------------------------
  useEffect(() => {
    if (activeMainTab === 'TASKS') fetchRequests(requestFilter);
    else if (activeMainTab === 'WORKERS') fetchWorkers();
    else if (activeMainTab === 'CLIENTS') fetchClients();
    else if (activeMainTab === 'ANALYTICS') fetchStats();
  }, [activeMainTab, requestFilter]);

  useEffect(() => {
    fetchInspectors();
  }, []);

  const fetchRequests = async (statusFilter) => {
    setLoading(true);
    try {
      const query = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const response = await fetch(`${API_BASE_URL}/api/admin/requests${query}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      setRequests(result.data || []);
    } catch (err) {
      setError("Failed to fetch tasks.");
    } finally { setLoading(false); }
  };

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/workers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setWorkers(data || []);
    } catch (err) {
      setError("Failed to fetch workers.");
    } finally { setLoading(false); }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/clients`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if(response.ok) {
        const data = await response.json();
        setClients(data || []);
      } else {
        setClients([]);
      }
    } catch (err) {
      setError("Failed to fetch clients.");
    } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if(response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setStats({ totalTasks: 0, activeWorkers: 0, totalEarned: 0, pendingKYC: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch stats.");
    } finally { setLoading(false); }
  };

  const fetchInspectors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/inspectors`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setInspectors(data || []);
    } catch (err) { console.error("Failed to fetch inspectors."); }
  };

  // --------------------------------------------------------
  // ACTIONS & HANDLERS
  // --------------------------------------------------------
  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchRequests(requestFilter);
    } catch (err) { alert("Error updating status"); }
  };

  const handleAssignWorker = async (requestId, workerId) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/requests/${requestId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ workerId })
      });
      alert('Worker assigned successfully!');
      fetchRequests(requestFilter); 
    } catch (err) { alert("Error assigning worker"); }
  };

  const handleAssignInspector = async (requestId, inspectorId) => {
    if (!inspectorId) return alert("Please select an Inspector.");
    const note = adminNotes[requestId] || ""; 
    try {
      await fetch(`${API_BASE_URL}/api/admin/requests/${requestId}/assign-inspector`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ inspectorId, adminNote: note }) 
      });
      alert('Inspector dispatched successfully!');
      setAdminNotes(prev => ({...prev, [requestId]: ''}));
      fetchRequests(requestFilter); 
    } catch (err) { alert("Error assigning inspector"); }
  };

  const handleKYCUpdate = async (workerId, newStatus) => {
    const isVerified = newStatus === 'APPROVED';
    try {
      await fetch(`${API_BASE_URL}/api/admin/workers/${workerId}/kyc`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status: newStatus, isVerified })
      });
      alert(`Worker marked as ${newStatus}!`);
      fetchWorkers(); 
    } catch (err) { alert("Error updating KYC"); }
  };

  const handleSendQuote = async (requestId) => {
    const price = quoteInputs[requestId];
    if (!price || price <= 0) return alert("Please enter a valid price.");
    try {
      await fetch(`${API_BASE_URL}/api/admin/requests/${requestId}/quote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ quotedPrice: price })
      });
      alert("Quote sent to client for review!");
      fetchRequests(requestFilter); 
    } catch (err) { alert("Error sending quote"); }
  };

  const handleRoleUpgrade = async () => {
    if (!upgradeEmail) return alert("Please enter an email address.");
    if (!window.confirm(`Are you sure you want to make ${upgradeEmail} a ${upgradeRole}?`)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ email: upgradeEmail, newRole: upgradeRole })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      alert(result.message);
      setUpgradeEmail(''); 
    } catch (err) { alert(err.message); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const getKYCBadge = (status) => {
    if (status === 'APPROVED') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'PENDING') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (status === 'REJECTED') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg text-lg">⚙️</div>
            <h1 className="text-xl font-black tracking-tight text-gray-900 hidden sm:block">ESP Workspace</h1>
            <h1 className="text-xl font-black tracking-tight text-gray-900 sm:hidden">ESP</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
              {localStorage.getItem('role')?.replace('_', ' ')}
            </span>
            <button 
              onClick={handleLogout} 
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* 2. SUPER ADMIN PROMOTION PANEL (Only visible to Super Admins) */}
        {localStorage.getItem('role') === 'SUPER_ADMIN' && (
          <div className="bg-gradient-to-r from-purple-900 to-indigo-800 rounded-2xl p-6 shadow-lg mb-8 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">👑 Super Admin Controls</h2>
              <p className="text-purple-200 text-sm mt-1">Promote user accounts to staff roles instantly.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input 
                type="email" 
                value={upgradeEmail} 
                onChange={(e) => setUpgradeEmail(e.target.value)} 
                placeholder="employee@company.com" 
                className="px-4 py-2.5 rounded-lg text-sm text-gray-900 w-full sm:w-64 focus:ring-2 focus:ring-purple-400 outline-none" 
              />
              <select 
                value={upgradeRole} 
                onChange={(e) => setUpgradeRole(e.target.value)} 
                className="px-4 py-2.5 rounded-lg text-sm text-gray-900 bg-white w-full sm:w-auto focus:ring-2 focus:ring-purple-400 outline-none"
              >
                <option value="INSPECTOR">Inspector</option>
                <option value="TELECALLER">Telecaller</option>
                <option value="ADMIN_MANAGER">Admin Manager</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              <button 
                onClick={handleRoleUpgrade} 
                className="bg-white text-purple-900 font-bold py-2.5 px-6 rounded-lg hover:bg-purple-50 transition shadow-sm whitespace-nowrap"
              >
                Promote User
              </button>
            </div>
          </div>
        )}

        {/* 3. MAIN NAVIGATION TABS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-8 flex overflow-x-auto scrollbar-hide">
          {['ANALYTICS', 'TASKS', 'WORKERS', 'CLIENTS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMainTab(tab)}
              className={`flex-1 min-w-[120px] py-2.5 px-4 text-sm font-bold rounded-lg transition-all text-center whitespace-nowrap ${
                activeMainTab === tab 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab === 'TASKS' ? 'Tasks & Workflows' : tab === 'WORKERS' ? 'Worker KYC' : tab}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* =========================================================================
            TAB 1: ANALYTICS
        ========================================================================= */}
        {activeMainTab === 'ANALYTICS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard title="Total Revenue" value={`₹${stats.totalEarned}`} icon="💰" color="bg-green-100 text-green-700" />
            <DashboardCard title="Total Tasks" value={stats.totalTasks} icon="📋" color="bg-blue-100 text-blue-700" />
            <DashboardCard title="Active Workers" value={stats.activeWorkers} icon="👷" color="bg-indigo-100 text-indigo-700" />
            <DashboardCard title="Pending KYC" value={stats.pendingKYC} icon="⚠️" color="bg-orange-100 text-orange-700" />
          </div>
        )}

        {/* =========================================================================
            TAB 2: TASKS & WORKFLOWS
        ========================================================================= */}
        {activeMainTab === 'TASKS' && (
          <div>
            {/* Task Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {['ALL', 'PENDING', 'NEEDS_INSPECTION', 'UNDER_REVIEW', 'WAITING_WORKER', 'IN_PROGRESS'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setRequestFilter(tab)}
                  className={`whitespace-nowrap px-5 py-2 text-xs font-bold rounded-full transition-all border ${
                    requestFilter === tab 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="text-center p-12 bg-white rounded-2xl border border-gray-200">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 font-medium">Loading workflows...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-2xl border border-gray-200">
                  <p className="text-gray-500 font-medium text-lg">No tasks found in this category.</p>
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    
                    {/* Task Header */}
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-black text-gray-900">{req.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                            {req.serviceType}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">{req.client?.email}</span>
                        </div>
                      </div>
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto p-2.5 font-bold shadow-sm"
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </div>

                    {/* Task Body */}
                    <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      
                      {/* Left: Details & Finance */}
                      <div className="space-y-6">
                        {req.status === 'INSPECTION_DONE' && req.inspectionNotes && (
                          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <span className="text-xs font-black text-amber-800 uppercase tracking-widest block mb-2 flex items-center gap-2">
                              🔍 Inspector Report
                            </span>
                            <p className="text-sm text-amber-900 italic leading-relaxed">"{req.inspectionNotes}"</p>
                          </div>
                        )}

                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                          <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Financials</h4>
                          {req.quotedPrice ? (
                            <div>
                              <span className="text-3xl font-black text-green-600">₹{req.quotedPrice}</span>
                              {req.status === 'UNDER_REVIEW' && (
                                <p className="text-xs text-orange-600 font-bold mt-2 flex items-center gap-1">
                                  <span>⏳</span> Waiting on Client Approval
                                </p>
                              )}
                            </div>
                          ) : (req.status === 'PENDING' || req.status === 'INSPECTION_DONE') ? (
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-bold">₹</span>
                                <input 
                                  type="number" 
                                  placeholder="Enter final quote" 
                                  className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                                  onChange={(e) => setQuoteInputs({...quoteInputs, [req.id]: e.target.value})}
                                />
                              </div>
                              <button 
                                onClick={() => handleSendQuote(req.id)}
                                className="bg-gray-900 text-white text-sm font-bold py-2.5 px-6 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                              >
                                Send Quote
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 font-medium">Pricing locked or pending inspection.</p>
                          )}
                        </div>
                      </div>

                      {/* Right: Logistics & Staffing */}
                      <div>
                        {req.status === 'PENDING' && (
                          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <p className="text-xs font-black text-blue-800 uppercase tracking-widest mb-3">Dispatch Inspector</p>
                            <textarea 
                              placeholder="Add instructions for the field inspector..." 
                              className="w-full text-sm border border-gray-300 p-3 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
                              value={adminNotes[req.id] || ''}
                              onChange={(e) => setAdminNotes({...adminNotes, [req.id]: e.target.value})}
                            />
                            <div className="flex flex-col sm:flex-row gap-3">
                              <select 
                                id={`inspector-select-${req.id}`} 
                                className="text-sm border border-gray-300 p-2.5 rounded-lg flex-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                              >
                                <option value="">Select available staff...</option>
                                {inspectors.map(ins => (
                                  <option key={ins.id} value={ins.id}>{ins.email.split('@')[0]}</option>
                                ))}
                              </select>
                              <button 
                                onClick={() => handleAssignInspector(req.id, document.getElementById(`inspector-select-${req.id}`).value)}
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                              >
                                Dispatch
                              </button>
                            </div>
                          </div>
                        )}

                        {req.status === 'WAITING_WORKER' && (
                          <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                            <p className="text-xs font-black text-indigo-800 uppercase tracking-widest mb-3 flex items-center justify-between">
                              <span>Interested Workers</span>
                              <span className="bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">{req.interests?.length || 0} Applied</span>
                            </p>
                            {req.interests?.length > 0 ? (
                              <div className="space-y-3">
                                {req.interests.map(interest => (
                                  <div key={interest.id} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                                    <span className="font-bold text-gray-900 truncate">{interest.worker.email.split('@')[0]}</span>
                                    {interest.status === 'ACCEPTED' ? (
                                      <span className="text-green-700 font-bold bg-green-100 px-3 py-1 rounded-md border border-green-200">Hired</span>
                                    ) : (
                                      <button 
                                        onClick={() => handleAssignWorker(req.id, interest.worker.id)} 
                                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-md font-bold hover:bg-indigo-700 transition-colors"
                                      >
                                        Hire Worker
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 bg-white rounded-lg border border-indigo-100 border-dashed">
                                <p className="text-sm text-gray-500 font-medium">No applications received yet.</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Empty state if nothing to do */}
                        {req.status !== 'PENDING' && req.status !== 'WAITING_WORKER' && (
                          <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50 p-6">
                            <p className="text-sm text-gray-400 font-medium text-center">No staffing actions required for current state.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: WORKER KYC
        ========================================================================= */}
        {activeMainTab === 'WORKERS' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center p-12 bg-white rounded-2xl border border-gray-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading worker database...</p>
              </div>
            ) : workers.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-2xl border border-gray-200">
                <p className="text-gray-500 font-medium">No workers registered.</p>
              </div>
            ) : (
              workers.map(worker => (
                <div key={worker.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-5 hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{worker.name || 'Unnamed Worker'}</h3>
                    <p className="text-sm text-gray-500 font-medium mb-3">{worker.email}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-md border ${getKYCBadge(worker.verificationStatus)}`}>
                        {worker.verificationStatus}
                      </span>
                      <span className="text-gray-300">|</span>
                      {worker.idDocumentUrl ? (
                        <a href={worker.idDocumentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1">
                          📄 View Document
                        </a>
                      ) : <span className="text-gray-400 text-sm font-medium italic">No document uploaded</span>}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                    {worker.verificationStatus === 'PENDING' && (
                      <>
                        <button onClick={() => handleKYCUpdate(worker.id, 'APPROVED')} className="flex-1 sm:flex-none bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-sm">Approve</button>
                        <button onClick={() => handleKYCUpdate(worker.id, 'REJECTED')} className="flex-1 sm:flex-none bg-red-100 text-red-700 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-red-200 transition">Reject</button>
                      </>
                    )}
                    {worker.verificationStatus === 'APPROVED' && (
                      <button onClick={() => handleKYCUpdate(worker.id, 'REJECTED')} className="w-full sm:w-auto bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition">Revoke Access</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 4: CLIENTS LIST
        ========================================================================= */}
        {activeMainTab === 'CLIENTS' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-widest">Client Name</th>
                    <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-widest">Contact Email</th>
                    <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-widest">Phone</th>
                    <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-500 font-medium">Loading clients...</td></tr>
                  ) : clients.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-500 font-medium">No clients found in the database.</td></tr>
                  ) : (
                    clients.map(client => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-5 font-bold text-gray-900">{client.name || 'Pending Setup'}</td>
                        <td className="p-5 text-sm text-gray-600 font-medium">{client.email}</td>
                        <td className="p-5 text-sm text-gray-600 font-medium">{client.phone || 'N/A'}</td>
                        <td className="p-5 text-sm text-gray-500 font-medium text-right">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// --------------------------------------------------------
// HELPER COMPONENTS
// --------------------------------------------------------
function DashboardCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-gray-900">{value}</p>
      </div>
      <div className={`w-14 h-14 flex items-center justify-center rounded-xl text-2xl ${color}`}>
        {icon}
      </div>
    </div>
  );
}