import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

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
      alert("Inspection report submitted successfully!");
      setNotesInputs(prev => ({ ...prev, [requestId]: '' })); // Clear input
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

  const getStatusBadge = (status) => {
    if (status === 'INSPECTION_DONE') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 font-sans text-gray-900">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded shadow-sm mb-6 gap-4">
          <div>
            <h1 className="text-xl font-bold">Field Inspector App</h1>
            <p className="text-sm text-gray-500">Manage site visits and submit reports.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded border border-gray-200">
              INSPECTOR
            </span>
            <button 
              onClick={handleLogout} 
              className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded transition"
            >
              Log Out
            </button>
          </div>
        </header>

        {/* Main Content */}
        {loading ? (
          <div className="text-center p-8 text-gray-500">Loading your schedule...</div>
        ) : inspections.length === 0 ? (
          <div className="bg-white p-8 rounded shadow-sm text-center border border-gray-200 text-gray-500">
            You have no assigned site visits at this time.
          </div>
        ) : (
          <div className="space-y-4">
            {inspections.map((req) => (
              <div key={req.id} className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                
                {/* Card Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">{req.title}</h2>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mt-0.5">{req.serviceType}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded border whitespace-nowrap ${getStatusBadge(req.status)}`}>
                    {req.status === 'INSPECTION_DONE' ? '✓ Completed' : 'Needs Visit'}
                  </span>
                </div>
                
                {/* Card Body */}
                <div className="p-4">
                  
                  {/* Job Details */}
                  <div className="mb-6 space-y-2">
                    <p className="text-sm text-gray-800">
                      <strong className="text-gray-900">Client Issue:</strong> {req.description}
                    </p>
                    <div className="flex flex-col space-y-1 mt-2 p-3 bg-gray-50 rounded border border-gray-100 text-sm text-gray-700">
                      <p className="flex items-start gap-2">
                        <span>📍</span> <span>{req.location}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span>✉️</span> 
                        <a href={`mailto:${req.client?.email}`} className="text-blue-600 hover:underline">{req.client?.email}</a>
                      </p>
                    </div>
                  </div>

                  {/* Admin Instructions */}
                  {req.adminNote && (
                    <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-100">
                       <h3 className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1">Admin Instructions</h3>
                       <p className="text-sm text-blue-900">{req.adminNote}</p>
                    </div>
                  )}

                  {/* Action Area: Report Submission or Completed Notes */}
                  {req.status === 'INSPECTION_DONE' ? (
                    <div className="bg-green-50 p-4 rounded border border-green-100">
                      <h3 className="text-[10px] font-bold text-green-800 uppercase tracking-widest mb-2">Your Submitted Notes</h3>
                      <p className="text-sm text-gray-800 italic">"{req.inspectionNotes}"</p>
                      <p className="text-xs text-gray-500 mt-3 font-medium">Submitted on: {new Date(req.inspectionDate).toLocaleDateString()}</p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 p-4 rounded border border-amber-100">
                      <label className="block text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">
                        Site Visit Report & Required Materials
                      </label>
                      <textarea
                        rows="3"
                        placeholder="e.g., Roof needs 5 panels, wiring is outdated. Will need 2 workers..."
                        className="w-full p-3 border border-amber-200 rounded text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none mb-3 resize-none bg-white shadow-sm"
                        value={notesInputs[req.id] || ''}
                        onChange={(e) => setNotesInputs({ ...notesInputs, [req.id]: e.target.value })}
                      ></textarea>
                      <button
                        onClick={() => handleSubmitReport(req.id)}
                        className="w-full bg-amber-600 text-white font-bold py-3 rounded hover:bg-amber-700 transition shadow-sm text-sm"
                      >
                        Submit Final Report
                      </button>
                    </div>
                  )}
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}