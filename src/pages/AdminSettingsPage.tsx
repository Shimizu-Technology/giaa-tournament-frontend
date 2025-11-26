import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, Button, Input } from '../components/ui';
import { Save, Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import { api, Settings } from '../services/api';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Partial<Settings>>({
    stripe_public_key: '',
    stripe_secret_key: '',
    admin_email: '',
    max_capacity: 160,
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSettings();
      setSettings({
        stripe_public_key: data.stripe_public_key || '',
        stripe_secret_key: data.stripe_secret_key || '',
        admin_email: data.admin_email || '',
        max_capacity: data.max_capacity || 160,
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === 'max_capacity' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    setError(null);

    try {
      await api.updateSettings(settings);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw className="animate-spin" size={24} />
            <span>Loading settings...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center gap-2 lg:gap-3">
          <SettingsIcon className="text-blue-900" size={28} />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 lg:space-y-6">
          <Card className="p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-4">
              Stripe Configuration
            </h2>
            <p className="text-xs lg:text-sm text-gray-600 mb-3 lg:mb-4">
              Configure your Stripe API keys for payment processing.
            </p>

            <div className="space-y-3 lg:space-y-4">
              <Input
                label="Stripe Publishable Key"
                name="stripe_public_key"
                value={settings.stripe_public_key || ''}
                onChange={handleChange}
                placeholder="pk_test_..."
                type="password"
              />

              <Input
                label="Stripe Secret Key"
                name="stripe_secret_key"
                value={settings.stripe_secret_key || ''}
                onChange={handleChange}
                placeholder="sk_test_..."
                type="password"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4">
                <p className="text-xs lg:text-sm text-blue-900">
                  <strong>Note:</strong> Find your Stripe API keys in your{' '}
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-700"
                  >
                    Stripe Dashboard
                  </a>
                  . Use test keys for development.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-4">
              Email Configuration
            </h2>
            <p className="text-xs lg:text-sm text-gray-600 mb-3 lg:mb-4">
              Set the email address for admin notifications.
            </p>

            <Input
              label="Admin Notification Email"
              name="admin_email"
              type="email"
              value={settings.admin_email || ''}
              onChange={handleChange}
              placeholder="admin@example.com"
            />
          </Card>

          <Card className="p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-4">
              Tournament Configuration
            </h2>
            <p className="text-xs lg:text-sm text-gray-600 mb-3 lg:mb-4">
              Set the maximum number of players allowed.
            </p>

            <div className="max-w-xs">
              <Input
                label="Capacity Limit"
                name="max_capacity"
                type="number"
                value={settings.max_capacity?.toString() || '160'}
                onChange={handleChange}
                min="1"
                max="200"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 lg:p-4 mt-3 lg:mt-4">
              <p className="text-xs lg:text-sm text-amber-900">
                <strong>Current Limit:</strong> {settings.max_capacity} players
              </p>
              <p className="text-[10px] lg:text-xs text-amber-700 mt-1">
                Standard capacity is 144-160 players (36-40 groups).
              </p>
            </div>
          </Card>

          <Card className="p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-4">
              Database Information
            </h2>
            <p className="text-xs lg:text-sm text-gray-600 mb-3 lg:mb-4">
              System configuration details.
            </p>

            <div className="bg-gray-50 rounded-lg p-3 lg:p-4 space-y-2">
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-gray-600">Database:</span>
                <span className="font-medium text-gray-900">PostgreSQL</span>
              </div>
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-gray-600">Real-time:</span>
                <span className="font-medium text-green-600">ActionCable</span>
              </div>
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-gray-600">Auth:</span>
                <span className="font-medium text-green-600">Clerk JWT</span>
              </div>
            </div>
          </Card>

          {saveMessage && (
            <div
              className={`p-3 lg:p-4 rounded-lg text-sm ${
                saveMessage.includes('Error')
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-green-50 border border-green-200 text-green-700'
              }`}
            >
              {saveMessage}
            </div>
          )}

          <div className="flex justify-end pb-4">
            <Button type="submit" size="lg" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? (
                <>
                  <RefreshCw size={18} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
