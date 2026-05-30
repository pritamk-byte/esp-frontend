import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://esp-backend-1ufi.onrender.com';

export default function ClientDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('TRACKING'); 
  
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

  // Premium status badging for clients
  const getStatusBadge = (status) => {
    if (status === 'PENDING' || status === 'NEEDS_INSPECTION') return 'bg-gray-100 text-gray-700 border-gray-200';
    if (status === 'UNDER_REVIEW') return 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse';
    if (status === 'WORKER_ASSIGNED' || status === 'IN_PROGRESS') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (status === 'COMPLETED') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg text-lg">🏠</div>
            <h1 className="text-xl font-black tracking-tight text-gray-900 hidden sm:block">ESP Client Portal</h1>
            <h1 className="text-xl font-black tracking-tight text-gray-900 sm:hidden">ESP</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
              Client
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* 2. NAVIGATION TABS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-8 flex flex-col sm:flex-row gap-2 sm:gap-0">
          <button
            onClick={() => setActiveTab('TRACKING')}
            className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg transition-all text-center ${
              activeTab === 'TRACKING' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            📋 Track My Jobs
          </button>
          <button
            onClick={() => setActiveTab('NEW_REQUEST')}
            className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg transition-all text-center ${
              activeTab === 'NEW_REQUEST' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            ➕ New Service Request
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-lg border-l-4 border-red-500">{error}</div>}

        {/* =========================================================================
            TAB 1: NEW REQUEST FORM
        ========================================================================= */}
        {activeTab === 'NEW_REQUEST' && (
          <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900">How can we help?</h2>
              <p className="text-gray-500 mt-2">Fill out the details below and we'll dispatch an expert.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wide">Job Title</label>
                <input 
                  required 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all" 
                  placeholder="e.g. Solar Panel Maintenance" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wide">Service Type</label>
                <select 
                  value={formData.serviceType} 
                  onChange={e => setFormData({...formData, serviceType: e.target.value})} 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm font-medium transition-all"
                >
                  <option value="Electrical">⚡ Electrical</option>
                  <option value="Solar Installation">☀️ Solar Installation</option>
                  <option value="Advanced Plumbing">🚰 Advanced Plumbing</option>
                  <option value="Skilled Labor">🏗️ Skilled Labor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wide">Description</label>
                <textarea 
                  required 
                  rows="4" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm resize-none transition-all" 
                  placeholder="Describe exactly what needs to be done..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wide">Location / Address</label>
                <input 
                  required 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all" 
                  placeholder="Full street address and city" 
                />
              </div>
              
              <button 
                disabled={isSubmitting} 
                type="submit" 
                className="w-full bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 font-black text-lg disabled:bg-blue-400 transition-colors shadow-lg mt-4"
              >
                {isSubmitting ? 'Sending Request...' : 'Submit Request →'}
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 2: TRACKING ONGOING JOBS
        ========================================================================= */}
        {activeTab === 'TRACKING' && (
          <div>
            {loading ? (
              <div className="text-center p-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading your projects...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center p-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="text-5xl mb-4">👋</div>
                <p className="text-gray-900 font-bold text-lg">Welcome to ESP!</p>
                <p className="text-gray-500 text-sm mt-1 mb-6">You don't have any active projects yet.</p>
                <button 
                  onClick={() => setActiveTab('NEW_REQUEST')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  Create your first request
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {requests.map(req => {
                  const assignedWorker = req.interests?.find(i => i.status === 'ACCEPTED')?.worker || req.interests?.[0]?.worker;
                  
                  return (
                    <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      
                      {/* Card Header */}
                      <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="text-xl font-black text-gray-900 leading-tight mb-1">{req.title}</h3>
                          <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">{req.serviceType}</div>
                        </div>
                        <span className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border whitespace-nowrap ${getStatusBadge(req.status)}`}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 sm:p-6">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Job Description</h4>
                        <p className="text-sm text-gray-700 leading-relaxed mb-6">{req.description}</p>
                        
                        {/* 🚨 THE MOST IMPORTANT SECTION: QUOTE REVIEW 🚨 */}
                        {req.quotedPrice && (
                          <div className={`p-5 rounded-xl border mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-6 ${
                            req.status === 'UNDER_REVIEW' 
                              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-inner' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div>
                              <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Total Project Cost</div>
                              <div className={`text-3xl font-black ${req.status === 'UNDER_REVIEW' ? 'text-amber-700' : 'text-gray-900'}`}>
                                ₹{req.quotedPrice}
                              </div>
                            </div>
                            
                            {req.status === 'UNDER_REVIEW' && (
                              <button 
                                onClick={() => handleAcceptQuote(req.id)}
                                className="w-full sm:w-auto bg-amber-600 text-white text-sm font-black py-3 px-8 rounded-xl hover:bg-amber-700 transition shadow-lg transform hover:-translate-y-0.5 uppercase tracking-wide"
                              >
                                ✓ Accept & Proceed
                              </button>
                            )}
                          </div>
                        )}
                        
                        {/* Worker Details Section */}
                        {req.status === 'WORKER_ASSIGNED' || req.status === 'IN_PROGRESS' || req.status === 'COMPLETED' ? (
                          assignedWorker ? (
                            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                              <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span>👷</span> Assigned Professional
                              </h4>
                              <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                <div className="text-sm text-gray-900 font-medium space-y-1">
                                  <p className="text-lg font-bold">{assignedWorker.name || 'Verified Professional'}</p>
                                  <p className="text-gray-600">{assignedWorker.email}</p>
                                </div>
                                {assignedWorker.phone && (
                                  <a 
                                    href={`tel:${assignedWorker.phone}`} 
                                    className="bg-white border border-blue-200 text-blue-700 px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition shadow-sm"
                                  >
                                    📞 Call Worker
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-gray-500 font-medium">
                              Your professional has been assigned and will contact you shortly.
                            </div>
                          )
                        ) : (
                          /* Status Helper Text for early stages */
                          <div className="text-sm text-gray-500 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                            <span className="text-lg">ℹ️</span>
                            <p>
                              {req.status === 'PENDING' && 'We have received your request. An admin will review it shortly to assign an inspector.'}
                              {req.status === 'NEEDS_INSPECTION' && 'An inspector has been dispatched to your location to assess the requirements.'}
                              {req.status === 'INSPECTION_DONE' && 'Inspection complete! The admin is currently calculating your final quote.'}
                              {req.status === 'UNDER_REVIEW' && 'Please review and accept the quote above so we can dispatch a professional.'}
                              {req.status === 'WAITING_WORKER' && 'Quote accepted! We are currently matching you with the best available professional.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}