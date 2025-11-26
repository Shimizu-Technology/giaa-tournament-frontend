import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser, UserButton } from '@clerk/clerk-react';
import { Button } from '../components/ui';
import { Calendar, MapPin, Users, Trophy, LayoutDashboard } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Admin bar at top when signed in */}
      {isLoaded && isSignedIn && (
        <div className="bg-blue-900 text-white py-2 px-3 md:px-4">
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

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center items-center mb-4 md:mb-6">
            <Trophy className="text-blue-900" size={48} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-blue-900 mb-2 md:mb-4">
            2026 AIRPORT WEEK
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-serif italic text-gray-700 mb-1 md:mb-2">
            5th Annual
          </h2>
          <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-4">
            EDWARD A.P. MUNA II
          </h3>
          <p className="text-lg sm:text-xl md:text-2xl text-amber-600 font-semibold">
            MEMORIAL GOLF TOURNAMENT
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8 mb-6 md:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8">
            <div className="flex items-start gap-3 p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg">
              <Calendar className="text-blue-900 flex-shrink-0" size={22} />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5">Date</h4>
                <p className="text-gray-600 text-sm sm:text-base">January 9, 2026</p>
                <p className="text-xs text-gray-500">Registration: 11:00 am</p>
                <p className="text-xs text-gray-500">Shotgun Start: 12:30 pm</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg">
              <MapPin className="text-blue-900 flex-shrink-0" size={22} />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5">Location</h4>
                <p className="text-gray-600 text-sm sm:text-base">Country Club of the Pacific</p>
                <p className="text-xs text-gray-500">Windward Hills</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg">
              <Users className="text-blue-900 flex-shrink-0" size={22} />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5">Capacity</h4>
                <p className="text-gray-600 text-sm sm:text-base">Limited to 160 Players</p>
                <p className="text-xs text-gray-500">Individual Callaway</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-600 p-4 sm:p-6 mb-6 md:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Entry Fee: $125.00
            </h3>
            <ul className="text-gray-700 text-sm sm:text-base space-y-1">
              <li>Green Fee</li>
              <li>Ditty Bag</li>
              <li>Drinks & Food on the Course</li>
            </ul>
            <p className="text-xs sm:text-sm text-gray-600 mt-3">
              Make checks payable to: GIAAEO
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Prize winners will be contacted post tournament.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto text-base"
            >
              Register Now
            </Button>
            
            {isLoaded && isSignedIn ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/admin/dashboard')}
                className="w-full sm:w-auto text-base"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/admin/login')}
                className="w-full sm:w-auto text-base"
              >
                Admin Login
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto text-center text-gray-600 px-4">
          <p className="text-sm mb-1">For more information:</p>
          <p className="font-semibold text-gray-900 text-sm sm:text-base">
            Contact Peter Torres at 671.689.8677
          </p>
        </div>
      </div>
    </div>
  );
};
