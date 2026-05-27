import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// The correct Create React App syntax with the bulletproof Render fallback!
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
      
      alert("Call log updated!");
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

  // Ultra-simple status styling
  const getStatusStyle = (status) => {
    if (status === 'WAITING_WORKER') return 'text-orange-600 bg-orange-50';
    if (status === 'COMPLETED') return 'text-green-600 bg-green-50';
    if (status === 'IN_PROGRESS') return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto">
        
        {/* Simple Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded shadow-sm mb-6 gap-4">
          <div>
            <h1 className="text-xl font-bold">
              Dispatch Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Agent: {profile?.name || 'Loading...'}
            </p>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded transition"
          >
            Log Out
          </button>
        </header>

        {/* Main Content */}
        {loading ? (
          <div className="text-center p-8 text-gray-500">Loading jobs...</div>
        ) : callList.length === 0 ? (
          <div className="text-center p-8 bg-white rounded shadow-sm text-gray-500">
            No active jobs require follow-up.
          </div>
        ) : (
          <div className="space-y-4">
            {callList.map(job => (
              <div key={job.id} className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                
                {/* Job Header & Details */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">{job.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusStyle(job.status)}`}>
                      {job.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{job.description}</p>
                </div>
                
                {/* Contacts List (Flatter, mobile-friendly design) */}
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contacts</h4>
                  <div className="space-y-3">
                    
                    {/* Client */}
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium text-gray-800">{job.client?.name || 'Unknown'}</span>
                        <span className="text-gray-500 ml-2">(Client)</span>
                      </div>
                      <a href={`tel:${job.client?.phone}`} className="text-blue-600 font-medium hover:underline">
                        {job.client?.phone || 'N/A'}
                      </a>
                    </div>

                    {/* Inspector */}
                    {job.inspector && (
                      <div className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium text-gray-800">{job.inspector.name || 'Unknown'}</span>
                          <span className="text-gray-500 ml-2">(Inspector)</span>
                        </div>
                        <a href={`tel:${job.inspector.phone}`} className="text-blue-600 font-medium hover:underline">
                          {job.inspector.phone || 'N/A'}
                        </a>
                      </div>
                    )}

                    {/* Workers */}
                    {job.interests && job.interests.length > 0 && job.interests.map((interest, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium text-gray-800">{interest.worker?.name || 'Unknown'}</span>
                          <span className="text-gray-500 ml-2">(Worker)</span>
                        </div>
                        <a href={`tel:${interest.worker?.phone}`} className="text-blue-600 font-medium hover:underline">
                          {interest.worker?.phone || 'N/A'}
                        </a>
                      </div>
                    ))}
                    
                  </div>
                </div>

                {/* Log & Admin Note */}
                <div className="p-4">
                  {job.adminNote && (
                    <div className="mb-4 p-3 bg-yellow-50 text-sm text-yellow-800 rounded border border-yellow-200">
                      <strong>Admin:</strong> {job.adminNote}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter call log..."
                      className="flex-1 p-2 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                      value={callNotes[job.id] || ''}
                      onChange={(e) => setCallNotes({...callNotes, [job.id]: e.target.value})}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(job.id)}
                    />
                    <button 
                      onClick={() => handleSaveNote(job.id)}
                      className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Save Log
                    </button>
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