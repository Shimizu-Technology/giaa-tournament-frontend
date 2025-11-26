import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser, UserButton } from '@clerk/clerk-react';
import { Button } from '../components/ui';
import { Calendar, MapPin, Users, LayoutDashboard, Phone, ChevronRight } from 'lucide-react';
import { api, RegistrationStatus } from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus | null>(null);

  useEffect(() => {
    // Fetch registration status (public endpoint)
    api.getRegistrationStatus()
      .then(setRegistrationStatus)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 relative overflow-hidden">
      {/* Subtle golf course pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23166534' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Admin bar at top when signed in */}
      {isLoaded && isSignedIn && (
        <div className="relative z-10 bg-[#1e3a5f] text-white py-2 px-3 md:px-4">
          <div className="container mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <LayoutDashboard size={16} className="flex-shrink-0" />
              <span className="text-xs md:text-sm truncate">
                Signed in as <strong className="font-semibold">{user?.firstName || user?.emailAddresses[0]?.emailAddress}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-xs md:text-sm hover:underline whitespace-nowrap"
              >
                Go to Dashboard →
              </button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-6 md:py-10">
        {/* GIAA Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex flex-col items-center mb-4 md:mb-6">
            {/* GIAA Logo representation */}
            <div className="mb-3">
              <svg viewBox="0 0 120 60" className="w-24 md:w-32 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Stylized airport terminal / latte stone icon */}
                <rect x="45" y="20" width="30" height="35" fill="#1e3a5f" rx="2"/>
                <rect x="50" y="25" width="8" height="10" fill="#60a5fa" rx="1"/>
                <rect x="62" y="25" width="8" height="10" fill="#60a5fa" rx="1"/>
                <rect x="50" y="38" width="8" height="10" fill="#60a5fa" rx="1"/>
                <rect x="62" y="38" width="8" height="10" fill="#60a5fa" rx="1"/>
                {/* Roof / Tower */}
                <path d="M60 5 L75 20 L45 20 Z" fill="#1e3a5f"/>
                <rect x="57" y="0" width="6" height="8" fill="#1e3a5f"/>
                {/* Wings */}
                <path d="M20 35 L45 25 L45 35 Z" fill="#1e3a5f"/>
                <path d="M100 35 L75 25 L75 35 Z" fill="#1e3a5f"/>
              </svg>
            </div>
            <p className="text-[10px] md:text-xs text-[#1e3a5f] font-semibold tracking-widest uppercase">
              A.B. Won Pat International
            </p>
            <p className="text-xs md:text-sm text-[#1e3a5f] font-bold tracking-wider">
              AIRPORT GUAM
            </p>
          </div>
        </div>

        {/* Main Title Section */}
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1e3a5f] mb-3 md:mb-4 tracking-wide">
            2026 AIRPORT WEEK
          </h1>
          
          {/* Elegant script for "5th Annual" */}
          <p 
            className="text-2xl sm:text-3xl md:text-4xl text-[#1e3a5f]/80 mb-2 md:mb-3"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
          >
            5th Annual
          </p>
          
          {/* Tournament name with golfer silhouette */}
          <div className="relative inline-block">
            {/* Golfer silhouette - positioned to the left */}
            <div className="hidden md:block absolute -left-20 top-1/2 -translate-y-1/2 opacity-20">
              <svg viewBox="0 0 80 120" className="w-16 h-24" fill="#1e3a5f">
                <ellipse cx="40" cy="12" rx="10" ry="11"/>
                <path d="M35 23 C30 25, 25 35, 28 50 L22 80 L28 82 L35 55 L38 80 L32 115 L38 117 L45 85 L52 117 L58 115 L52 80 L55 55 L62 82 L68 80 L62 50 C65 35, 60 25, 55 23 Z"/>
                <path d="M62 50 L75 45 L78 48 L65 55 Z"/>
                <circle cx="78" cy="43" r="4"/>
              </svg>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e3a5f] tracking-tight">
              EDWARD A.P. MUNA II
            </h2>
          </div>
          
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#c9a227] tracking-widest mt-2 md:mt-3">
            MEMORIAL GOLF TOURNAMENT
          </p>
        </div>

        {/* Main Content Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-900/10 overflow-hidden">
            {/* Event Details Header */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] px-4 sm:px-6 md:px-8 py-4 md:py-5">
              <h3 className="text-white text-sm md:text-base font-semibold tracking-wider uppercase text-center">
                Event Details
              </h3>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 md:p-5 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#1e3a5f] rounded-lg">
                      <Calendar className="text-white" size={18} />
                    </div>
                    <h4 className="font-bold text-[#1e3a5f] text-sm md:text-base">Date</h4>
                  </div>
                  <p className="text-gray-900 font-semibold text-base md:text-lg">January 9, 2026</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs md:text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#c9a227]"></span>
                      Registration: 11:00 am
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Shotgun Start: 12:30 pm
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 md:p-5 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#1e3a5f] rounded-lg">
                      <MapPin className="text-white" size={18} />
                    </div>
                    <h4 className="font-bold text-[#1e3a5f] text-sm md:text-base">Location</h4>
                  </div>
                  <p className="text-gray-900 font-semibold text-base md:text-lg">Country Club of the Pacific</p>
                  <p className="text-xs md:text-sm text-gray-600 mt-2">Windward Hills, Guam</p>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 md:p-5 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#1e3a5f] rounded-lg">
                      <Users className="text-white" size={18} />
                    </div>
                    <h4 className="font-bold text-[#1e3a5f] text-sm md:text-base">Format</h4>
                  </div>
                  <p className="text-gray-900 font-semibold text-base md:text-lg">Individual Callaway</p>
                  <p className="text-xs md:text-sm text-gray-600 mt-2">
                    Limited to {registrationStatus?.max_capacity ?? '...'} Players
                  </p>
                  {registrationStatus && (
                    <p className="text-xs text-gray-500 mt-1">
                      {registrationStatus.at_capacity ? (
                        <span className="text-amber-600 font-medium">Waitlist Only</span>
                      ) : (
                        <span className="text-green-600">{registrationStatus.capacity_remaining} spots left</span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Entry Fee Section */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-[#059669] rounded-r-xl p-4 md:p-6 mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                      Entry Fee: <span className="text-[#059669]">$125.00</span>
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                      <span className="flex items-center gap-1">
                        <span className="text-[#059669]">✓</span> Green Fee
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-[#059669]">✓</span> Ditty Bag
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-[#059669]">✓</span> Drinks & Food
                      </span>
                    </div>
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 md:text-right">
                    <p>Make checks payable to: <strong>GIAAEO</strong></p>
                    <p className="text-gray-500 mt-1">Prize winners contacted post tournament</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto text-base bg-[#1e3a5f] hover:bg-[#2c5282] shadow-lg shadow-blue-900/20"
                >
                  Register Now
                  <ChevronRight size={18} className="ml-1" />
                </Button>
                
                {isLoaded && isSignedIn ? (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/admin/dashboard')}
                    className="w-full sm:w-auto text-base border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"
                  >
                    Dashboard
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/admin/login')}
                    className="w-full sm:w-auto text-base border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"
                  >
                    Admin Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Footer */}
        <div className="max-w-2xl mx-auto text-center mt-8 md:mt-10 px-4">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-5 py-3 shadow-lg shadow-blue-900/5">
            <Phone size={16} className="text-[#1e3a5f]" />
            <span className="text-sm text-gray-600">For more information:</span>
            <span className="font-bold text-[#1e3a5f]">Peter Torres</span>
            <span className="text-[#c9a227] font-semibold">671.689.8677</span>
          </div>
        </div>

        {/* Decorative golf ball in corner - desktop only */}
        <div className="hidden lg:block fixed bottom-10 right-10 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-32 h-32" fill="#1e3a5f">
            <circle cx="50" cy="50" r="45" />
            <circle cx="35" cy="35" r="3" fill="white" opacity="0.5"/>
            <circle cx="50" cy="30" r="3" fill="white" opacity="0.5"/>
            <circle cx="65" cy="35" r="3" fill="white" opacity="0.5"/>
            <circle cx="30" cy="50" r="3" fill="white" opacity="0.5"/>
            <circle cx="45" cy="45" r="3" fill="white" opacity="0.5"/>
            <circle cx="60" cy="50" r="3" fill="white" opacity="0.5"/>
            <circle cx="70" cy="45" r="3" fill="white" opacity="0.5"/>
            <circle cx="35" cy="65" r="3" fill="white" opacity="0.5"/>
            <circle cx="50" cy="60" r="3" fill="white" opacity="0.5"/>
            <circle cx="65" cy="65" r="3" fill="white" opacity="0.5"/>
            <circle cx="40" cy="75" r="3" fill="white" opacity="0.5"/>
            <circle cx="55" cy="75" r="3" fill="white" opacity="0.5"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
