import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  defaultEvents,
  defaultTeamMembers,
  defaultTimeline,
  defaultScoreboard,
  defaultCountdown,
  defaultBrochureLink,
} from '../data/initialData';

const AppContext = createContext(null);

function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function AppProvider({ children }) {
  const [events, setEventsState] = useState(() => {
    const raw = loadFromStorage('ignitron_events_v7', defaultEvents);
    return Array.isArray(raw) ? raw.map(({ prize, fee, price, ...rest }) => rest) : defaultEvents;
  });
  const [teamMembers, setTeamMembersState] = useState(() => loadFromStorage('ignitron_team_v5', defaultTeamMembers));
  const [timeline, setTimelineState] = useState(() => loadFromStorage('ignitron_timeline_v5', defaultTimeline));
  const [scoreboard, setScoreboardState] = useState(() => loadFromStorage('ignitron_scoreboard', defaultScoreboard));
  const [countdown, setCountdownState] = useState(() => loadFromStorage('ignitron_countdown_v4', defaultCountdown));
  const [brochureLink, setBrochureLinkState] = useState(() => loadFromStorage('ignitron_brochure', defaultBrochureLink));
  const [accommodationLink, setAccommodationLinkState] = useState(() => loadFromStorage('ignitron_accommodation', 'https://accomadation.vercel.app/'));
  const [gallery, setGalleryState] = useState(() => loadFromStorage('ignitron_gallery', []));

  // Authentication State
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('ignitron_token') || '');
  const [currentUser, setCurrentUser] = useState(() => loadFromStorage('ignitron_user', null));
  const [authLoading, setAuthLoading] = useState(() => Boolean(localStorage.getItem('ignitron_token')));
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    const token = localStorage.getItem('ignitron_token');
    return Boolean(token);
  });

  // Verify stored token against backend /api/auth/me on startup
  useEffect(() => {
    const token = localStorage.getItem('ignitron_token');
    if (!token) {
      setAuthToken('');
      setCurrentUser(null);
      setIsAdminLoggedIn(false);
      localStorage.removeItem('ignitron_user');
      setAuthLoading(false);
      return;
    }

    fetch('/api/auth/me', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          // Token is expired, invalid or tampered with
          setAuthToken('');
          setCurrentUser(null);
          setIsAdminLoggedIn(false);
          localStorage.removeItem('ignitron_token');
          localStorage.removeItem('ignitron_user');
          sessionStorage.removeItem('ignitron_admin');
        } else {
          const data = await res.json();
          if (data && data.user) {
            setCurrentUser(data.user);
            setIsAdminLoggedIn(true);
            localStorage.setItem('ignitron_user', JSON.stringify(data.user));
          }
        }
      })
      .catch(() => {
        const storedUser = loadFromStorage('ignitron_user', null);
        if (!storedUser || !storedUser.role) {
          setAuthToken('');
          setCurrentUser(null);
          setIsAdminLoggedIn(false);
          localStorage.removeItem('ignitron_token');
          localStorage.removeItem('ignitron_user');
        }
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  // Fetch Public Live Scoreboard from MongoDB Backend
  const refreshScoreboard = useCallback(async () => {
    try {
      const res = await fetch('/api/scoreboard');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setScoreboardState(data);
          saveToStorage('ignitron_scoreboard', data);
        }
      }
    } catch {
      // Offline fallback
    }
  }, []);

  // Fetch Events from MongoDB Backend
  const refreshEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setEventsState(data);
          saveToStorage('ignitron_events_v7', data);
        }
      }
    } catch {
      // Offline fallback
    }
  }, []);

  // Fetch Team Members from MongoDB Backend
  const refreshTeamMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTeamMembersState(data);
          saveToStorage('ignitron_team_v5', data);
        }
      }
    } catch {
      // Offline fallback
    }
  }, []);

  // Fetch Timeline from MongoDB Backend
  const refreshTimeline = useCallback(async () => {
    try {
      const res = await fetch('/api/timeline');
      if (res.ok) {
        const data = await res.json();
        if (data && data.timeline) {
          setTimelineState(data.timeline);
          saveToStorage('ignitron_timeline_v5', data.timeline);
        }
      }
    } catch {
      // Offline fallback
    }
  }, []);

  // Fetch Global Settings (Countdown, Brochure, Accommodation) from MongoDB Backend
  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.countdown) {
          setCountdownState(data.countdown);
          saveToStorage('ignitron_countdown_v4', data.countdown);
        }
        if (data.brochureLink) {
          setBrochureLinkState(data.brochureLink);
          saveToStorage('ignitron_brochure', data.brochureLink);
        }
        if (data.accommodationLink) {
          setAccommodationLinkState(data.accommodationLink);
          saveToStorage('ignitron_accommodation', data.accommodationLink);
        }
      }
    } catch {
      // Offline fallback
    }
  }, []);

  // Fetch Gallery Photos from MongoDB Backend
  const refreshGallery = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setGalleryState(data);
          saveToStorage('ignitron_gallery', data);
        }
      }
    } catch {
      // Offline fallback
    }
  }, []);

  // Unified Refresh All function across all devices
  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      refreshEvents(),
      refreshScoreboard(),
      refreshTeamMembers(),
      refreshTimeline(),
      refreshSettings(),
      refreshGallery(),
    ]);
  }, [refreshEvents, refreshScoreboard, refreshTeamMembers, refreshTimeline, refreshSettings, refreshGallery]);

  // Live Auto-Refresh & Cross-Device Revalidation Interval
  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 6000); // sync every 6 seconds
    const onFocus = () => refreshAll();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshAll]);

  // Secure API helper
  const apiFetch = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      setAuthToken('');
      setCurrentUser(null);
      setIsAdminLoggedIn(false);
      localStorage.removeItem('ignitron_token');
      localStorage.removeItem('ignitron_user');
    }
    return res;
  }, [authToken]);

  const setEvents = useCallback((val) => {
    const updated = typeof val === 'function' ? val(events) : val;
    setEventsState(updated);
    saveToStorage('ignitron_events_v7', updated);
  }, [events]);

  const setTeamMembers = useCallback((val) => {
    const updated = typeof val === 'function' ? val(teamMembers) : val;
    setTeamMembersState(updated);
    saveToStorage('ignitron_team_v5', updated);
  }, [teamMembers]);

  const setTimeline = useCallback((val) => {
    const updated = typeof val === 'function' ? val(timeline) : val;
    setTimelineState(updated);
    saveToStorage('ignitron_timeline_v5', updated);
  }, [timeline]);

  const setScoreboard = useCallback((val) => {
    const updated = typeof val === 'function' ? val(scoreboard) : val;
    setScoreboardState(updated);
    saveToStorage('ignitron_scoreboard', updated);
  }, [scoreboard]);

  const setCountdown = useCallback(async (val) => {
    setCountdownState(val);
    saveToStorage('ignitron_countdown_v4', val);
    try {
      await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ countdown: val }),
      });
      refreshSettings();
    } catch {}
  }, [apiFetch, refreshSettings]);

  const setBrochureLink = useCallback(async (val) => {
    setBrochureLinkState(val);
    saveToStorage('ignitron_brochure', val);
    try {
      await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ brochureLink: val }),
      });
      refreshSettings();
    } catch {}
  }, [apiFetch, refreshSettings]);

  const setAccommodationLink = useCallback(async (val) => {
    setAccommodationLinkState(val);
    saveToStorage('ignitron_accommodation', val);
    try {
      await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ accommodationLink: val }),
      });
      refreshSettings();
    } catch {}
  }, [apiFetch, refreshSettings]);

  // Role-Based Login Handler
  const adminLogin = useCallback(async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      setAuthToken(data.token);
      setCurrentUser(data.user);
      setIsAdminLoggedIn(true);

      localStorage.setItem('ignitron_token', data.token);
      localStorage.setItem('ignitron_user', JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: 'Cannot connect to backend server. Make sure server is running on port 5000.' };
    }
  }, []);

  // Logout Handler
  const adminLogout = useCallback(async () => {
    try {
      if (authToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });
      }
    } catch {
      // Ignore network error on logout
    } finally {
      setAuthToken('');
      setCurrentUser(null);
      setIsAdminLoggedIn(false);
      localStorage.removeItem('ignitron_token');
      localStorage.removeItem('ignitron_user');
      sessionStorage.removeItem('ignitron_admin');
    }
  }, [authToken]);

  return (
    <AppContext.Provider value={{
      events, setEvents, refreshEvents,
      teamMembers, setTeamMembers, refreshTeamMembers,
      timeline, setTimeline, refreshTimeline,
      scoreboard, setScoreboard, refreshScoreboard,
      countdown, setCountdown,
      brochureLink, setBrochureLink,
      accommodationLink, setAccommodationLink, refreshSettings,
      gallery, setGalleryState, refreshGallery,
      refreshAll,
      isAdminLoggedIn,
      currentUser,
      authToken,
      authLoading,
      adminLogin,
      adminLogout,
      apiFetch,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
