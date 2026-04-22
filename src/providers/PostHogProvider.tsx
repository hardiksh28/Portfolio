import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { ReactNode, useEffect } from 'react';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST;

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (POSTHOG_KEY && POSTHOG_KEY !== 'phc_...') {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'identified_only', // or 'always' if you want to track anonymous users too
        capture_pageview: true // Set to true to automatically capture the initial page load
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
