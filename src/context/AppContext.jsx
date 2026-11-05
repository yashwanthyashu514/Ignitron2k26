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
    const raw = loadFromStorage('ignitron_events_v6', defaultEvents);
    return Array.isArray(raw) ? raw.map(({ prize, fee, price, ...rest }) => rest) : defaultEvents;
  });
  const [teamMembers, setTeamMembersState] = useState(() => loadFromStorage('ignitron_team_v4', defaultTeamMembers));
  const [timeline, setTimelineState] = useState(() => loadFromStorage('ignitron_timeline_v5', defaultTimeline));
  const [scoreboard, setScoreboardState] = useState(() => loadFromStorage('ignitron_scoreboard', defaultScoreboard));
  const [countdown, setCountdownState] = useState(() => loadFromStorage('ignitron_countdown_v3', defaultCountdown));
  const [brochureLink, setBrochureLinkState] = useState(() => loadFromStorage('ignitron_brochure', defaultBrochureLink));

  // Authentication State
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('ignitron_token') || '');
  const [currentUser, setCurrentUser] = useState(() => loadFromStorage('ignitron_user', null));
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    const token = localStorage.getItem('ignitron_token');
    return Boolean(token);
  });

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
      // Offline fallback silently keeps cached scoreboard
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
          saveToStorage('ignitron_events_v6', data);
        }
      }
    } catch {
      // Offline fallback
    }
  }, []);

  // Live Scoreboard updates (auto-refresh interval)
  useEffect(() => {
    refreshScoreboard();
    refreshEvents();
    const interval = setInterval(refreshScoreboard, 5000);
    return () => clearInterval(interval);
  }, [refreshScoreboard, refreshEvents]);

  const setEvents = useCallback((val) => {
    const updated = typeof val === 'function' ? val(events) : val;
    setEventsState(updated);
    saveToStorage('ignitron_events_v6', updated);
  }, [events]);

  const setTeamMembers = useCallback((val) => {
    const updated = typeof val === 'function' ? val(teamMembers) : val;
    setTeamMembersState(updated);
    saveToStorage('ignitron_team_v4', updated);
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

  const setCountdown = useCallback((val) => {
    setCountdownState(val);
    saveToStorage('ignitron_countdown_v3', val);
  }, []);

  const setBrochureLink = useCallback((val) => {
    setBrochureLinkState(val);
    saveToStorage('ignitron_brochure', val);
  }, []);

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
      teamMembers, setTeamMembers,
      timeline, setTimeline,
      scoreboard, setScoreboard, refreshScoreboard,
      countdown, setCountdown,
      brochureLink, setBrochureLink,
      isAdminLoggedIn,
      currentUser,
      authToken,
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
