import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Bell, FileText, Settings, LifeBuoy, ChevronLeft, ChevronRight } from 'lucide-react';
import UserMenu from './UserMenu';
import Clock from './../assests/clock.png';
import Logo from './../assests/famicons_logo-slack (1).png';
import ReportsIcon from './../assests/report.png';
import DashboardIcon from './../assests/chart-pie.png';
import SupportIcon from './../assests/chat-bubble-left-right.png';
import SettingIcon from './../assests/cog-six-tooth.png';

const AppLayout = ({ children, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const routeDetails = {
    '/dashboard': { icon: DashboardIcon, title: 'Dashboard' },
    '/alerts': { icon: Clock, title: 'Alerts' },
    '/reports': { icon: ReportsIcon, title: 'Reports' },
    '/settings': { icon: SettingIcon, title: 'Settings' },
    '/support': { icon: SupportIcon, title: 'Support' },
  };

  const currentRoute = routeDetails[location.pathname] || {
    icon: null,
    title: location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.slice(2),
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 bg-white border-r p-4 h-full fixed top-0 left-0 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className={`flex items-center justify-between mb-8 transition-all duration-300 ${collapsed ? 'flex-col gap-1' : 'flex-row gap-2'}`}>
          <div className={`flex items-center ${collapsed ? 'flex-col' : 'gap-2'}`}>
            <img src={Logo} alt="Logo"  className={`transition-all duration-300 ${collapsed ? 'w-4 h-4' : 'w-8 h-8'}`} />
            {!collapsed && <span className="text-blue-600 font-bold">Cybedefender AI</span>}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 mt-1"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 p-2 rounded ${
              location.pathname === '/dashboard'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Layout className="h-5 w-5" />
            {!collapsed && <span>Dashboard</span>}
          </Link>

          <Link
            to="/alerts"
            className={`flex items-center gap-2 p-2 rounded ${
              location.pathname === '/alerts'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bell className="h-5 w-5" />
            {!collapsed && <span>Alerts</span>}
          </Link>

          <Link
            to="/reports"
            className={`flex items-center gap-2 p-2 rounded ${
              location.pathname === '/reports'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-5 w-5" />
            {!collapsed && <span>Reports</span>}
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-2 p-2 rounded ${
              location.pathname === '/settings'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span>Settings</span>}
          </Link>

          <Link
            to="/support"
            className={`flex items-center gap-2 p-2 rounded ${
              location.pathname === '/support'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LifeBuoy className="h-5 w-5" />
            {!collapsed && <span>Support</span>}
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-8 w-full`}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            {currentRoute.icon && <img src={currentRoute.icon} alt="Route Icon" className="w-8 h-8" />}
            <h1 className="text-2xl font-bold">{currentRoute.title}</h1>
          </div>
          <UserMenu onLogout={onLogout} />
        </div>
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
