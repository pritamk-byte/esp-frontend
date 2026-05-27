import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

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
      alert(result.message);
      setJobs(prev => prev.map(job => job.id === requestId ? { ...job, interests: [{ id: 'temp' }] } : job));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCompleteJob = async (requestId) => {
    if (!window.confirm("Mark this job as completed?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/worker/my-jobs/${requestId}/complete`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      alert("Job marked as completed!");
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto">
        
        {/* Unified Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded shadow-sm mb-6 gap-4 border-t-4 border-t-green-600">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Professional Portal</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your work and find new opportunities.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded border border-gray-200 tracking-wide">
              WORKER
            </span>
            <button 
              onClick={handleLogout} 
              className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded transition"
            >
              Log Out
            </button>
          </div>
        </header>

        {/* KYC GATEKEEPER UI */}
        {profile?.verificationStatus !== 'APPROVED' ? (
          <div className="bg-white p-6 md:p-10 rounded shadow-sm border border-gray-200 text-center max-w-xl mx-auto mt-8">
            
            {profile?.verificationStatus === 'UNVERIFIED' || profile?.verificationStatus === 'REJECTED' ? (
              <>
                <div className="text-4xl mb-4">🛡️</div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Identity Verification Required</h2>
                <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                  {profile?.verificationStatus === 'REJECTED' 
                    ? <span className="text-red-600 font-bold bg-red-50 p-2 rounded block border border-red-100">Your previous submission was rejected. Please upload a clear, valid Government ID.</span>
                    : "To ensure client safety, all professionals must submit a valid Government ID before accessing the job marketplace."}
                </p>
                <form onSubmit={submitKYC} className="space-y-5 text-left">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Document Link (Drive, Dropbox, etc.)</label>
                    <input 
                      type="url" 
                      required 
                      value={idUrl} 
                      onChange={e => setIdUrl(e.target.value)} 
                      placeholder="https://..."
                      className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium">⚠️ Make sure the link permissions are set to "Anyone with the link can view".</p>
                  </div>
                  <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition shadow-sm">
                    Submit for Verification
                  </button>
                </form>
              </>
            ) : (
              <div className="py-8">
                <div className="text-5xl mb-6 animate-pulse">⏳</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review in Progress</h3>
                <p className="text-gray-600 text-sm">Our administrative team is currently reviewing your identity document. This usually takes a few hours. Check back soon!</p>
              </div>
            )}
          </div>
        ) : (
          
          /* THE ACTUAL DASHBOARD (Only shown if APPROVED) */
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setActiveTab('MARKETPLACE')} 
                className={`flex-1 sm:flex-none whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded transition-colors ${
                  activeTab === 'MARKETPLACE' ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Find Work
              </button>
              <button 
                onClick={() => setActiveTab('MY_JOBS')} 
                className={`flex-1 sm:flex-none whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded transition-colors ${
                  activeTab === 'MY_JOBS' ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                My Active Jobs
              </button>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded border border-red-200">{error}</div>}

            {activeTab === 'MARKETPLACE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.length === 0 ? (
                  <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded shadow-sm border border-gray-200">
                    No new jobs available in the marketplace right now.
                  </div>
                ) : (
                  jobs.map((job) => {
                    const hasApplied = job.interests && job.interests.length > 0;
                    return (
                      <div key={job.id} className="bg-white rounded shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-bold text-gray-900 leading-tight pr-2">{job.title}</h3>
                            <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide whitespace-nowrap">
                              {job.serviceType}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">{job.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
                            <span>📍</span> 
                            <span className="truncate">{job.location}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleApply(job.id)} 
                          disabled={hasApplied} 
                          className={`w-full py-2.5 px-4 rounded text-sm font-bold transition-all ${
                            hasApplied 
                              ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' 
                              : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                          }`}
                        >
                          {hasApplied ? 'Application Submitted ✓' : 'Express Interest'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'MY_JOBS' && (
              <div className="space-y-4">
                {myJobs.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 bg-white rounded shadow-sm border border-gray-200">
                    You don't have any assigned jobs yet.
                  </div>
                ) : (
                  myJobs.map((job) => (
                    <div key={job.id} className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                      
                      {/* Card Header */}
                      <div className={`p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${job.status === 'COMPLETED' ? 'bg-gray-50' : 'bg-white'}`}>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                          <span className={`text-xs font-bold ${job.status === 'COMPLETED' ? 'text-gray-500' : 'text-green-600'}`}>
                            {job.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {job.status === 'WORKER_ASSIGNED' || job.status === 'IN_PROGRESS' ? (
                          <button 
                            onClick={() => handleCompleteJob(job.id)} 
                            className="w-full sm:w-auto bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded hover:bg-gray-800 transition shadow-sm"
                          >
                            ✓ Mark Completed
                          </button>
                        ) : (
                          <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded w-full sm:w-auto text-center border border-gray-300">
                            Finished
                          </span>
                        )}
                      </div>
                      
                      {/* Card Body */}
                      <div className={`p-4 ${job.status === 'COMPLETED' ? 'opacity-75' : ''}`}>
                        <p className="text-sm text-gray-700 mb-5 leading-relaxed">{job.description}</p>
                        
                        <div className="bg-gray-50 p-4 rounded border border-gray-100">
                          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Client Details</h4>
                          <div className="text-sm text-gray-800 space-y-1.5">
                            <p className="flex items-center gap-2">
                              <span>✉️</span> 
                              <a href={`mailto:${job.client?.email}`} className="text-blue-600 hover:underline">{job.client?.email}</a>
                            </p>
                            <p className="flex items-start gap-2">
                              <span>📍</span> 
                              <span>{job.location}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}