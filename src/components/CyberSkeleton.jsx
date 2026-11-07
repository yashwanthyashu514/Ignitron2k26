import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Cyber Shimmer Line Component
 */
export function SkeletonLine({ width = '100%', height = '16px', style = {}, className = '' }) {
  return (
    <div
      className={`cyber-skeleton-line ${className}`}
      style={{
        width,
        height,
        borderRadius: '6px',
        ...style,
      }}
    />
  );
}

/**
 * Skeleton KPI Cards (Matching Admin Overview 6 KPI Cards)
 */
export function SkeletonKPI({ count = 6 }) {
  return (
    <div className="admin-kpi-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="cyber-skeleton-kpi-card">
          <SkeletonLine width="45%" height="14px" style={{ marginBottom: '10px' }} />
          <SkeletonLine width="65%" height="32px" style={{ marginBottom: '8px', borderRadius: '8px' }} />
          <SkeletonLine width="80%" height="12px" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Table (Matching Coordinator Table, Teams Table, Scoreboard Table)
 */
export function SkeletonTable({ rows = 6, cols = 7, headers = [] }) {
  return (
    <div className="admin-table-container">
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        {headers && headers.length > 0 && (
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              {headers.map((h, idx) => (
                <th key={idx} style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, rIdx) => (
            <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              {Array.from({ length: cols }).map((_, cIdx) => (
                <td key={cIdx} style={{ padding: '16px' }}>
                  <SkeletonLine
                    width={cIdx === 0 ? '75%' : cIdx === 1 ? '60%' : cIdx === 2 ? '85%' : cIdx === cols - 1 ? '50%' : '70%'}
                    height="18px"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Skeleton Cards (Matching Result Approvals & Team Cards Grid)
 */
export function SkeletonCards({ count = 4, columns = 'repeat(auto-fill, minmax(320px, 1fr))' }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: columns, gap: '20px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="cyber-skeleton-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <SkeletonLine width="55%" height="22px" />
            <SkeletonLine width="25%" height="20px" style={{ borderRadius: '12px' }} />
          </div>
          <SkeletonLine width="40%" height="14px" style={{ marginBottom: '12px' }} />
          <SkeletonLine width="90%" height="14px" style={{ marginBottom: '8px' }} />
          <SkeletonLine width="75%" height="14px" style={{ marginBottom: '20px' }} />
          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
            <SkeletonLine width="50%" height="34px" style={{ borderRadius: '8px' }} />
            <SkeletonLine width="50%" height="34px" style={{ borderRadius: '8px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Cyber Error State with Glowing Retry Button
 */
export function CyberErrorState({
  title = 'Data Connection Interrupted',
  message = 'Failed to stream live telemetry from the database server.',
  onRetry,
}) {
  return (
    <div className="cyber-error-card">
      <div className="cyber-error-icon-box">
        <AlertTriangle size={36} color="#ef4444" />
      </div>
      <h3 className="cyber-error-title">{title}</h3>
      <p className="cyber-error-message">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="cyber-retry-btn">
          <RefreshCw size={16} />
          <span>RETRY TELEMETRY</span>
        </button>
      )}
    </div>
  );
}

