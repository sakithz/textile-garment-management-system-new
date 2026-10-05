import { useState } from 'react';

import type { User } from './types';

import Login from './pages/Login';

import Shell from './components/Shell';

import Dashboard from './pages/Dashboard';

import Orders from './pages/Orders';

import Quotations from './pages/Quotations';

import Customers from './pages/Customers';

import Inventory from './pages/Inventory';

import Production from './pages/Production';

import Delivery from './pages/Delivery';

import Finance from './pages/Finance';

import Marketing from './pages/Marketing';

import Employees from './pages/Employees';

import Users from './pages/Users';

import Reports from './pages/Reports';

import Notifications from './pages/Notifications';

import Settings from './pages/Settings';

import {
  logoutUser,
} from './services/authApi';

type Page =
    | 'dashboard'
    | 'orders'
    | 'order-details'
    | 'order-create'
    | 'quotations'
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

const PAGE_ROLES: Record<
    Page,
    User['role'][]
> = {
  dashboard: [
    'admin',
    'sales',
    'operations',
    'inventory',
    'production',
    'finance',
    'marketing',
    'delivery',
  ],

  orders: [
    'admin',
    'sales',
    'operations',
  ],

  'order-details': [
    'admin',
    'sales',
    'operations',
  ],

  'order-create': [
    'admin',
    'sales',
  ],

  quotations: [
    'admin',
    'sales',
  ],

  customers: [
    'admin',
    'sales',
  ],

  inventory: [
    'admin',
    'inventory',
    'production',
  ],

  production: [
    'admin',
    'operations',
    'production',
  ],

  delivery: [
    'admin',
    'operations',
    'delivery',
  ],

  finance: [
    'admin',
    'finance',
  ],

  marketing: [
    'admin',
    'marketing',
  ],

  employees: [
    'admin',
    'operations',
  ],

  users: [
    'admin',
  ],

  reports: [
    'admin',
    'finance',
    'operations',
  ],

  notifications: [
    'admin',
    'sales',
    'operations',
    'inventory',
    'production',
    'finance',
    'marketing',
    'delivery',
  ],

  settings: [
    'admin',
  ],

  profile: [
    'admin',
    'sales',
    'operations',
    'inventory',
    'production',
    'finance',
    'marketing',
    'delivery',
  ],
};

export default function App() {
  const [user, setUser] =
      useState<User | null>(
          null
      );

  const [currentPage, setCurrentPage] =
      useState<Page>(
          'dashboard'
      );

  const [selectedOrderId, setSelectedOrderId] =
      useState<
          string | undefined
      >();

  const handleNavigate = (
      page: string,
      orderId?: string
  ) => {
    const requestedPage =
        page as Page;

    if (orderId) {
      setSelectedOrderId(
          orderId
      );
    }

    if (
        user &&
        PAGE_ROLES[
            requestedPage
            ]?.includes(user.role)
    ) {
      setCurrentPage(
          requestedPage
      );
    } else {
      setCurrentPage(
          'dashboard'
      );
    }
  };

  const handleLogout = () => {
    logoutUser();

    setUser(null);

    setCurrentPage(
        'dashboard'
    );

    setSelectedOrderId(
        undefined
    );
  };

  if (!user) {
    return (
        <Login
            onLogin={(loggedInUser) => {
              setUser(
                  loggedInUser
              );

              setCurrentPage(
                  'dashboard'
              );

              setSelectedOrderId(
                  undefined
              );
            }}
        />
    );
  }

  const renderPage = () => {
    if (
        !PAGE_ROLES[
            currentPage
            ]?.includes(user.role)
    ) {
      return (
          <Dashboard
              user={user}
              onNavigate={
                handleNavigate
              }
          />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return (
            <Dashboard
                user={user}
                onNavigate={
                  handleNavigate
                }
            />
        );

      case 'orders':
        return (
            <Orders
                view="list"
                userRole={
                  user.role
                }
                onNavigate={
                  handleNavigate
                }
            />
        );

      case 'order-details':
        return (
            <Orders
                view="details"
                selectedOrderId={
                  selectedOrderId
                }
                userRole={
                  user.role
                }
                onNavigate={
                  handleNavigate
                }
            />
        );

      case 'order-create':
        return (
            <Orders
                view="create"
                userRole={
                  user.role
                }
                onNavigate={
                  handleNavigate
                }
            />
        );

      case 'quotations':
        return <Quotations />;

      case 'customers':
        return <Customers />;

      case 'inventory':
        return <Inventory />;

      case 'production':
        return (
            <Production
                onNavigate={
                  handleNavigate
                }
            />
        );

      case 'delivery':
        return (
            <Delivery
                _props={{
                  onNavigate:
                  handleNavigate,
                }}
            />
        );

      case 'finance':
        return <Finance />;

      case 'marketing':
        return <Marketing />;

      case 'employees':
        return <Employees />;

      case 'users':
        return (
            <Users
                user={user}
            />
        );

      case 'reports':
        return <Reports />;

      case 'notifications':
        return <Notifications />;

      case 'settings':
        return <Settings />;

      case 'profile':
        return (
            <ProfilePage
                user={user}
            />
        );

      default:
        return (
            <Dashboard
                user={user}
                onNavigate={
                  handleNavigate
                }
            />
        );
    }
  };

  return (
      <Shell
          user={user}
          currentPage={
            currentPage
          }
          onNavigate={
            handleNavigate as any
          }
          onLogout={
            handleLogout
          }
      >
        {renderPage()}
      </Shell>
  );
}

function ProfilePage({
                       user,
                     }: {
  user: User;
}) {
  const ROLE_LABELS: Record<
      User['role'],
      string
  > = {
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
        'Delivery Officer',
  };

  return (
      <div className="max-w-2xl">
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
              {user.avatar ||
                  user.name
                      .split(' ')
                      .map(
                          (name) =>
                              name[0]
                      )
                      .join('')
                      .slice(0, 2)}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {user.name}
              </h1>

              <p className="text-sm text-slate-500">
                {
                  ROLE_LABELS[
                      user.role
                      ]
                }
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">
                Email
              </dt>

              <dd className="font-medium">
                {user.email}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-slate-400">
                Department
              </dt>

              <dd className="font-medium">
                {user.department ||
                    '-'}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-slate-400">
                Role
              </dt>

              <dd className="font-medium">
                {
                  ROLE_LABELS[
                      user.role
                      ]
                }
              </dd>
            </div>
          </dl>
        </div>
      </div>
  );
}