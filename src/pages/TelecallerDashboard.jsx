import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://esp-backend-1ufi.onrender.com';

export default function TelecallerDashboard() {
  const [callList, setCallList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [callNotes, setCallNotes] = useState({});
  const [profile, setProfile] = useState(null); 
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("Failed to load profile");
    }
  }, [token]);

  const fetchCallList = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/telecaller/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setCallList(data);
      } else {
        alert(data.error || "Failed to fetch call list");
      }
    } catch (err) {
      alert("Failed to fetch call list. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleSaveNote = async (jobId) => {
    const note = callNotes[jobId];
    if (!note) return alert("Please type a note first.");

    try {
      const response = await fetch(`${API_BASE_URL}/api/telecaller/jobs/${jobId}/note`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ note })
      });

      if (!response.ok) throw new Error("Failed to save note");
      
      setCallNotes({ ...callNotes, [jobId]: '' }); 
      fetchCallList(); 
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchCallList();
    fetchProfile(); 
  }, [fetchCallList, fetchProfile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // Upgraded styling for status badges
  const getStatusStyle = (status) => {
    if (status === 'WAITING_WORKER') return 'text-amber-700 bg-amber-50 border-amber-200';
    if (status === 'COMPLETED') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (status === 'IN_PROGRESS') return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    return 'text-gray-700 bg-gray-100 border-gray-300';
  };

  // --------------------------------------------------------
  // FULL PAGE LOADING STATE
  // --------------------------------------------------------
  if (loading && !profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Loading Dispatch Center...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg text-lg">🎧</div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">Dispatch Hub</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
              Agent: {profile?.name || 'Active'}
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Active Call Queue</h2>
            <p className="text-sm text-gray-500 mt-1">Jobs requiring immediate follow-up or coordination.</p>
          </div>
          <div className="hidden sm:block text-sm font-bold text-gray-400">
            {callList.length} {callList.length === 1 ? 'Job' : 'Jobs'} Pending
          </div>
        </div>

        {loading ? (
          <div className="text-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></div>
        ) : callList.length === 0 ? (
          <div className="text-center p-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-gray-900 font-bold text-lg">Queue is empty!</p>
            <p className="text-gray-500 text-sm mt-1">All active jobs have been followed up on.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {callList.map(job => (
              <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                
                {/* Job Header & Details */}
                <div className="p-5 sm:p-6 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                    <h3 className="text-xl font-black text-gray-900 leading-tight">{job.title}</h3>
                    <span className={`px-3 py-1 text-xs font-black rounded border uppercase tracking-widest whitespace-nowrap ${getStatusStyle(job.status)}`}>
                      {job.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{job.description}</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 bg-gray-50">
                  
                  {/* Contacts Column */}
                  <div className="p-5 sm:p-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Contact Directory</h4>
                    <div className="space-y-3">
                      
                      {/* Client Card */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                           <div className="bg-blue-50 p-2 rounded-lg text-blue-600 text-lg">👤</div>
                           <div>
                             <p className="text-sm font-bold text-gray-900">{job.client?.name || 'Unknown Client'}</p>
                             <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Client</p>
                           </div>
                        </div>
                        {job.client?.phone ? (
                          <a href={`tel:${job.client.phone}`} className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-200 transition">
                            📞 Call
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium px-2">No Number</span>
                        )}
                      </div>

                      {/* Inspector Card */}
                      {job.inspector && (
                        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                          <div className="flex items-center gap-3">
                             <div className="bg-purple-50 p-2 rounded-lg text-purple-600 text-lg">🕵️‍♂️</div>
                             <div>
                               <p className="text-sm font-bold text-gray-900">{job.inspector.name || 'Unknown'}</p>
                               <p className="text-[10px] font-black text-purple-600 uppercase tracking-wider">Inspector</p>
                             </div>
                          </div>
                          <a href={`tel:${job.inspector.phone}`} className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-200 transition">
                            📞 Call
                          </a>
                        </div>
                      )}

                      {/* Worker Cards */}
                      {job.interests && job.interests.length > 0 && job.interests.map((interest, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                          <div className="flex items-center gap-3">
                             <div className="bg-orange-50 p-2 rounded-lg text-orange-600 text-lg">👷</div>
                             <div>
                               <p className="text-sm font-bold text-gray-900">{interest.worker?.name || 'Unknown'}</p>
                               <p className="text-[10px] font-black text-orange-600 uppercase tracking-wider">Assigned Worker</p>
                             </div>
                          </div>
                          {interest.worker?.phone ? (
                            <a href={`tel:${interest.worker.phone}`} className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-200 transition">
                              📞 Call
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium px-2">No Number</span>
                          )}
                        </div>
                      ))}
                      
                    </div>
                  </div>

                  {/* Actions & Notes Column */}
                  <div className="p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Dispatcher Notes</h4>
                      
                      {job.adminNote ? (
                        <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200 shadow-sm relative">
                          <div className="absolute -top-2 -left-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">Admin Instruction</div>
                          <p className="text-sm text-yellow-900 mt-1 font-medium">{job.adminNote}</p>
                        </div>
                      ) : (
                        <div className="mb-6 p-4 bg-gray-100 rounded-xl border border-gray-200 border-dashed text-center">
                          <p className="text-xs text-gray-500 font-medium">No special instructions from Admin.</p>
                        </div>
                      )}
                    </div>

                    {/* Chat-style input area */}
                    <div className="mt-auto">
                      <label className="block text-xs font-bold text-gray-700 mb-2">Update Call Log</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                          type="text" 
                          placeholder="E.g., Client confirmed appointment for 2PM..."
                          className="flex-1 p-3 bg-white text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                          value={callNotes[job.id] || ''}
                          onChange={(e) => setCallNotes({...callNotes, [job.id]: e.target.value})}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(job.id)}
                        />
                        <button 
                          onClick={() => handleSaveNote(job.id)}
                          className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm"
                        >
                          Save Log
                        </button>
                      </div>
                    </div>
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