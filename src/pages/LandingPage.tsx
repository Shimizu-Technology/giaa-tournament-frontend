import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { Calendar, MapPin, Users, Trophy } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <Trophy className="text-blue-900" size={64} />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-4">
            2026 AIRPORT WEEK
          </h1>
          <h2 className="text-3xl md:text-4xl font-serif italic text-gray-700 mb-2">
            5th Annual
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            EDWARD A.P. MUNA II
          </h3>
          <p className="text-2xl text-amber-600 font-semibold">
            MEMORIAL GOLF TOURNAMENT
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <Calendar className="text-blue-900 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Date</h4>
                <p className="text-gray-600">TBD - Airport Week 2026</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="text-blue-900 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                <p className="text-gray-600">A.B. Won Pat International Airport Guam</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="text-blue-900 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Capacity</h4>
                <p className="text-gray-600">Limited to 160 Players</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Entry Fee: $125.00
            </h3>
            <ul className="text-gray-700 space-y-1">
              <li>Green Fee</li>
              <li>Ditty Bag</li>
              <li>Drinks & Food on the Course</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              Make checks payable to: GIAAEO
            </p>
            <p className="text-sm text-gray-600">
              Prize winners will be contacted post tournament.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto"
            >
              Register Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/admin/login')}
              className="w-full sm:w-auto"
            >
              Admin Login
            </Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto text-center text-gray-600">
          <p className="mb-2">For more information:</p>
          <p className="font-semibold text-gray-900">
            Contact Peter Torres at 671.689.8677
          </p>
        </div>
      </div>
    </div>
  );
};
