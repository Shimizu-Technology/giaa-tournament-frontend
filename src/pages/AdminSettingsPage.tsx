import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, Button, Input } from '../components/ui';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { AdminSettings } from '../types';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettings>({
    stripePublicKey: '',
    stripeSecretKey: '',
    adminEmail: '',
    capacityLimit: 160,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === 'capacityLimit' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="text-blue-900" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Stripe Configuration
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure your Stripe API keys for payment processing. These keys will be used
              for online payments during registration.
            </p>

            <div className="space-y-4">
              <Input
                label="Stripe Publishable Key"
                name="stripePublicKey"
                value={settings.stripePublicKey}
                onChange={handleChange}
                placeholder="pk_test_..."
                type="password"
              />

              <Input
                label="Stripe Secret Key"
                name="stripeSecretKey"
                value={settings.stripeSecretKey}
                onChange={handleChange}
                placeholder="sk_test_..."
                type="password"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> You can find your Stripe API keys in your{' '}
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-700"
                  >
                    Stripe Dashboard
                  </a>
                  . Use test keys for development and live keys for production.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Email Configuration
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Set the email address that will receive admin notifications and registration alerts.
            </p>

            <Input
              label="Admin Notification Email"
              name="adminEmail"
              type="email"
              value={settings.adminEmail}
              onChange={handleChange}
              placeholder="admin@example.com"
            />
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Tournament Configuration
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Set the maximum number of players allowed to register for the tournament.
              Once this limit is reached, new registrations will be added to the waitlist.
            </p>

            <div className="max-w-xs">
              <Input
                label="Capacity Limit"
                name="capacityLimit"
                type="number"
                value={settings.capacityLimit.toString()}
                onChange={handleChange}
                min="1"
                max="200"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-amber-900">
                <strong>Current Limit:</strong> {settings.capacityLimit} players
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Standard golf course capacity is typically 144-160 players (36-40 groups).
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Database Information
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              This application uses Supabase for data storage and real-time updates.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Database Provider:</span>
                <span className="font-medium text-gray-900">Supabase (PostgreSQL)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Real-time Updates:</span>
                <span className="font-medium text-green-600">Enabled</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Row Level Security:</span>
                <span className="font-medium text-green-600">Enabled</span>
              </div>
            </div>
          </Card>

          {saveMessage && (
            <div
              className={`p-4 rounded-lg ${
                saveMessage.includes('Error')
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-green-50 border border-green-200 text-green-700'
              }`}
            >
              {saveMessage}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSaving}>
              <Save size={20} className="mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
