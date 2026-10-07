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
  } catch {
    console.error('Failed to save to localStorage');
  }
}

export function AppProvider({ children }) {
  const [events, setEventsState] = useState(() => {
    const raw = loadFromStorage('ignitron_events_v5', defaultEvents);
    return Array.isArray(raw) ? raw.map(({ prize, fee, price, ...rest }) => rest) : defaultEvents;
  });
  const [teamMembers, setTeamMembersState] = useState(() => loadFromStorage('ignitron_team_v4', defaultTeamMembers));
  const [timeline, setTimelineState] = useState(() => loadFromStorage('ignitron_timeline_v4', defaultTimeline));
  const [scoreboard, setScoreboardState] = useState(() => loadFromStorage('ignitron_scoreboard', defaultScoreboard));
  const [countdown, setCountdownState] = useState(() => loadFromStorage('ignitron_countdown_v3', defaultCountdown));
  const [brochureLink, setBrochureLinkState] = useState(() => loadFromStorage('ignitron_brochure', defaultBrochureLink));
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => sessionStorage.getItem('ignitron_admin') === 'true');

  const setEvents = useCallback((val) => {
    const updated = typeof val === 'function' ? val(events) : val;
    setEventsState(updated);
    saveToStorage('ignitron_events_v5', updated);
  }, [events]);

  const setTeamMembers = useCallback((val) => {
    const updated = typeof val === 'function' ? val(teamMembers) : val;
    setTeamMembersState(updated);
    saveToStorage('ignitron_team_v4', updated);
  }, [teamMembers]);

  const setTimeline = useCallback((val) => {
    const updated = typeof val === 'function' ? val(timeline) : val;
    setTimelineState(updated);
    saveToStorage('ignitron_timeline_v4', updated);
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

  const adminLogin = useCallback((username, password) => {
    if (username === 'ignitron2k26' && password === 'IgnitronGMUSA2026') {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('ignitron_admin', 'true');
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('ignitron_admin');
  }, []);

  return (
    <AppContext.Provider value={{
      events, setEvents,
      teamMembers, setTeamMembers,
      timeline, setTimeline,
      scoreboard, setScoreboard,
      countdown, setCountdown,
      brochureLink, setBrochureLink,
      isAdminLoggedIn, adminLogin, adminLogout,
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
