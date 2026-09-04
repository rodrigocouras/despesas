function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">

      <div className="stat-top">
        <span className="stat-title">
          {title}
        </span>

        <span className="stat-icon">
          {icon}
        </span>
      </div>

      <strong className="stat-value">
        {value}
      </strong>

    </div>
  );
}

export default StatCard;