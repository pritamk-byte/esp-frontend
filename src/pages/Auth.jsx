import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Replace this string with your REAL Render URL (no slash at the end)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const Auth = () => {
  const [email, setEmail] = useState(''); 
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const requestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true); 
    setMessage('');
    try {
      // 🚀 CHANGED: Using the dynamic API_BASE_URL
      await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { email });
      setMessage('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      setMessage('Error sending OTP. Make sure your backend is running.');
    } finally {
      setIsLoading(false); 
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true); 
    setMessage('');
    try {
      // 🚀 CHANGED: Using the dynamic API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }) 
      });
      
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        // --- ROUTING LOGIC ---
        if (data.role === 'CLIENT') {
          navigate('/client');
        } else if (data.role === 'WORKER') {
          navigate('/worker');
        } else if (data.role === 'INSPECTOR') {
          navigate('/inspector');
        } else if (data.role === 'TELECALLER') {
          navigate('/telecaller'); 
        } else {
          navigate('/admin'); 
        }
        
      } else {
        setMessage(data.error || "Failed to verify OTP. Please try again.");
      }
    } catch (err) {
      setMessage("Something went wrong connecting to the server.");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm text-2xl">
            ⚙️
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Engineering Platform
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {step === 1 ? 'Enter your email to access your dashboard.' : 'Check your inbox for the access code.'}
          </p>
        </div>
        
        {/* Alert Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-semibold border ${
            message.includes('sent') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={requestOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="name@company.com"
              />
            </div>
            <button 
              disabled={isLoading} 
              type="submit" 
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:bg-blue-400 flex justify-center items-center h-[52px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Send Login Code'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Enter OTP</label>
                <button 
                  type="button" 
                  onClick={() => { setStep(1); setOtp(''); setMessage(''); }} 
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Change Email
                </button>
              </div>
              <input 
                type="text" 
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-center tracking-[0.5em] text-2xl font-black text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder:text-gray-300"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <button 
              disabled={isLoading || otp.length < 4} 
              type="submit" 
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors shadow-sm disabled:bg-green-300 flex justify-center items-center h-[52px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Verify & Secure Login'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;