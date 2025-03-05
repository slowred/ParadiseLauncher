import './ActivityStatus.css'

export function ActivityStatus({ count }) {
  return (
    <div className="activity-status">
      <div className="pulse-dot"></div>
      <span className="status-text">{count.toLocaleString()} онлайн</span>
    </div>
  )
} 