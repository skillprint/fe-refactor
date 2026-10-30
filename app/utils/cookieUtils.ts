/**
 * Utility functions for domain-agnostic cookie management and API resolution.
 */

// Helper to determine the top-level cookie domain to support subdomain cookie sharing.
// Returns a domain prefix like '; domain=.staging.skillprint.co' or '; domain=.skillprint.co'
// depending on whether the host is staging or production.
export const getCookieDomain = (): string => {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  
  // For localhost or IP addresses, don't set a domain attribute so the browser default (host-only) is used.
  if (
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || 
    hostname.includes(':')
  ) {
    return '';
  }
  
  // Handle skillprint.co domains
  if (hostname.endsWith('skillprint.co')) {
    if (hostname.includes('staging.skillprint.co')) {
      return '; domain=.staging.skillprint.co';
    }
    return '; domain=.skillprint.co';
  }
  
  // General fallback for other domain layouts
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    const domain = parts.slice(-2).join('.');
    return `; domain=.${domain}`;
  }
  
  return '';
};

// Get a cookie value by name
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  // The same name can be present more than once: a cookie scoped to
  // .skillprint.co (set on production) is also sent to
  // portal.staging.skillprint.co, next to the .staging.skillprint.co copy.
  // The old reader required exactly one match and returned null otherwise,
  // which made every write look like it had failed. Take the first match.
  const prefix = `${name}=`;
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      const value = trimmed.slice(prefix.length);
      if (value) return value;
    }
  }
  return null;
};

// Set a cookie value with dynamic domain scope
export const setCookie = (name: string, value: string, days = 365) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const domainAttr = getCookieDomain();
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/${domainAttr}`;
};

// Delete a cookie
export const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  const expired = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  // Clear the host-only cookie and every domain scope this host receives, so
  // a copy set from another subdomain (production's .skillprint.co while on
  // staging) cannot outlive the delete and keep reading as "still set".
  const scopes = new Set<string>(['']);
  const domainAttr = getCookieDomain();
  if (domainAttr) {
    scopes.add(domainAttr);
    const parts = window.location.hostname.split('.');
    for (let i = 1; i < parts.length - 1; i++) {
      scopes.add(`; domain=.${parts.slice(i).join('.')}`);
    }
  }
  scopes.forEach((scope) => {
    document.cookie = `${expired}${scope}`;
  });
};

// Dynamically resolve the API base URL depending on the current environment and hostname.
export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SKILLPRINT_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_SKILLPRINT_API_BASE_URL;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If we're on the production domain (not staging), use the production API
    if (hostname.endsWith('skillprint.co') && !hostname.includes('staging')) {
      return 'https://api.skillprint.co/';
    }
  }
  
  // Default to staging API
  return 'https://api.staging.skillprint.co/';
};
