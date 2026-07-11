import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { PostHogProvider } from 'posthog-js/react';
import App from './App.tsx';
import './index.css';

// Get Clerk publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isLive = import.meta.env.VITE_SERVICE_MODE === 'live';

if (isLive && !PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your .env.local file.');
}

// PostHog configuration
const posthogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
};

const app = (
  <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={posthogOptions}>
    <App />
  </PostHogProvider>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isLive ? <ClerkProvider publishableKey={PUBLISHABLE_KEY!} afterSignOutUrl="/">{app}</ClerkProvider> : app}</StrictMode>
);
