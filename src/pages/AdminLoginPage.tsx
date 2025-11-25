import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import { Trophy, Lock } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (email === 'admin@tournament.com' && password === 'demo2026') {
        navigate('/admin/dashboard');
      } else {
        setError('Invalid email or password');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Trophy className="text-blue-900" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-600">
            Edward A.P. Muna II Memorial Golf Tournament
          </p>
        </div>

        <Card>
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Lock className="text-blue-900" size={32} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-blue-900 hover:underline text-sm"
            >
              Back to Home
            </button>
          </div>
        </Card>

        <div className="mt-6 text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials</p>
          <p className="text-sm text-gray-700">
            <strong>Email:</strong> admin@tournament.com
          </p>
          <p className="text-sm text-gray-700">
            <strong>Password:</strong> demo2026
          </p>
        </div>
      </div>
    </div>
  );
};
