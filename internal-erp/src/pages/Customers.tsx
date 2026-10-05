import { useEffect, useState } from 'react';

import type { Customer } from '../data/mockData';

import {
  fetchAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../services/customerApi';

import {
  fetchOrdersByCustomer,
} from '../services/orderApi';


type CustomerItem = Customer & {
  numericId?: number;
  country?: string;
};


type CustomerOrder = {
  numericId: number;
  id: string;
  customer?: string;
  garmentType?: string;
  quantity?: number;
  orderDate?: string;
  deliveryDate?: string;
  priority?: string;
  status?: string;
  progress?: number;
  unitPrice?: number;
  total?: number;
  fabric?: string;
  color?: string;
  size?: string;
};


function formatCurrency(value?: number | null): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount);
}


function formatDate(value?: string | null): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}


function getOrderStatusLabel(status?: string): string {
  if (!status) {
    return 'Pending';
  }

  const labels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    in_production: 'In Production',
    quality_check: 'Quality Check',
    ready: 'Ready',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
      labels[status.toLowerCase()] ||
      status
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, char => char.toUpperCase())
  );
}


function getOrderStatusClass(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'in_production':
      return 'bg-amber-100 text-amber-700';

    case 'delivered':
      return 'bg-emerald-100 text-emerald-700';

    case 'approved':
      return 'bg-blue-100 text-blue-700';

    case 'quality_check':
      return 'bg-purple-100 text-purple-700';

    case 'ready':
      return 'bg-cyan-100 text-cyan-700';

    case 'cancelled':
      return 'bg-red-100 text-red-700';

    case 'pending':
    default:
      return 'bg-slate-100 text-slate-600';
  }
}


export default function Customers() {
  const [customers, setCustomers] =
      useState<CustomerItem[]>([]);

  const [loading, setLoading] =
      useState(true);

  const [isLiveDb, setIsLiveDb] =
      useState(false);

  const [search, setSearch] =
      useState('');

  const [statusFilter, setStatusFilter] =
      useState('all');

  const [selected, setSelected] =
      useState<string | null>(null);

  const [recentOrders, setRecentOrders] =
      useState<CustomerOrder[]>([]);

  const [ordersLoading, setOrdersLoading] =
      useState(false);

  const [ordersError, setOrdersError] =
      useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] =
      useState(false);

  const [isEditModalOpen, setIsEditModalOpen] =
      useState(false);

  const [editingCustomer, setEditingCustomer] =
      useState<CustomerItem | null>(null);

  const [submitting, setSubmitting] =
      useState(false);

  const [error, setError] =
      useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    contact: '',
    status: 'active' as Customer['status'],
    totalOrders: 0,
    totalValue: 0,
  });


  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      /*
       * IMPORTANT:
       *
       * There is NO mock-data fallback here.
       *
       * The customer page must always use the real
       * backend database.
       */
      const data =
          await fetchAllCustomers();

      setCustomers(data);
      setIsLiveDb(true);
    } catch (err: any) {
      console.error(
          'Failed to load customers from database:',
          err
      );

      setCustomers([]);
      setIsLiveDb(false);

      setError(
          err?.message ||
          'Unable to connect to the customer database.'
      );
    } finally {
      setLoading(false);
    }
  };


  const loadCustomerOrders = async (
      customerId?: number
  ) => {
    if (!customerId) {
      setRecentOrders([]);
      return;
    }

    try {
      setOrdersLoading(true);
      setOrdersError(null);

      /*
       * Fetch orders directly from:
       *
       * GET /api/orders/customer/{customerId}
       *
       * No hard-coded/mock order numbers.
       */
      const orders =
          await fetchOrdersByCustomer(
              customerId
          );

      setRecentOrders(
          orders as CustomerOrder[]
      );
    } catch (err: any) {
      console.error(
          'Failed to load customer orders:',
          err
      );

      setRecentOrders([]);

      setOrdersError(
          err?.message ||
          'Unable to load customer orders.'
      );
    } finally {
      setOrdersLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  useEffect(() => {
    if (!selected) {
      setRecentOrders([]);
      setOrdersError(null);
      return;
    }

    const customer =
        customers.find(
            c => c.id === selected
        );

    if (!customer) {
      setRecentOrders([]);
      return;
    }

    loadCustomerOrders(
        customer.numericId
    );
  }, [
    selected,
    customers,
  ]);


  const handleCreateCustomer = async (
      e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      /*
       * New customers start with ZERO orders
       * and ZERO total value.
       *
       * Orders are created separately through
       * the Order Management / Quotation flow.
       */
      await createCustomer({
        name: form.name,
        company: form.company,
        email: form.email,
        contact: form.contact,
        status: form.status,
        totalOrders: 0,
        totalValue: 0,
      });

      setIsAddModalOpen(false);

      setForm({
        name: '',
        company: '',
        email: '',
        contact: '',
        status: 'active',
        totalOrders: 0,
        totalValue: 0,
      });

      await loadData();
    } catch (err: any) {
      setError(
          err?.message ||
          'Failed to create customer'
      );
    } finally {
      setSubmitting(false);
    }
  };


  const handleOpenEdit = (
      customer: CustomerItem
  ) => {
    setEditingCustomer(customer);

    setForm({
      name: customer.name,
      company: customer.company,
      email: customer.email,
      contact: customer.contact,
      status: customer.status,
      totalOrders:
          customer.totalOrders ?? 0,
      totalValue:
          customer.totalValue ?? 0,
    });

    setError(null);
    setIsEditModalOpen(true);
  };


  const handleUpdateCustomer = async (
      e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!editingCustomer?.numericId) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await updateCustomer(
          editingCustomer.numericId,
          {
            name: form.name,
            company: form.company,
            email: form.email,
            contact: form.contact,
            status: form.status,
            totalOrders:
            form.totalOrders,
            totalValue:
            form.totalValue,
          }
      );

      setIsEditModalOpen(false);
      setEditingCustomer(null);

      await loadData();
    } catch (err: any) {
      setError(
          err?.message ||
          'Failed to update customer'
      );
    } finally {
      setSubmitting(false);
    }
  };


  const handleDeleteCustomer = async (
      numericId?: number
  ) => {
    if (!numericId) {
      return;
    }

    if (
        !confirm(
            'Are you sure you want to delete this customer?'
        )
    ) {
      return;
    }

    try {
      await deleteCustomer(
          numericId
      );

      if (selected) {
        setSelected(null);
      }

      await loadData();
    } catch (err: any) {
      alert(
          err?.message ||
          'Failed to delete customer'
      );
    }
  };


  const filtered =
      customers.filter(customer => {
        const query =
            search.trim().toLowerCase();

        const matchSearch =
            query === '' ||
            customer.name
                .toLowerCase()
                .includes(query) ||
            customer.company
                .toLowerCase()
                .includes(query) ||
            customer.email
                .toLowerCase()
                .includes(query);

        const matchStatus =
            statusFilter === 'all' ||
            customer.status === statusFilter;

        return (
            matchSearch &&
            matchStatus
        );
      });


  const customer =
      selected
          ? customers.find(
              c => c.id === selected
          )
          : null;


  if (customer) {
    return (
        <div className="space-y-5">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#94a3b8]">

            <button
                onClick={() => setSelected(null)}
                className="hover:text-blue-600 transition-colors"
            >
              Customers
            </button>

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
                  d="M9 5l7 7-7 7"
              />
            </svg>

            <span className="text-[#334155] font-medium">
            {customer.name}
          </span>

          </div>


          {/* Customer Header */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">

            <div className="flex items-start gap-5">

              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white text-xl font-bold flex items-center justify-center font-display flex-shrink-0">
                {customer.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
              </div>


              <div className="flex-1">

                <div className="flex items-center gap-3 flex-wrap">

                  <h1 className="text-2xl font-bold text-[#0f172a]">
                    {customer.name}
                  </h1>

                  <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          customer.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                      }`}
                  >
                  {customer.status}
                </span>

                  {isLiveDb && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                    Live DB
                  </span>
                  )}

                </div>


                <p className="text-sm text-[#64748b] mt-1">
                  {customer.company}
                </p>


                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-[#64748b]">

                <span>
                  {customer.email}
                </span>

                  <span>
                  {customer.contact}
                </span>

                  <span>
                  {customer.country || '-'}
                </span>

                </div>

              </div>


              <div className="flex gap-2">

                <button
                    type="button"
                    onClick={() =>
                        handleOpenEdit(customer)
                    }
                    className="px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm font-semibold text-[#334155] hover:bg-[#f8fafc]"
                >
                  Edit
                </button>

                <button
                    type="button"
                    onClick={() =>
                        void handleDeleteCustomer(
                            customer.numericId
                        )
                    }
                    className="px-3 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>

              </div>

            </div>


            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

              <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">

                <p className="text-xs uppercase tracking-wide text-[#94a3b8] font-semibold">
                  Total Orders
                </p>

                <p className="text-2xl font-bold text-[#0f172a] mt-2">
                  {customer.totalOrders ?? 0}
                </p>

              </div>


              <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">

                <p className="text-xs uppercase tracking-wide text-[#94a3b8] font-semibold">
                  Total Value
                </p>

                <p className="text-2xl font-bold text-[#0f172a] mt-2">
                  {formatCurrency(
                      customer.totalValue
                  )}
                </p>

              </div>


              <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">

                <p className="text-xs uppercase tracking-wide text-[#94a3b8] font-semibold">
                  Last Order
                </p>

                <p className="text-lg font-bold text-[#0f172a] mt-2">
                  {formatDate(
                      customer.lastOrder
                  )}
                </p>

              </div>

            </div>


            {/* Customer Information */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 mt-4">

              <h2 className="text-lg font-semibold text-[#0f172a]">
                Customer Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">

                <div>
                  <p className="text-xs uppercase tracking-wide text-[#94a3b8]">
                    Customer Code
                  </p>

                  <p className="text-sm font-medium text-[#334155] mt-1">
                    {customer.id}
                  </p>
                </div>


                <div>
                  <p className="text-xs uppercase tracking-wide text-[#94a3b8]">
                    Full Name
                  </p>

                  <p className="text-sm font-medium text-[#334155] mt-1">
                    {customer.name}
                  </p>
                </div>


                <div>
                  <p className="text-xs uppercase tracking-wide text-[#94a3b8]">
                    Company
                  </p>

                  <p className="text-sm font-medium text-[#334155] mt-1">
                    {customer.company}
                  </p>
                </div>


                <div>
                  <p className="text-xs uppercase tracking-wide text-[#94a3b8]">
                    Email
                  </p>

                  <p className="text-sm font-medium text-[#334155] mt-1">
                    {customer.email}
                  </p>
                </div>


                <div>
                  <p className="text-xs uppercase tracking-wide text-[#94a3b8]">
                    Contact
                  </p>

                  <p className="text-sm font-medium text-[#334155] mt-1">
                    {customer.contact}
                  </p>
                </div>


                <div>
                  <p className="text-xs uppercase tracking-wide text-[#94a3b8]">
                    Country
                  </p>

                  <p className="text-sm font-medium text-[#334155] mt-1">
                    {customer.country || '-'}
                  </p>
                </div>


                <div>
                  <p className="text-xs uppercase tracking-wide text-[#94a3b8]">
                    Status
                  </p>

                  <p className="text-sm font-medium text-[#334155] mt-1 capitalize">
                    {customer.status}
                  </p>
                </div>


                <div>
                  <p className="text-xs uppercase tracking-wide text-[#94a3b8]">
                    Last Order
                  </p>

                  <p className="text-sm font-medium text-[#334155] mt-1">
                    {formatDate(
                        customer.lastOrder
                    )}
                  </p>
                </div>


                <div>
                  <p className="text-xs uppercase tracking-wide text-[#94a3b8]">
                    Total Value
                  </p>

                  <p className="text-sm font-medium text-[#334155] mt-1">
                    {formatCurrency(
                        customer.totalValue
                    )}
                  </p>
                </div>

              </div>

            </div>


            {/* Recent Orders */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden mt-4">

              <div className="px-6 py-5 border-b border-[#e2e8f0] flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-semibold text-[#0f172a]">
                    Recent Orders
                  </h2>

                  <p className="text-sm text-[#64748b] mt-1">
                    Orders associated with this customer.
                  </p>

                </div>

                <span className="text-sm text-[#64748b]">
                {recentOrders.length} order
                  {recentOrders.length === 1
                      ? ''
                      : 's'}
              </span>

              </div>


              {ordersLoading ? (

                  <div className="p-10 text-center text-sm text-[#64748b]">
                    Loading customer orders...
                  </div>

              ) : ordersError ? (

                  <div className="p-6">

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                      {ordersError}
                    </div>

                  </div>

              ) : recentOrders.length === 0 ? (

                  <div className="p-10 text-center">

                    <p className="text-sm font-medium text-[#475569]">
                      No orders found for this customer.
                    </p>

                    <p className="text-xs text-[#94a3b8] mt-1">
                      Orders created for this customer will appear here.
                    </p>

                  </div>

              ) : (

                  <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                      <thead className="bg-[#f8fafc]">

                      <tr>

                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                          Order
                        </th>

                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                          Garment
                        </th>

                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                          Quantity
                        </th>

                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                          Order Date
                        </th>

                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                          Delivery
                        </th>

                        <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                          Status
                        </th>

                        <th className="text-right px-5 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                          Total
                        </th>

                      </tr>

                      </thead>

                      <tbody>

                      {recentOrders.map(
                          order => (
                              <tr
                                  key={
                                      order.numericId ??
                                      order.id
                                  }
                                  className="border-t border-[#e2e8f0] hover:bg-[#f8fafc]"
                              >

                                <td className="px-5 py-3.5">
                          <span className="font-semibold text-blue-600">
                            {order.id}
                          </span>
                                </td>

                                <td className="px-5 py-3.5 text-[#334155]">
                                  {order.garmentType || '-'}
                                </td>

                                <td className="px-5 py-3.5 text-[#334155]">
                                  {order.quantity ?? 0}
                                </td>

                                <td className="px-5 py-3.5 text-[#64748b]">
                                  {formatDate(
                                      order.orderDate
                                  )}
                                </td>

                                <td className="px-5 py-3.5 text-[#64748b]">
                                  {formatDate(
                                      order.deliveryDate
                                  )}
                                </td>

                                <td className="px-5 py-3.5">

                          <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getOrderStatusClass(
                                  order.status
                              )}`}
                          >
                            {getOrderStatusLabel(
                                order.status
                            )}
                          </span>

                                </td>

                                <td className="px-5 py-3.5 text-right font-semibold text-[#334155]">
                                  {formatCurrency(
                                      order.total
                                  )}
                                </td>

                              </tr>
                          )
                      )}

                      </tbody>

                    </table>

                  </div>

              )}

            </div>


            {/* Back Button */}
            <div>

              <button
                  type="button"
                  onClick={() =>
                      setSelected(null)
                  }
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                ← Back to Customers
              </button>

            </div>

          </div>
        </div>
    );
  }


  return (
      <div className="space-y-5">

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">

          <div>

            <div className="flex items-center gap-3">

              <h1 className="text-2xl font-bold text-[#0f172a]">
                Customers
              </h1>

              {isLiveDb && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                Live MySQL
              </span>
              )}

            </div>

            <p className="text-sm text-[#64748b] mt-1">
              Manage customer information and order history.
            </p>

          </div>


          <button
              type="button"
              onClick={() =>
                  setIsAddModalOpen(true)
              }
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            + Add Customer
          </button>

        </div>


        {/* Error */}
        {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
        )}


        {/* Filters */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4">

          <div className="flex gap-3 flex-col md:flex-row">

            <div className="flex-1 relative">

              <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.15z"
                />
              </svg>

              <input
                  value={search}
                  onChange={e =>
                      setSearch(
                          e.target.value
                      )
                  }
                  placeholder="Search customers..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />

            </div>


            <select
                value={statusFilter}
                onChange={e =>
                    setStatusFilter(
                        e.target.value
                    )
                }
                className="px-3 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#334155] bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >

              <option value="all">
                All Statuses
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>


        {/* Customer Table */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">

          <div className="px-5 py-4 border-b border-[#e2e8f0]">

            <h2 className="font-semibold text-[#0f172a]">
              Customer List
            </h2>

            <p className="text-sm text-[#64748b] mt-1">
              {filtered.length} customer
              {filtered.length === 1
                  ? ''
                  : 's'} found.
            </p>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-[#f8fafc]">

              <tr>

                <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                  Customer
                </th>

                <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                  Company
                </th>

                <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                  Contact
                </th>

                <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                  Orders
                </th>

                <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                  Total Value
                </th>

                <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                  Status
                </th>

                <th className="text-right px-5 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                  Actions
                </th>

              </tr>

              </thead>


              <tbody>

              {loading ? (

                  <tr>
                    <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-[#64748b]"
                    >
                      Loading customers from MySQL...
                    </td>
                  </tr>

              ) : filtered.length === 0 ? (

                  <tr>
                    <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-[#94a3b8]"
                    >
                      No customers found.
                    </td>
                  </tr>

              ) : (

                  filtered.map(
                      customer => (
                          <tr
                              key={customer.id}
                              onClick={() =>
                                  setSelected(
                                      customer.id
                                  )
                              }
                              className="border-t border-[#e2e8f0] hover:bg-[#f8fafc] cursor-pointer"
                          >

                            <td className="px-5 py-3.5">

                              <div className="flex items-center gap-3">

                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                  {customer.name
                                      .split(' ')
                                      .map(
                                          n => n[0]
                                      )
                                      .join('')
                                      .slice(0, 2)}
                                </div>

                                <div>

                                  <p className="font-semibold text-[#334155]">
                                    {customer.name}
                                  </p>

                                  <p className="text-xs text-[#94a3b8]">
                                    {customer.email}
                                  </p>

                                </div>

                              </div>

                            </td>


                            <td className="px-5 py-3.5 text-[#334155]">
                              {customer.company}
                            </td>


                            <td className="px-5 py-3.5 text-[#64748b]">
                              {customer.contact}
                            </td>


                            <td className="px-5 py-3.5 text-[#334155] font-medium">
                              {customer.totalOrders ?? 0}
                            </td>


                            <td className="px-5 py-3.5 text-[#334155] font-medium">
                              {formatCurrency(
                                  customer.totalValue
                              )}
                            </td>


                            <td className="px-5 py-3.5">

                      <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              customer.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                          }`}
                      >
                        {customer.status}
                      </span>

                            </td>


                            <td className="px-5 py-3.5 text-right">

                              <div
                                  className="flex justify-end gap-1"
                                  onClick={e =>
                                      e.stopPropagation()
                                  }
                              >

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelected(
                                            customer.id
                                        )
                                    }
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50"
                                >
                                  View
                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        handleOpenEdit(
                                            customer
                                        )
                                    }
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#475569] hover:bg-[#f1f5f9]"
                                >
                                  Edit
                                </button>

                              </div>

                            </td>

                          </tr>
                      )
                  )

              )}

              </tbody>

            </table>

          </div>

        </div>
        {/* Add Customer Modal */}
        {isAddModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-[#e2e8f0] flex items-center justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-[#0f172a]">
                      Add Customer
                    </h2>

                    <p className="text-sm text-[#64748b] mt-1">
                      Create a new customer in the database.
                    </p>

                  </div>


                  <button
                      type="button"
                      onClick={() =>
                          setIsAddModalOpen(false)
                      }
                      className="w-8 h-8 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] flex items-center justify-center"
                  >
                    ×
                  </button>

                </div>


                {/* Form */}
                <form
                    onSubmit={handleCreateCustomer}
                    className="p-6 space-y-4"
                >

                  <div>

                    <label className="block text-sm font-medium text-[#334155] mb-1">
                      Full Name
                    </label>

                    <input
                        type="text"
                        value={form.name}
                        onChange={e =>
                            setForm(current => ({
                              ...current,
                              name: e.target.value,
                            }))
                        }
                        required
                        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        placeholder="Enter customer name"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-[#334155] mb-1">
                      Company
                    </label>

                    <input
                        type="text"
                        value={form.company}
                        onChange={e =>
                            setForm(current => ({
                              ...current,
                              company: e.target.value,
                            }))
                        }
                        required
                        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        placeholder="Enter company name"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-[#334155] mb-1">
                      Email
                    </label>

                    <input
                        type="email"
                        value={form.email}
                        onChange={e =>
                            setForm(current => ({
                              ...current,
                              email: e.target.value,
                            }))
                        }
                        required
                        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        placeholder="customer@example.com"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-[#334155] mb-1">
                      Contact
                    </label>

                    <input
                        type="text"
                        value={form.contact}
                        onChange={e =>
                            setForm(current => ({
                              ...current,
                              contact: e.target.value,
                            }))
                        }
                        required
                        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        placeholder="Contact number"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-[#334155] mb-1">
                      Status
                    </label>

                    <select
                        value={form.status}
                        onChange={e =>
                            setForm(current => ({
                              ...current,
                              status:
                                  e.target.value as Customer['status'],
                            }))
                        }
                        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    >

                      <option value="active">
                        Active
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>

                    </select>

                  </div>


                  {/* Error */}
                  {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                  )}


                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-3">

                    <button
                        type="button"
                        onClick={() =>
                            setIsAddModalOpen(false)
                        }
                        className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]"
                    >
                      Cancel
                    </button>


                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting
                          ? 'Creating...'
                          : 'Create Customer'}
                    </button>

                  </div>

                </form>

              </div>

            </div>
        )}


        {/* Edit Customer Modal */}
        {isEditModalOpen && editingCustomer && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">

                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-[#e2e8f0] flex items-center justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-[#0f172a]">
                      Edit Customer
                    </h2>

                    <p className="text-sm text-[#64748b] mt-1">
                      Update customer information.
                    </p>

                  </div>


                  <button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setEditingCustomer(null);
                      }}
                      className="w-8 h-8 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] flex items-center justify-center"
                  >
                    ×
                  </button>

                </div>


                {/* Form */}
                <form
                    onSubmit={handleUpdateCustomer}
                    className="p-6 space-y-4"
                >

                  <div>

                    <label className="block text-sm font-medium text-[#334155] mb-1">
                      Full Name
                    </label>

                    <input
                        type="text"
                        value={form.name}
                        onChange={e =>
                            setForm(current => ({
                              ...current,
                              name: e.target.value,
                            }))
                        }
                        required
                        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-[#334155] mb-1">
                      Company
                    </label>

                    <input
                        type="text"
                        value={form.company}
                        onChange={e =>
                            setForm(current => ({
                              ...current,
                              company: e.target.value,
                            }))
                        }
                        required
                        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-[#334155] mb-1">
                      Email
                    </label>

                    <input
                        type="email"
                        value={form.email}
                        onChange={e =>
                            setForm(current => ({
                              ...current,
                              email: e.target.value,
                            }))
                        }
                        required
                        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-[#334155] mb-1">
                      Contact
                    </label>

                    <input
                        type="text"
                        value={form.contact}
                        onChange={e =>
                            setForm(current => ({
                              ...current,
                              contact: e.target.value,
                            }))
                        }
                        required
                        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-[#334155] mb-1">
                      Status
                    </label>

                    <select
                        value={form.status}
                        onChange={e =>
                            setForm(current => ({
                              ...current,
                              status:
                                  e.target.value as Customer['status'],
                            }))
                        }
                        className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    >

                      <option value="active">
                        Active
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>

                    </select>

                  </div>


                  {/* Error */}
                  {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                  )}


                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-3">

                    <button
                        type="button"
                        onClick={() => {
                          setIsEditModalOpen(false);
                          setEditingCustomer(null);
                        }}
                        className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]"
                    >
                      Cancel
                    </button>


                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting
                          ? 'Saving...'
                          : 'Save Changes'}
                    </button>

                  </div>

                </form>

              </div>

            </div>
        )}

      </div>
  );
}