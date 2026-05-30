import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://esp-backend-1ufi.onrender.com';

export default function InspectorDashboard() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesInputs, setNotesInputs] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inspector/inspections`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setInspections(data);
    } catch (err) {
      alert("Failed to fetch assigned inspections");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (requestId) => {
    const notes = notesInputs[requestId];
    if (!notes || notes.trim() === '') return alert("Please enter inspection notes before submitting.");

    if (!window.confirm("Submit this report? The Admin will use these notes to price the job.")) return;

    try {
      await fetch(`${API_BASE_URL}/api/inspector/inspections/${requestId}/report`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ inspectionNotes: notes })
      });
      setNotesInputs(prev => ({ ...prev, [requestId]: '' })); 
      fetchInspections(); 
    } catch (err) {
      alert("Error submitting report");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // Upgraded badge styling
  const getStatusBadge = (status) => {
    if (status === 'INSPECTION_DONE') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  // --------------------------------------------------------
  // FULL PAGE LOADING STATE
  // --------------------------------------------------------
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Syncing field assignments...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 text-white p-1.5 rounded-lg text-lg">📋</div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">Field Inspector</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide">
              Active Duty
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

      {/* 2. MAIN CONTENT AREA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Your Route</h2>
            <p className="text-sm text-gray-500 mt-1">Manage site visits and submit technical reports.</p>
          </div>
        </div>

        {inspections.length === 0 ? (
          <div className="text-center p-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4">☕</div>
            <p className="text-gray-900 font-bold text-lg">No site visits assigned.</p>
            <p className="text-gray-500 text-sm mt-1">You are all caught up for now.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {inspections.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                
                {/* Card Header */}
                <div className={`p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${req.status === 'INSPECTION_DONE' ? 'bg-gray-50' : 'bg-white'}`}>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 leading-tight mb-1">{req.title}</h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest whitespace-nowrap">
                      {req.serviceType}
                    </span>
                  </div>
                  <span className={`text-xs font-black px-3 py-1.5 rounded border uppercase tracking-widest whitespace-nowrap ${getStatusBadge(req.status)}`}>
                    {req.status === 'INSPECTION_DONE' ? '✓ Report Filed' : 'Action Required'}
                  </span>
                </div>
                
                {/* Card Body */}
                <div className={`p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 ${req.status === 'INSPECTION_DONE' ? 'opacity-80' : ''}`}>
                  
                  {/* Left Column: Job Details */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Client Issue</h4>
                      <p className="text-sm text-gray-800 leading-relaxed font-medium">
                        {req.description}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 mt-auto">
                      <p className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                        <span className="bg-white p-1 rounded shadow-sm text-base">📍</span> 
                        <span>{req.location}</span>
                      </p>
                      <p className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                        <span className="bg-white p-1 rounded shadow-sm text-base">✉️</span> 
                        <a href={`mailto:${req.client?.email}`} className="text-blue-600 hover:underline truncate">{req.client?.email}</a>
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Instructions & Action */}
                  <div className="flex flex-col gap-4">
                    
                    {/* Admin Instructions */}
                    {req.adminNote && (
                      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 relative">
                         <div className="absolute -top-2.5 left-4 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                           Dispatch Note
                         </div>
                         <p className="text-sm text-indigo-900 mt-2 font-medium leading-relaxed">{req.adminNote}</p>
                      </div>
                    )}

                    {/* Action Area: Report Submission or Completed Notes */}
                    {req.status === 'INSPECTION_DONE' ? (
                      <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 mt-auto">
                        <h3 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <span>🔒</span> Official Report Submitted
                        </h3>
                        <p className="text-sm text-emerald-900 italic font-medium leading-relaxed">"{req.inspectionNotes}"</p>
                        {req.inspectionDate && (
                          <p className="text-xs text-emerald-700 mt-4 font-bold">
                            Filed on: {new Date(req.inspectionDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white p-5 rounded-xl border-2 border-amber-200 mt-auto shadow-sm">
                        <label className="block text-xs font-black text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <span>📝</span> Field Report Entry
                        </label>
                        <textarea
                          rows="4"
                          placeholder="Detail the materials needed, workforce required, and exact scope of work..."
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none mb-4 resize-none transition-all"
                          value={notesInputs[req.id] || ''}
                          onChange={(e) => setNotesInputs({ ...notesInputs, [req.id]: e.target.value })}
                        ></textarea>
                        <button
                          onClick={() => handleSubmitReport(req.id)}
                          className="w-full bg-amber-600 text-white font-black py-3.5 rounded-lg hover:bg-amber-700 transition shadow-sm text-sm uppercase tracking-wider"
                        >
                          Submit to Admin
                        </button>
                      </div>
                    )}
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}