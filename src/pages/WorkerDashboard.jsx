import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://esp-backend-1ufi.onrender.com';

export default function WorkerDashboard() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('MARKETPLACE'); 
  const [idUrl, setIdUrl] = useState(''); 
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.verificationStatus === 'APPROVED') {
      if (activeTab === 'MARKETPLACE') fetchAvailableJobs();
      else fetchMyJobs();
    }
  }, [activeTab, profile]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/worker/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const submitKYC = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/worker/kyc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ idDocumentUrl: idUrl })
      });
      if (!response.ok) throw new Error('Failed to submit ID.');
      alert('Document submitted successfully!');
      fetchProfile(); 
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchAvailableJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/worker/jobs`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/worker/my-jobs`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setMyJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (requestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/worker/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ requestId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      // Visual feedback: instantly update the UI so the button changes
      setJobs(prev => prev.map(job => job.id === requestId ? { ...job, interests: [{ id: 'temp' }] } : job));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCompleteJob = async (requestId) => {
    if (!window.confirm("Mark this job as completed? Ensure you have finished all tasks on site.")) return;
    try {
      await fetch(`${API_BASE_URL}/api/worker/my-jobs/${requestId}/complete`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchMyJobs(); 
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // --------------------------------------------------------
  // FULL PAGE LOADING STATE
  // --------------------------------------------------------
  if (loading && !profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your workspace...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-1.5 rounded-lg text-lg">👷</div>
            <h1 className="text-xl font-black tracking-tight text-gray-900 hidden sm:block">ESP Professional</h1>
            <h1 className="text-xl font-black tracking-tight text-gray-900 sm:hidden">ESP</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
              {profile?.name || 'Worker'}
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* =========================================================================
            KYC GATEKEEPER UI (Blocks access until approved)
        ========================================================================= */}
        {profile?.verificationStatus !== 'APPROVED' ? (
          <div className="max-w-xl mx-auto mt-12 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            
            {profile?.verificationStatus === 'UNVERIFIED' || profile?.verificationStatus === 'REJECTED' ? (
              <div>
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-center text-white">
                  <div className="text-5xl mb-4">🛡️</div>
                  <h2 className="text-2xl font-black mb-2">Identity Verification</h2>
                  <p className="text-emerald-100 text-sm">Required to access the job marketplace.</p>
                </div>
                
                <div className="p-8">
                  {profile?.verificationStatus === 'REJECTED' && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                      <p className="text-sm font-bold text-red-800">Your previous submission was rejected.</p>
                      <p className="text-xs text-red-600 mt-1">Please ensure your document is a clear, valid Government ID and the link is publicly viewable.</p>
                    </div>
                  )}
                  
                  <form onSubmit={submitKYC} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Document Link (Drive, Dropbox, etc.)</label>
                      <input 
                        type="url" 
                        required 
                        value={idUrl} 
                        onChange={e => setIdUrl(e.target.value)} 
                        placeholder="https://..."
                        className="w-full p-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1">
                        <span>⚠️</span> Ensure permissions are set to "Anyone with the link can view".
                      </p>
                    </div>
                    <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm text-lg">
                      Submit Securely
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-6 animate-bounce-slow">⏳</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Review in Progress</h3>
                <p className="text-gray-500 leading-relaxed max-w-sm mx-auto">
                  Our administrative team is verifying your identity document. This typically takes a few hours. Check back soon to access the marketplace!
                </p>
              </div>
            )}
          </div>
        ) : (
          
          /* =========================================================================
             THE ACTUAL DASHBOARD (Only shown if APPROVED)
          ========================================================================= */
          <>
            {/* Dashboard Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-8 flex overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveTab('MARKETPLACE')} 
                className={`flex-1 min-w-[150px] py-2.5 px-4 text-sm font-bold rounded-lg transition-all text-center whitespace-nowrap ${
                  activeTab === 'MARKETPLACE' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                🔍 Job Marketplace
              </button>
              <button 
                onClick={() => setActiveTab('MY_JOBS')} 
                className={`flex-1 min-w-[150px] py-2.5 px-4 text-sm font-bold rounded-lg transition-all text-center whitespace-nowrap ${
                  activeTab === 'MY_JOBS' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                📋 My Active Jobs
              </button>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-lg border-l-4 border-red-500">{error}</div>}

            {/* TAB 1: MARKETPLACE */}
            {activeTab === 'MARKETPLACE' && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-6">Available Jobs in your area</h2>
                
                {loading ? (
                   <div className="text-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>
                ) : jobs.length === 0 ? (
                  <div className="text-center p-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium text-lg">No new jobs available right now.</p>
                    <p className="text-gray-400 text-sm mt-1">Check back later when admins post new tasks.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => {
                      const hasApplied = job.interests && job.interests.length > 0;
                      return (
                        <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                          <div>
                            <div className="flex justify-between items-start mb-4 gap-2">
                              <h3 className="text-lg font-bold text-gray-900 leading-tight">{job.title}</h3>
                              <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest whitespace-nowrap">
                                {job.serviceType}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-5 line-clamp-3 leading-relaxed">{job.description}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                              <span>📍</span> 
                              <span className="truncate">{job.location}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleApply(job.id)} 
                            disabled={hasApplied} 
                            className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                              hasApplied 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                                : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
                            }`}
                          >
                            {hasApplied ? 'Application Sent ✓' : 'Express Interest'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MY JOBS */}
            {activeTab === 'MY_JOBS' && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-6">Your Assignments</h2>

                {loading ? (
                   <div className="text-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>
                ) : myJobs.length === 0 ? (
                  <div className="text-center p-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium text-lg">You don't have any assigned jobs yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Apply for jobs in the marketplace to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {myJobs.map((job) => (
                      <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        
                        {/* Card Header */}
                        <div className={`p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${job.status === 'COMPLETED' ? 'bg-gray-50' : 'bg-white'}`}>
                          <div>
                            <h3 className="text-xl font-black text-gray-900 mb-1">{job.title}</h3>
                            <span className={`text-xs font-black uppercase tracking-widest ${job.status === 'COMPLETED' ? 'text-gray-400' : 'text-emerald-600'}`}>
                              Status: {job.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {job.status === 'WORKER_ASSIGNED' || job.status === 'IN_PROGRESS' ? (
                            <button 
                              onClick={() => handleCompleteJob(job.id)} 
                              className="w-full sm:w-auto bg-emerald-600 text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              ✓ Mark as Completed
                            </button>
                          ) : (
                            <span className="bg-gray-200 text-gray-500 text-xs font-bold px-4 py-2 rounded-lg w-full sm:w-auto text-center border border-gray-300">
                              Archived
                            </span>
                          )}
                        </div>
                        
                        {/* Card Body */}
                        <div className={`p-5 grid grid-cols-1 md:grid-cols-3 gap-6 ${job.status === 'COMPLETED' ? 'opacity-75' : ''}`}>
                          <div className="md:col-span-2">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Job Description</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 h-fit">
                            <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-3">Client Details</h4>
                            <div className="text-sm text-gray-900 space-y-3 font-medium">
                              <p className="flex items-center gap-3">
                                <span className="bg-white p-1.5 rounded shadow-sm">✉️</span> 
                                <a href={`mailto:${job.client?.email}`} className="hover:text-blue-600 truncate">{job.client?.email}</a>
                              </p>
                              <p className="flex items-start gap-3">
                                <span className="bg-white p-1.5 rounded shadow-sm">📍</span> 
                                <span className="line-clamp-2">{job.location}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}