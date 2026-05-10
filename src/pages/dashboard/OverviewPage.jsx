import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from "../../services/api";

/* ── helpers ── */
const StatCard = ({ icon: Icon, label, value, change, positive, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{value}</p>
      <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${positive ? "text-green-500" : "text-red-400"}`}>
        {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
  </div>
);

/* ── page ── */
const OverviewPage = () => {
  // Replace these queries with your actual endpoints
  const { data: statsData } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get("/dashboard/admin/stats"),
    // remove the line below once your endpoint is ready
    placeholderData: { data: { data: null } },
  });

  const { data: usersData } = useQuery({
    queryKey: ["recent-users"],
    queryFn: () => api.get("/dashboard/admin/users?limit=5"),
    placeholderData: { data: { data: { users: [] } } },
  });

  const stats = statsData?.data?.data;
  const recentUsers = usersData?.data?.data?.users ?? [];

  const statCards = [
    {
      icon: Users,
      label: "Total Users",
      value: stats?.totalUsers ?? "—",
      change: "12% this month",
      positive: true,
      color: "bg-primary-500",
    },
    {
      icon: TrendingUp,
      label: "Active Users",
      value: stats?.activeUsers ?? "—",
      change: "8% this month",
      positive: true,
      color: "bg-blue-500",
    },
    {
      icon: ShoppingBag,
      label: "Total Orders",
      value: stats?.totalOrders ?? "—",
      change: "3% this month",
      positive: false,
      color: "bg-violet-500",
    },
    {
      icon: DollarSign,
      label: "Revenue",
      value: stats?.revenue ? `$${stats.revenue}` : "—",
      change: "18% this month",
      positive: true,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Overview</h1>
        <p className="text-gray-400 text-sm mt-0.5">Welcome back, Admin 👋</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Recent users table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Recent Users</h2>
          <a href="/dashboard/users" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
            View all →
          </a>
        </div>

        {recentUsers.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            No recent users yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider bg-gray-50">
                  <th className="text-left px-6 py-3 font-semibold">Name</th>
                  <th className="text-left px-6 py-3 font-semibold">Email</th>
                  <th className="text-left px-6 py-3 font-semibold">Joined</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentUsers.map((user) => (
                  <tr key={user._id ?? user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">
                          {user.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{user.email}</td>
                    <td className="px-6 py-3 text-gray-400">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${user.isActive
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-500"
                        }`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewPage;