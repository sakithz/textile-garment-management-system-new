import { useState } from 'react';
import type { User, Role } from '../data/mockData';
import { NOTIFICATIONS } from '../data/mockData';

type Page =
    | 'dashboard'
    | 'orders'
    | 'quotations'
    | 'order-details'
    | 'order-create'
    | 'customers'
    | 'inventory'
    | 'production'
    | 'delivery'
    | 'finance'
    | 'marketing'
    | 'employees'
    | 'users'
    | 'reports'
    | 'notifications'
    | 'settings'
    | 'profile';

interface NavItem {
  id: Page;
  label: string;
  icon: string;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [

  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a2 2 0 001 1v-4a2 2 0 011-1h2a2 2 0 011 1v4a2 2 0 001 1m-6 0h6',
    roles: [
      'admin',
      'sales',
      'operations',
      'inventory',
      'production',
      'finance',
      'marketing',
      'delivery'
    ]
  },

  {
    id: 'orders',
    label: 'Orders',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    roles: [
      'admin',
      'sales',
      'operations'
    ]
  },

  {
    id: 'quotations',
    label: 'Quotations',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    roles: [
      'admin',
      'sales'
    ]
  },

  {
    id: 'customers',
    label: 'Customers',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    roles: [
      'admin',
      'sales'
    ]
  },

  {
    id: 'inventory',
    label: 'Inventory',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    roles: [
      'admin',
      'inventory',
      'production'
    ]
  },

  {
    id: 'production',
    label: 'Production',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    roles: [
      'admin',
      'operations',
      'production'
    ]
  },

  {
    id: 'delivery',
    label: 'Delivery',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    roles: [
      'admin',
      'operations',
      'delivery'
    ]
  },

  {
    id: 'finance',
    label: 'Finance',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    roles: [
      'admin',
      'finance'
    ]
  },

  {
    id: 'marketing',
    label: 'Marketing',
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    roles: [
      'admin',
      'marketing'
    ]
  },

  {
    id: 'employees',
    label: 'Employees',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    roles: [
      'admin',
      'operations'
    ]
  },

  /*
   * ---------------------------------------------------------
   * USER MANAGEMENT
   * ---------------------------------------------------------
   *
   * Only ADMIN can see this navigation item.
   *
   * When another stakeholder logs in, this item is removed
   * automatically by visibleNav below.
   */
  {
    id: 'users',
    label: 'Users',
    icon: 'M12 4a4 4 0 100 8 4 4 0 000-8zM4 20a8 8 0 0116 0M18 8h4M20 6v4',
    roles: [
      'admin'
    ]
  },

  {
    id: 'reports',
    label: 'Reports',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    roles: [
      'admin',
      'finance',
      'operations'
    ]
  },

  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    roles: [
      'admin',
      'sales',
      'operations',
      'inventory',
      'production',
      'finance',
      'marketing',
      'delivery'
    ]
  },

  {
    id: 'settings',
    label: 'Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756.426-1.756 2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94.608-2.296.07-2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    roles: [
      'admin'
    ]
  }

];

const ROLE_LABELS: Record<Role, string> = {

  admin:
      'Administrator',

  sales:
      'Sales Executive',

  operations:
      'Operations Manager',

  inventory:
      'Inventory Officer',

  production:
      'Production Supervisor',

  finance:
      'Finance Officer',

  marketing:
      'Marketing Manager',

  delivery:
      'Delivery Officer'

};

interface ShellProps {
  user: User;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Shell({
                                user,
                                currentPage,
                                onNavigate,
                                onLogout,
                                children
                              }: ShellProps) {

  const [collapsed, setCollapsed] =
      useState(false);

  const [showUserMenu, setShowUserMenu] =
      useState(false);

  const [showNotifs, setShowNotifs] =
      useState(false);

  const [searchQuery, setSearchQuery] =
      useState('');

  const unreadCount =
      NOTIFICATIONS.filter(
          n => !n.read
      ).length;

  /*
   * ROLE-BASED NAVIGATION
   *
   * The navigation items are filtered using
   * the currently logged-in user's role.
   *
   * Example:
   *
   * ADMIN      -> Users visible
   * SALES      -> Users hidden
   * INVENTORY  -> Users hidden
   * PRODUCTION -> Users hidden
   * etc.
   */
  const visibleNav =
      NAV_ITEMS.filter(
          item =>
              item.roles.includes(user.role)
      );

  const now = new Date();

  const dateStr =
      now.toLocaleDateString(
          'en-IN',
          {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          }
      );

  return (

      <div className="flex h-screen bg-[#f0f2f7] overflow-hidden">

        {/* =====================================================
          SIDEBAR
          ===================================================== */}

        <aside
            className={`
          flex
          flex-col
          transition-all
          duration-300
          ${collapsed ? 'w-16' : 'w-60'}
        `}
            style={{
              background: '#0d1420',
              flexShrink: 0
            }}
        >

          {/* Logo */}

          <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">

            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">

              <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >

                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />

              </svg>

            </div>

            {!collapsed && (

                <div>

                  <div className="text-white font-bold text-sm font-display tracking-wide">
                    FABRIQS
                  </div>

                  <div className="text-[#475569] text-xs">
                    ERP Platform
                  </div>

                </div>

            )}

          </div>


          {/* Navigation */}

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">

            {visibleNav.map(
                item => (

                    <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(
                              item.id
                          );
                        }}
                        className={`
                    w-full
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2.5
                    rounded-lg
                    transition-colors
                    text-sm
                    ${
                            currentPage === item.id
                                ? 'bg-blue-600 text-white'
                                : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'
                        }
                  `}
                    >

                      <svg
                          className="w-5 h-5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                      >

                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={item.icon}
                        />

                      </svg>

                      {!collapsed && (

                          <span className="font-medium">
                      {item.label}
                    </span>

                      )}

                    </button>

                )
            )}

          </nav>


          {/* Collapse button */}

          <div className="p-2 border-t border-white/5">

            <button
                onClick={() =>
                    setCollapsed(
                        !collapsed
                    )
                }
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[#64748b] hover:bg-white/5 hover:text-white transition-colors"
            >

              <svg
                  className={`w-5 h-5 transition-transform ${
                      collapsed
                          ? 'rotate-180'
                          : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >

                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />

              </svg>

              {!collapsed && (

                  <span className="text-xs">
                    Collapse
                  </span>

              )}

            </button>

          </div>

        </aside>


        {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}

          <header className="h-16 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 flex-shrink-0">

            <div className="flex items-center gap-4">

              <div className="text-sm text-[#64748b]">
                {dateStr}
              </div>

              <div className="h-5 w-px bg-[#e2e8f0]" />

              <div className="relative">

                <input
                    type="text"
                    value={searchQuery}
                    onChange={e =>
                        setSearchQuery(
                            e.target.value
                        )
                    }
                    placeholder="Search..."
                    className="w-64 h-9 pl-9 pr-3 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />

                <svg
                    className="w-4 h-4 text-[#94a3b8] absolute left-3 top-2.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >

                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                  />

                </svg>

              </div>

            </div>


            <div className="flex items-center gap-3">

              {/* Notifications */}

              <div className="relative">

                <button
                    onClick={() => {
                      setShowNotifs(
                          !showNotifs
                      );

                      setShowUserMenu(
                          false
                      );
                    }}
                    className="relative w-9 h-9 rounded-lg hover:bg-[#f8fafc] flex items-center justify-center"
                >

                  <svg
                      className="w-5 h-5 text-[#64748b]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >

                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />

                  </svg>

                  {unreadCount > 0 && (

                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                    {unreadCount}
                  </span>

                  )}

                </button>


                {showNotifs && (

                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#e2e8f0] z-50 overflow-hidden">

                      <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between">

                    <span className="font-semibold text-sm font-display">
                      Notifications
                    </span>

                        <button
                            className="text-xs text-blue-600 font-medium"
                            onClick={() => {
                              onNavigate(
                                  'notifications'
                              );

                              setShowNotifs(
                                  false
                              );
                            }}
                        >
                          View all
                        </button>

                      </div>

                      <div className="max-h-72 overflow-y-auto">

                        {NOTIFICATIONS
                            .slice(0, 5)
                            .map(n => (

                                <div
                                    key={n.id}
                                    className={`
                            px-4
                            py-3
                            border-b
                            border-[#f1f5f9]
                            last:border-0
                            flex
                            gap-3
                            ${
                                        !n.read
                                            ? 'bg-blue-50/50'
                                            : ''
                                    }
                          `}
                                >

                                  <div
                                      className={`
                              w-2
                              h-2
                              rounded-full
                              mt-1.5
                              flex-shrink-0
                              ${
                                          n.type === 'alert'
                                              ? 'bg-amber-500'
                                              : n.type === 'finance'
                                                  ? 'bg-red-500'
                                                  : n.type === 'order'
                                                      ? 'bg-blue-500'
                                                      : 'bg-green-500'
                                      }
                            `}
                                  />

                                  <div className="min-w-0">

                                    <p className="text-xs text-[#334155] leading-relaxed">
                                      {n.message}
                                    </p>

                                    <p className="text-[10px] text-[#94a3b8] mt-0.5">
                                      {n.time}
                                    </p>

                                  </div>

                                </div>

                            ))}

                      </div>

                    </div>

                )}

              </div>


              {/* User */}

              <div className="relative">

                <button
                    onClick={() => {
                      setShowUserMenu(
                          !showUserMenu
                      );

                      setShowNotifs(
                          false
                      );
                    }}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors"
                >

                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center font-display">
                    {user.avatar}
                  </div>

                  <div className="text-left hidden md:block">

                    <div className="text-sm font-semibold text-[#0f172a] leading-tight">
                      {user.name}
                    </div>

                    <div className="text-xs text-[#64748b]">
                      {ROLE_LABELS[user.role]}
                    </div>

                  </div>

                  <svg
                      className="w-4 h-4 text-[#94a3b8]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >

                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />

                  </svg>

                </button>


                {showUserMenu && (

                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#e2e8f0] z-50 overflow-hidden py-1">

                      <button
                          onClick={() => {
                            onNavigate(
                                'profile'
                            );

                            setShowUserMenu(
                                false
                            );
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#334155] hover:bg-[#f8fafc] flex items-center gap-3"
                      >

                        <svg
                            className="w-4 h-4 text-[#94a3b8]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >

                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />

                        </svg>

                        My Profile

                      </button>


                      <button
                          onClick={() => {
                            onNavigate(
                                'settings'
                            );

                            setShowUserMenu(
                                false
                            );
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#334155] hover:bg-[#f8fafc] flex items-center gap-3"
                      >

                        <svg
                            className="w-4 h-4 text-[#94a3b8]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >

                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-0.826 3.31 0 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94.608-2.296.07-2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />

                        </svg>

                        Settings

                      </button>


                      <div className="border-t border-[#f1f5f9] my-1" />


                      <button
                          onClick={onLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >

                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >

                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />

                        </svg>

                        Sign Out

                      </button>

                    </div>

                )}

              </div>

            </div>

          </header>


          {/* ===================================================
            CONTENT
            =================================================== */}

          <main
              className="flex-1 overflow-y-auto p-6 erp-page-theme"
              onClick={() => {
                setShowUserMenu(false);
                setShowNotifs(false);
              }}
          >

            {children}

          </main>

        </div>

      </div>
  );
}