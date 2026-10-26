import posthog from 'posthog-js';

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

let posthogInitialized = false;

function ensurePostHog(): boolean {
  if (typeof window === 'undefined') return false;
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token) return false;

  if (!posthogInitialized) {
    posthog.init(token, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      respect_dnt: true,
      person_profiles: 'identified_only',
    });
    posthogInitialized = true;
  }
  return true;
}

/** Custom funnel events only: autocapture and session replay are intentionally disabled. */
export function track(event: string, properties: AnalyticsProperties = {}) {
  if (!ensurePostHog()) return;

  try {
    posthog.capture(event, properties);
  } catch (error) {
    console.warn('PostHog event could not be captured:', error);
  }
}

export function trackPageView(pathname: string) {
  if (!ensurePostHog()) return;

  track('$pageview', { $current_url: `${window.location.origin}${pathname}` });
}
