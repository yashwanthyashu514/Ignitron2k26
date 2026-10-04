import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Countdown() {
  const { countdown } = useApp();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calculate() {
      const now = new Date().getTime();
      const target = new Date(countdown).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="countdown-section">
      <div className="section-header">
        <div className="section-badge">⏳ Time to Event</div>
        <h2 className="section-title">Event Countdown</h2>
        <p className="section-sub">Mark your calendars — Ignitron 2K26 is almost here!</p>
      </div>

      <div className="countdown-grid">
        {units.map(({ label, value }) => (
          <div className="countdown-card" key={label}>
            <div className="countdown-glow" />
            <div className="countdown-number">{String(value).padStart(2, '0')}</div>
            <div className="countdown-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="countdown-date-display">
        📅 Event Date: <span>{new Date(countdown).toLocaleDateString('en-IN', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })}</span>
      </div>
    </div>
  );
}
