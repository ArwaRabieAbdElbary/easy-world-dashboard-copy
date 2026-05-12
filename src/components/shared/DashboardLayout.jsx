import { useState } from "react";
import { useNavigate, Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/profile", label: "My Profile", icon: UserCircle },
  { to: "/dashboard/users", label: "My Users", icon: Users },
  { to: "/dashboard/store-types", label: "Store Types", icon: Users },

];

const Sidebar = ({ mobile = false, onClose, onLogout }) => (
  <aside
    className={`flex flex-col h-full bg-white border-r border-gray-100 ${
      mobile ? "w-72 p-6" : "w-64 p-6"
    }`}
  >
    {/* Brand */}
    <div className="flex items-center gap-3 mb-10">
      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center font-extrabold text-white text-lg shadow">
        E
      </div>
      <span className="text-gray-900 text-lg font-bold tracking-wide">
        Easy World
      </span>
      {mobile && (
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      )}
    </div>

    {/* Nav */}
    <nav className="flex-1 space-y-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-3">
        Main Menu
      </p>
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => mobile && onClose()}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
            ${
              isActive
                ? "bg-primary-500 text-white shadow-md shadow-primary-200"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-white/20" : "bg-gray-100"
                }`}
              >
                <Icon
                  size={16}
                  className={isActive ? "text-white" : "text-gray-500"}
                />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>

    {/* Logout */}
    <div className="pt-4 border-t border-gray-100">
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
          text-red-500 hover:bg-red-50 transition-all cursor-pointer"
      >
        <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
          <LogOut size={16} className="text-red-500" />
        </span>
        Logout
      </button>
    </div>
  </aside>
);

/* ── Main Layout ── */
const DashboardLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 h-full">
            <Sidebar
              mobile
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-500 hover:text-gray-800"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1" />

          {/* Notification bell */}
          <button className="relative w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center font-bold text-white text-sm">
            A
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
