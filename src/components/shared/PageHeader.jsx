// components/PageHeader.jsx
// Usage: <PageHeader title="My Profile" subtitle="Manage your account info" />

const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex flex-col gap-0.5">
        {/* Accent bar */}
        <div className="flex items-center gap-3">
          <span className="w-1 h-6 rounded-full bg-primary-500 inline-block" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="text-sm text-gray-400 pl-4 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Optional action slot */}
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageHeader;