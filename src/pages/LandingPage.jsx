import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
      
      {/* NAVIGATION BAR */}
      <nav className="bg-white shadow-sm px-6 py-4 fixed w-full top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg text-lg">⚙️</div>
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              ESP<span className="text-blue-600">.</span>
            </div>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#services" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors">Services</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors">How it Works</a>
            <a href="#professionals" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors">For Professionals</a>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-sm"
          >
            Login / Register
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Text */}
          <div className="text-left z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-700 text-sm font-bold tracking-wide mb-6 border border-blue-100">
              India's Premier Engineering Network
            </span>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Professional Engineering Services, <br />
              <span className="text-blue-600">Delivered to Your Door.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl leading-relaxed">
              From commercial solar installations to complex residential wiring. Book trusted, KYC-verified professionals for your next project, complete with transparent field inspections and upfront quotes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
              >
                Book a Service
              </button>
              <a 
                href="#professionals"
                className="bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-xl text-lg font-bold hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm text-center"
              >
                Join as a Professional
              </a>
            </div>
          </div>
          
          {/* Hero Image - USING REFERRER POLICY FIX */}
          <div className="relative z-10 hidden md:block">
            <div className="absolute inset-0 bg-blue-100 rounded-[2rem] transform translate-x-4 translate-y-4 -z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1000" 
              alt="Engineer in hardhat" 
              referrerPolicy="no-referrer"
              className="rounded-[2rem] shadow-2xl object-cover h-[500px] w-full border border-gray-100"
            />
            {/* Trust Badge Floating */}
            <div className="absolute bottom-8 -left-8 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-4 animate-bounce-slow">
              <div className="bg-green-100 p-2 rounded-full text-2xl">🛡️</div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Verified Staff</p>
                <p className="text-sm font-black text-gray-900">100% KYC Approved</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4">How ESP Works for Clients</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We don't just connect you with anyone. Our strict operational pipeline ensures quality, accurate pricing, and professional execution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gray-200 -z-10"></div>
            
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 relative z-10">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-lg shadow-blue-200">1</div>
              <h3 className="text-xl font-bold mb-3">Request & Describe</h3>
              <p className="text-gray-600 text-sm">Tell us what you need via your Client Portal. Provide basic details and location for the job.</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 relative z-10">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-lg shadow-amber-200">2</div>
              <h3 className="text-xl font-bold mb-3">Field Inspection</h3>
              <p className="text-gray-600 text-sm">Our admins dispatch a Field Inspector to assess the site. You receive an accurate, upfront quote.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 relative z-10">
              <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-lg shadow-green-200">3</div>
              <h3 className="text-xl font-bold mb-3">Verified Execution</h3>
              <p className="text-gray-600 text-sm">Once you approve the quote, a KYC-verified professional is dispatched to complete the work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR SERVICES SECTION */}
      <section id="services" className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Our Expertise</h2>
              <p className="text-gray-600">Industrial-grade services for commercial and residential needs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="h-48 overflow-hidden">
                <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600" alt="Electrical" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">Electrical Wiring</h3>
                <p className="text-sm text-gray-500 line-clamp-2">Complete industrial and residential circuit installations and fault repairs.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="h-48 overflow-hidden">
                <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1509391366360-12009a325852?auto=format&fit=crop&q=80&w=600" alt="Solar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">Solar Installation</h3>
                <p className="text-sm text-gray-500 line-clamp-2">End-to-end solar grid setup, panel maintenance, and inverter configuration.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="h-48 overflow-hidden">
                <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600" alt="Plumbing" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">Advanced Plumbing</h3>
                <p className="text-sm text-gray-500 line-clamp-2">Commercial pipe routing, pressure testing, and heavy-duty leak resolution.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="h-48 overflow-hidden">
                <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1504307651254-35680f356f58?auto=format&fit=crop&q=80&w=600" alt="Labor" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">Skilled Labor</h3>
                <p className="text-sm text-gray-500 line-clamp-2">Vetted manual workforce for construction, moving, and heavy lifting operations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSING SECTION ADDED: FOR PROFESSIONALS */}
      <section id="professionals" className="py-24 bg-blue-600 text-white relative overflow-hidden">
        {/* Background graphic */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-black mb-6">Built for Independent Professionals.</h2>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Tired of hunting for clients? ESP provides a steady stream of pre-inspected, priced jobs directly to your dashboard. We handle the marketing, client follow-ups, and field inspections so you can focus on the work.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-lg">
                <span className="bg-blue-500 p-1 rounded text-sm">✅</span> Free to join the marketplace
              </li>
              <li className="flex items-center gap-3 text-lg">
                <span className="bg-blue-500 p-1 rounded text-sm">✅</span> Secure KYC verification builds client trust
              </li>
              <li className="flex items-center gap-3 text-lg">
                <span className="bg-blue-500 p-1 rounded text-sm">✅</span> Pick the jobs you want, ignore the ones you don't
              </li>
            </ul>
            <button 
              onClick={() => navigate('/login')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Start Earning Today
            </button>
          </div>
          
          <div className="bg-white/10 p-8 rounded-[2rem] border border-white/20 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-6 text-blue-50 text-center uppercase tracking-widest">The Worker Pipeline</h3>
            <div className="space-y-4">
              <div className="bg-white text-gray-900 p-4 rounded-xl flex items-center gap-4">
                <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center font-black">1</div>
                <div>
                  <h4 className="font-bold">Register & Verify</h4>
                  <p className="text-xs text-gray-500">Upload your ID for admin approval.</p>
                </div>
              </div>
              <div className="bg-white text-gray-900 p-4 rounded-xl flex items-center gap-4">
                <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center font-black">2</div>
                <div>
                  <h4 className="font-bold">Browse the Board</h4>
                  <p className="text-xs text-gray-500">See pre-inspected jobs in your area.</p>
                </div>
              </div>
              <div className="bg-white text-gray-900 p-4 rounded-xl flex items-center gap-4">
                <div className="bg-green-100 text-green-600 w-10 h-10 rounded-lg flex items-center justify-center font-black">3</div>
                <div>
                  <h4 className="font-bold">Express Interest</h4>
                  <p className="text-xs text-gray-500">Claim the job and execute the work.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-6">Ready to get started?</h2>
          <p className="text-gray-400 mb-10 text-lg">Whether you need a job done or you're a professional looking for work, our platform handles the logistics so you can focus on the results.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-blue-500 transition-colors shadow-lg"
          >
            Access the Portal →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
             <div className="text-xl font-black text-gray-900 tracking-tight">ESP<span className="text-blue-600">.</span></div>
          </div>
          <p className="text-sm text-gray-500">© 2026 Engineering Services Platform. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;