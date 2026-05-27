import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export default function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [debugError, setDebugError] = useState(null); 
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Backend Error ${response.status}: ${errorData.error || 'Unknown'}`);
        }
        
        const user = await response.json();
        
        if (!user.name || !user.phone) {
          setNeedsOnboarding(true);
        }
      } catch (err) {
        console.error("Gatekeeper Error:", err);
        setDebugError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      checkUserProfile();
    }
  }, [token]);

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/onboard`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name, phone })
      });

      if (!response.ok) throw new Error("Failed to update profile");

      alert("Profile completed! Welcome to the platform.");
      setNeedsOnboarding(false); 
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Security Check
  if (!token) return <Navigate to="/login" replace />;

  // 2. Role Check
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white max-w-sm w-full p-8 rounded-2xl shadow-sm border border-red-200 text-center">
          <div className="text-4xl mb-4">⛔</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // 3. DEBUG SCREEN 
  if (debugError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="bg-white max-w-lg w-full p-8 rounded-2xl shadow-xl border-t-4 border-red-600 text-center">
          <h2 className="text-2xl font-black text-red-600 mb-4 tracking-tight">🚨 Gatekeeper Blocked Access</h2>
          <p className="text-sm text-gray-600 mb-4">The frontend asked for your profile, but the backend rejected the token. Here is the exact error:</p>
          <div className="bg-red-50 text-red-800 p-4 rounded-xl font-mono text-sm mb-6 border border-red-200 text-left overflow-x-auto">
            {debugError}
          </div>
          <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
            Clear Local Storage & Restart
          </button>
        </div>
      </div>
    );
  }

  // 4. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-gray-500 font-medium animate-pulse tracking-wide uppercase">Securing Connection...</p>
      </div>
    );
  }

  // 5. Forced Onboarding
  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white max-w-md w-full p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
          
          <div className="text-center mb-8">
            <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm text-2xl border border-blue-100">
              👋
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome Aboard!</h2>
            <p className="text-sm text-gray-500 mt-2 font-medium">We just need a couple of details to complete your profile setup.</p>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Full Name</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                placeholder="e.g. Jane Doe" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Phone Number</label>
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                placeholder="e.g. +91 98765 43210" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:bg-blue-400 mt-2 h-[52px] flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Complete Setup →'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return children;
}