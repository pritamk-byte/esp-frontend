import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const STATUS_OPTIONS = [
  'PENDING', 'UNDER_REVIEW', 'NEEDS_INSPECTION', 'INSPECTION_DONE', 
  'WAITING_WORKER', 'WORKER_ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'
];

export default function AdminDashboard() {
  // States
  const [upgradeEmail, setUpgradeEmail] = useState('');
  const [upgradeRole, setUpgradeRole] = useState('INSPECTOR');
  
  const [requests, setRequests] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [inspectors, setInspectors] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); 
  const [quoteInputs, setQuoteInputs] = useState({});
  const [adminNotes, setAdminNotes] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'WORKERS') {
      fetchWorkers();
    } else {
      fetchRequests(activeTab);
    }
  }, [activeTab]);

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
      setRequests(result.data);
    } catch (err) {
      setError("Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/workers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setWorkers(data);
    } catch (err) {
      setError("Failed to fetch workers.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInspectors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/inspectors`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setInspectors(data);
    } catch (err) {
      console.error("Failed to fetch inspectors.");
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchRequests(activeTab);
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleAssignWorker = async (requestId, workerId) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/requests/${requestId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ workerId })
      });
      alert('Worker assigned successfully!');
      fetchRequests(activeTab); 
    } catch (err) {
      alert("Error assigning worker");
    }
  };

  const handleAssignInspector = async (requestId, inspectorId) => {
    if (!inspectorId) return alert("Please select an Inspector from the dropdown.");
    const note = adminNotes[requestId] || ""; 

    try {
      await fetch(`${API_BASE_URL}/api/admin/requests/${requestId}/assign-inspector`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ inspectorId, adminNote: note }) 
      });
      alert('Inspector dispatched successfully!');
      
      setAdminNotes(prev => ({...prev, [requestId]: ''}));
      fetchRequests(activeTab); 
    } catch (err) {
      alert("Error assigning inspector");
    }
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
    } catch (err) {
      alert("Error updating KYC");
    }
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
      fetchRequests(activeTab); 
    } catch (err) {
      alert("Error sending quote");
    }
  };

  const handleRoleUpgrade = async () => {
    if (!upgradeEmail) return alert("Please enter an email address.");
    if (!window.confirm(`Are you sure you want to make ${upgradeEmail} a ${upgradeRole}?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email: upgradeEmail, newRole: upgradeRole })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      alert(result.message);
      setUpgradeEmail(''); 
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const getKYCBadge = (status) => {
    if (status === 'APPROVED') return 'bg-green-100 text-green-800';
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-800';
    if (status === 'REJECTED') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto">
        
        {/* Simple Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded shadow-sm mb-6 gap-4">
          <div>
            <h1 className="text-xl font-bold">Admin Control Panel</h1>
            <p className="text-sm text-gray-500">Manage workflows, quotes, and staff.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded border border-gray-200">
              {localStorage.getItem('role')}
            </span>
            <button 
              onClick={handleLogout} 
              className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded transition"
            >
              Log Out
            </button>
          </div>
        </header>
        
        {/* SUPER ADMIN PANEL */}
        {localStorage.getItem('role') === 'SUPER_ADMIN' && (
          <div className="bg-white p-4 mb-6 rounded shadow-sm border-l-4 border-purple-600">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Promote Staff Account</h2>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="email"
                value={upgradeEmail}
                onChange={(e) => setUpgradeEmail(e.target.value)}
                placeholder="employee@company.com"
                className="flex-1 p-2 border border-gray-300 rounded text-sm focus:border-purple-500 focus:outline-none"
              />
              <select
                value={upgradeRole}
                onChange={(e) => setUpgradeRole(e.target.value)}
                className="w-full md:w-48 p-2 border border-gray-300 rounded text-sm bg-white focus:border-purple-500 focus:outline-none"
              >
                <option value="INSPECTOR">Inspector</option>
                <option value="TELECALLER">Telecaller</option>
                <option value="ADMIN_MANAGER">Admin Manager</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              <button
                onClick={handleRoleUpgrade}
                className="w-full md:w-auto bg-purple-600 text-white font-medium py-2 px-6 rounded hover:bg-purple-700 transition text-sm"
              >
                Promote
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {['ALL', 'PENDING', 'NEEDS_INSPECTION', 'UNDER_REVIEW', 'WAITING_WORKER', 'WORKERS'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded transition-colors ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab === 'WORKERS' ? '👥 Worker KYC' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded text-sm border border-red-200">{error}</div>}

        {/* MAIN CONTENT AREA */}
        <div className="space-y-4">
          
          {activeTab === 'WORKERS' ? (
            /* WORKERS LIST (Card based) */
            loading ? (
              <div className="text-center p-8 text-gray-500">Loading workers...</div>
            ) : workers.length === 0 ? (
              <div className="text-center p-8 bg-white rounded shadow-sm text-gray-500">No workers registered.</div>
            ) : (
              workers.map(worker => (
                <div key={worker.id} className="bg-white p-4 rounded shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{worker.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getKYCBadge(worker.verificationStatus)}`}>
                        {worker.verificationStatus}
                      </span>
                      {worker.idDocumentUrl ? (
                        <a href={worker.idDocumentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-medium">
                          View Document
                        </a>
                      ) : <span className="text-gray-400 text-xs italic">No document</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    {worker.verificationStatus === 'PENDING' && (
                      <>
                        <button onClick={() => handleKYCUpdate(worker.id, 'APPROVED')} className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700">Approve</button>
                        <button onClick={() => handleKYCUpdate(worker.id, 'REJECTED')} className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700">Reject</button>
                      </>
                    )}
                    {worker.verificationStatus === 'APPROVED' && (
                      <button onClick={() => handleKYCUpdate(worker.id, 'REJECTED')} className="w-full sm:w-auto bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300">Revoke Access</button>
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            /* REQUESTS LIST (Card based) */
            loading ? (
              <div className="text-center p-8 text-gray-500">Loading workflows...</div>
            ) : requests.length === 0 ? (
              <div className="text-center p-8 bg-white rounded shadow-sm text-gray-500">No requests found.</div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                  
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{req.title}</h3>
                      <p className="text-xs text-blue-600 font-medium">{req.serviceType}</p>
                    </div>
                    <select
                      value={req.status}
                      onChange={(e) => handleStatusChange(req.id, e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1.5 text-sm font-medium focus:border-blue-500 focus:outline-none bg-white w-full sm:w-auto"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left Column: Details & Pricing */}
                    <div>
                      <p className="text-sm text-gray-500 mb-4">Client: <span className="font-medium text-gray-900">{req.client?.email}</span></p>

                      {/* Inspector Report */}
                      {req.status === 'INSPECTION_DONE' && req.inspectionNotes && (
                        <div className="mb-4 bg-yellow-50 p-3 rounded border border-yellow-200">
                          <span className="text-xs font-bold text-yellow-800 uppercase block mb-1">Inspector Report:</span>
                          <p className="text-sm text-gray-800 italic">"{req.inspectionNotes}"</p>
                        </div>
                      )}

                      {/* Quote & Pricing Block */}
                      <div className="bg-gray-50 p-3 rounded border border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Pricing</h4>
                        {req.quotedPrice ? (
                          <div>
                            <span className="text-lg font-bold text-green-700">₹{req.quotedPrice}</span>
                            {req.status === 'UNDER_REVIEW' && <p className="text-xs text-yellow-600 font-medium mt-1">Waiting on Client Approval...</p>}
                          </div>
                        ) : (req.status === 'PENDING' || req.status === 'INSPECTION_DONE') ? (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input 
                              type="number" 
                              placeholder="Amount (₹)" 
                              className="border border-gray-300 p-2 text-sm rounded w-full sm:w-32 focus:border-blue-500 focus:outline-none"
                              onChange={(e) => setQuoteInputs({...quoteInputs, [req.id]: e.target.value})}
                            />
                            <button 
                              onClick={() => handleSendQuote(req.id)}
                              className="bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded hover:bg-blue-700 transition"
                            >
                              Send Quote
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">Not ready for quoting yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Dispatch & Workers */}
                    <div>
                      
                      {/* Dispatch Inspector Block */}
                      {req.status === 'PENDING' && (
                        <div className="p-3 bg-blue-50 rounded border border-blue-100">
                          <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">Dispatch Inspector</p>
                          <input 
                            type="text" 
                            placeholder="Instructions for inspector..." 
                            className="w-full text-sm border border-gray-300 p-2 rounded mb-2 focus:outline-none focus:border-blue-500"
                            value={adminNotes[req.id] || ''}
                            onChange={(e) => setAdminNotes({...adminNotes, [req.id]: e.target.value})}
                          />
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select 
                              id={`inspector-select-${req.id}`} 
                              className="text-sm border border-gray-300 p-2 rounded flex-1 focus:outline-none focus:border-blue-500 bg-white"
                            >
                              <option value="">Select Staff...</option>
                              {inspectors.map(ins => (
                                <option key={ins.id} value={ins.id}>{ins.email.split('@')[0]}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => handleAssignInspector(req.id, document.getElementById(`inspector-select-${req.id}`).value)}
                              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
                            >
                              Dispatch
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Hire Workers Block */}
                      {req.status === 'WAITING_WORKER' && (
                        <div className="p-3 bg-indigo-50 rounded border border-indigo-100">
                          <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-2">Interested Workers</p>
                          {req.interests?.length > 0 ? (
                            <div className="space-y-2">
                              {req.interests.map(interest => (
                                <div key={interest.id} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-indigo-100">
                                  <span className="font-medium truncate">{interest.worker.email.split('@')[0]}</span>
                                  {interest.status === 'ACCEPTED' ? (
                                    <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Hired</span>
                                  ) : (
                                    <button 
                                      onClick={() => handleAssignWorker(req.id, interest.worker.id)} 
                                      className="bg-green-600 text-white px-3 py-1 rounded font-medium hover:bg-green-700 text-xs"
                                    >
                                      Hire
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No applicants yet.</p>
                          )}
                        </div>
                      )}
                      
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}