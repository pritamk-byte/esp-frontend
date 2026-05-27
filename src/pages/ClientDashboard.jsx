import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export default function ClientDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('TRACKING'); // 'TRACKING' or 'NEW_REQUEST'
  
  // Form State
  const [formData, setFormData] = useState({ title: '', serviceType: 'Electrical', description: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'TRACKING') fetchMyRequests();
  }, [activeTab]);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/client/requests`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Could not fetch your requests.');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/client/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      alert('Service Request Submitted!');
      setFormData({ title: '', serviceType: 'Electrical', description: '', location: '' });
      setActiveTab('TRACKING'); 
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptQuote = async (requestId) => {
    if (!window.confirm("Do you agree to this price and want to proceed?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/client/requests/${requestId}/accept-quote`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error("Failed to accept quote");
      alert('Quote accepted! We are now finding a professional for you.');
      fetchMyRequests(); 
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    if (status === 'PENDING') return 'bg-amber-100 text-amber-800';
    if (status === 'UNDER_REVIEW') return 'bg-yellow-100 text-yellow-800';
    if (status === 'WORKER_ASSIGNED' || status === 'COMPLETED') return 'bg-green-100 text-green-800';
    if (status === 'IN_PROGRESS') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 font-sans text-gray-900">
      <div className="max-w-3xl mx-auto">
        
        {/* Simple Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded shadow-sm mb-6 gap-4">
          <div>
            <h1 className="text-xl font-bold">Client Portal</h1>
            <p className="text-sm text-gray-500">Request services and track ongoing projects.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded border border-gray-200">
              CLIENT
            </span>
            <button 
              onClick={handleLogout} 
              className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded transition"
            >
              Log Out
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('TRACKING')}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded transition-colors ${
              activeTab === 'TRACKING' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Track My Jobs
          </button>
          <button
            onClick={() => setActiveTab('NEW_REQUEST')}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded transition-colors ${
              activeTab === 'NEW_REQUEST' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            + New Request
          </button>
        </div>

        {/* Main Content Area */}
        {activeTab === 'NEW_REQUEST' && (
          <div className="bg-white p-4 md:p-6 rounded shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 border-b border-gray-100 pb-2">Create Service Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="e.g. Solar Panel Maintenance" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                <select value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white">
                  <option>Electrical</option>
                  <option>Solar Installation</option>
                  <option>Labor Work</option>
                  <option>Plumbing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="Describe what needs to be done..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address</label>
                <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="Full address" />
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-bold disabled:bg-blue-400 transition mt-2">
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'TRACKING' && (
          <div className="space-y-4">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading your requests...</div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded text-sm border border-red-200">{error}</div>
            ) : requests.length === 0 ? (
              <div className="p-10 text-center text-gray-500 bg-white rounded shadow-sm border border-gray-200">
                You have no active requests. Click "+ New Request" to get started!
              </div>
            ) : (
              requests.map(req => {
                const assignedWorker = req.interests?.[0]?.worker; 
                
                return (
                  <div key={req.id} className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                    
                    {/* Card Header */}
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{req.title}</h3>
                        <div className="text-xs text-blue-600 font-medium">{req.serviceType}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap ${getStatusBadge(req.status)}`}>
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-4">{req.description}</p>
                      
                      {/* Quote Review Section */}
                      {req.quotedPrice && (
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Quoted Price</div>
                            <div className="text-2xl font-bold text-green-700">₹{req.quotedPrice}</div>
                          </div>
                          
                          {req.status === 'UNDER_REVIEW' && (
                            <button 
                              onClick={() => handleAcceptQuote(req.id)}
                              className="w-full sm:w-auto bg-green-600 text-white text-sm font-bold py-2 px-6 rounded hover:bg-green-700 transition"
                            >
                              ✓ Accept Quote
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Worker Details Section */}
                      {req.status === 'WORKER_ASSIGNED' && assignedWorker ? (
                        <div className="bg-green-50 p-4 rounded border border-green-100">
                          <h4 className="text-xs font-bold text-green-800 uppercase tracking-wide mb-2">Assigned Professional</h4>
                          <div className="text-sm text-gray-800 space-y-1">
                            <p><span className="font-medium">Name:</span> {assignedWorker.name || 'Not provided'}</p>
                            <p><span className="font-medium">Email:</span> {assignedWorker.email}</p>
                            <p><span className="font-medium">Contact:</span> <a href={`tel:${assignedWorker.phone}`} className="text-blue-600 hover:underline">{assignedWorker.phone || 'Will contact via platform'}</a></p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded inline-block">
                          {req.status === 'PENDING' ? 'Waiting for admin review...' : 
                           req.status === 'UNDER_REVIEW' ? 'Action required: Review quote above.' :
                           'Looking for available professionals...'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}