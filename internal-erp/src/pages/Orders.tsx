import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from 'react';

import type {
    Customer,
    Order,
    OrderStatus,
    Priority,
    User,
} from '../types';

import {
    fetchAllOrders,
    fetchOrderByNumber,
    createOrder as apiCreateOrder,
    updateOrderStatus,
    deleteOrder,
} from '../services/orderApi';

import {
    fetchAllCustomers,
} from '../services/customerApi';


/* ============================================================
   HELPERS
   ============================================================ */

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        maximumFractionDigits: 2,
    }).format(value || 0);
}

function formatDate(value?: string | null): string {
    if (!value) {
        return '-';
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function formatStatus(value: string): string {
    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}


/* ============================================================
   TYPES
   ============================================================ */

interface Props {
    onNavigate: (
        page: string,
        orderId?: string
    ) => void;

    selectedOrderId?: string;

    view:
        | 'list'
        | 'details'
        | 'create';

    userRole: User['role'];
}

type LiveOrder = Order & {
    numericId: number;
    customerId: number;
};

type CustomerItem = Customer & {
    numericId: number;
};


/* ============================================================
   CONSTANTS
   ============================================================ */

const STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    in_production: 'In Production',
    quality_check: 'Quality Check',
    ready: 'Ready',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

const STATUS_CLASSES: Record<OrderStatus, string> = {
    pending:
        'bg-slate-100 text-slate-700',

    approved:
        'bg-blue-50 text-blue-700',

    in_production:
        'bg-amber-50 text-amber-700',

    quality_check:
        'bg-purple-50 text-purple-700',

    ready:
        'bg-green-50 text-green-700',

    delivered:
        'bg-emerald-50 text-emerald-700',

    cancelled:
        'bg-red-50 text-red-700',
};

const STATUS_DOT_CLASSES: Record<
    OrderStatus,
    string
> = {
    pending: 'bg-slate-500',
    approved: 'bg-blue-600',
    in_production: 'bg-amber-500',
    quality_check: 'bg-purple-600',
    ready: 'bg-green-600',
    delivered: 'bg-emerald-600',
    cancelled: 'bg-red-600',
};

const PRIORITY_CLASSES: Partial<
    Record<Priority, string>
> = {
    low:
        'bg-slate-100 text-slate-600',

    medium:
        'bg-blue-50 text-blue-700',

    high:
        'bg-orange-50 text-orange-700',

    urgent:
        'bg-red-50 text-red-700',
};


/* ============================================================
   STATUS BADGE
   ============================================================ */

function StatusBadge({
                         status,
                     }: {
    status: OrderStatus;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                STATUS_CLASSES[status]
            }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${
                    STATUS_DOT_CLASSES[status]
                }`}
            />

            {STATUS_LABELS[status]}
        </span>
    );
}


/* ============================================================
   PRIORITY BADGE
   ============================================================ */

function PriorityBadge({
                           priority,
                       }: {
    priority: Priority;
}) {
    return (
        <span
            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                PRIORITY_CLASSES[priority] ??
                'bg-slate-100 text-slate-600'
            }`}
        >
            {formatStatus(priority)}
        </span>
    );
}


/* ============================================================
   PROGRESS BAR
   ============================================================ */

function ProgressBar({
                         value,
                     }: {
    value: number;
}) {
    const safeValue = Math.max(
        0,
        Math.min(100, value || 0)
    );

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{
                        width: `${safeValue}%`,
                    }}
                />
            </div>

            <span className="text-xs text-[#94a3b8] w-9 text-right">
                {safeValue}%
            </span>
        </div>
    );
}


/* ============================================================
   SUMMARY CARD
   ============================================================ */

function SummaryCard({
                         label,
                         value,
                         color,
                         active,
                         onClick,
                     }: {
    label: string;
    value: number;
    color: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`bg-white rounded-xl p-5 border text-left transition-all hover:shadow-md ${
                active
                    ? 'border-blue-300 ring-2 ring-blue-100'
                    : 'border-[#e2e8f0]'
            }`}
        >
            <div
                className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                </svg>
            </div>

            <div className="text-2xl font-bold text-[#0f172a]">
                {value}
            </div>

            <div className="text-sm text-[#64748b] mt-0.5">
                {label}
            </div>
        </button>
    );
}


/* ============================================================
   ORDER LIST
   ============================================================ */

function OrderList({
                       onNavigate,
                       userRole,
                   }: {
    onNavigate: Props['onNavigate'];
    userRole: User['role'];
}) {
    const [orders, setOrders] =
        useState<LiveOrder[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [search, setSearch] =
        useState('');

    const [statusFilter, setStatusFilter] =
        useState<'all' | OrderStatus>('all');

    const [priorityFilter, setPriorityFilter] =
        useState<'all' | Priority>('all');

    const [workingId, setWorkingId] =
        useState<number | null>(null);


    /* --------------------------------------------------------
       LOAD ORDERS
       -------------------------------------------------------- */

    const loadOrders = async () => {
        setLoading(true);
        setError('');

        try {
            const data =
                await fetchAllOrders();

            setOrders(data);
        } catch (error) {
            setOrders([]);

            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to load orders from the database.'
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        void loadOrders();
    }, []);


    /* --------------------------------------------------------
       FILTERED ORDERS
       -------------------------------------------------------- */

    const filteredOrders =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return orders.filter(
                (order) => {
                    const matchesSearch =
                        !query ||
                        `${order.id} ${order.customer} ${order.garmentType}`
                            .toLowerCase()
                            .includes(query);

                    const matchesStatus =
                        statusFilter === 'all' ||
                        order.status ===
                        statusFilter;

                    const matchesPriority =
                        priorityFilter === 'all' ||
                        order.priority ===
                        priorityFilter;

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesPriority
                    );
                }
            );
        }, [
            orders,
            search,
            statusFilter,
            priorityFilter,
        ]);


    /* --------------------------------------------------------
       PERMISSIONS
       -------------------------------------------------------- */

    const canCreate =
        userRole === 'admin' ||
        userRole === 'sales';

    const canApprove =
        userRole === 'admin' ||
        userRole === 'operations';


    /* --------------------------------------------------------
       STATUS COUNTS
       -------------------------------------------------------- */

    const pendingCount =
        orders.filter(
            (order) =>
                order.status === 'pending'
        ).length;

    const approvedCount =
        orders.filter(
            (order) =>
                order.status === 'approved'
        ).length;

    const productionCount =
        orders.filter(
            (order) =>
                order.status ===
                'in_production'
        ).length;

    const qualityCount =
        orders.filter(
            (order) =>
                order.status ===
                'quality_check'
        ).length;

    const readyCount =
        orders.filter(
            (order) =>
                order.status === 'ready'
        ).length;

    const deliveredCount =
        orders.filter(
            (order) =>
                order.status === 'delivered'
        ).length;

    const cancelledCount =
        orders.filter(
            (order) =>
                order.status === 'cancelled'
        ).length;


    /* --------------------------------------------------------
       APPROVE
       -------------------------------------------------------- */

    const approveOrder = async (
        order: LiveOrder
    ) => {
        try {
            setWorkingId(
                order.numericId
            );

            await updateOrderStatus(
                order.numericId,
                'approved'
            );

            await loadOrders();
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : 'Failed to approve order.'
            );
        } finally {
            setWorkingId(null);
        }
    };


    return (
        <div className="space-y-5">

            {/* ==================================================
                HEADER
                ================================================== */}

            <div className="flex items-center justify-between gap-4 flex-wrap">

                <div>

                    <div className="flex items-center gap-2">

                        <h1 className="text-2xl font-bold text-[#0f172a]">
                            Order Management
                        </h1>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                            Live MySQL Connected
                        </span>

                    </div>

                    <p className="text-sm text-[#64748b] mt-0.5">
                        {filteredOrders.length}{' '}
                        {filteredOrders.length === 1
                            ? 'order'
                            : 'orders'}
                    </p>

                </div>


                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={() =>
                            void loadOrders()
                        }
                        className="px-4 py-2 text-sm font-semibold border border-[#e2e8f0] rounded-lg text-[#334155] hover:bg-[#f1f5f9] transition-colors flex items-center gap-2"
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
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>

                        Refresh
                    </button>


                    {canCreate && (
                        <button
                            type="button"
                            onClick={() =>
                                onNavigate(
                                    'order-create'
                                )
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
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
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>

                            Create Order
                        </button>
                    )}

                </div>

            </div>


            {/* ==================================================
                ERROR
                ================================================== */}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                    {error}
                </div>
            )}


            {/* ==================================================
                SUMMARY CARDS
                ================================================== */}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                <SummaryCard
                    label="Total Orders"
                    value={orders.length}
                    color="bg-blue-50 text-blue-600"
                    active={
                        statusFilter === 'all'
                    }
                    onClick={() =>
                        setStatusFilter('all')
                    }
                />

                <SummaryCard
                    label="Pending"
                    value={pendingCount}
                    color="bg-slate-50 text-slate-600"
                    active={
                        statusFilter ===
                        'pending'
                    }
                    onClick={() =>
                        setStatusFilter(
                            'pending'
                        )
                    }
                />

                <SummaryCard
                    label="In Production"
                    value={
                        productionCount
                    }
                    color="bg-amber-50 text-amber-600"
                    active={
                        statusFilter ===
                        'in_production'
                    }
                    onClick={() =>
                        setStatusFilter(
                            'in_production'
                        )
                    }
                />

                <SummaryCard
                    label="Ready"
                    value={readyCount}
                    color="bg-green-50 text-green-600"
                    active={
                        statusFilter ===
                        'ready'
                    }
                    onClick={() =>
                        setStatusFilter(
                            'ready'
                        )
                    }
                />

            </div>


            {/* ==================================================
                FILTERS
                ================================================== */}

            <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 flex gap-3 flex-wrap">

                <div className="flex-1 min-w-52 relative">

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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search order, customer, garment..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-[#f8fafc]"
                    />

                </div>


                <select
                    value={priorityFilter}
                    onChange={(event) =>
                        setPriorityFilter(
                            event.target.value as
                                | 'all'
                                | Priority
                        )
                    }
                    className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none bg-[#f8fafc] text-[#334155]"
                >
                    <option value="all">
                        All Priorities
                    </option>

                    <option value="high">
                        High
                    </option>

                    <option value="medium">
                        Medium
                    </option>

                    <option value="low">
                        Low
                    </option>
                </select>


                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value as
                                | 'all'
                                | OrderStatus
                        )
                    }
                    className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none bg-[#f8fafc] text-[#334155]"
                >
                    <option value="all">
                        All Status
                    </option>

                    <option value="pending">
                        Pending
                    </option>

                    <option value="approved">
                        Approved
                    </option>

                    <option value="in_production">
                        In Production
                    </option>

                    <option value="quality_check">
                        Quality Check
                    </option>

                    <option value="ready">
                        Ready
                    </option>

                    <option value="delivered">
                        Delivered
                    </option>

                    <option value="cancelled">
                        Cancelled
                    </option>
                </select>

            </div>


            {/* ==================================================
                TABLE
                ================================================== */}

            <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">

                {loading ? (
                    <div className="p-12 text-center text-[#64748b]">
                        Loading orders from MySQL...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-[#64748b]">
                        No orders match your filter criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead>

                            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">

                                <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                                    Order
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                                    Customer
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                                    Garment
                                </th>

                                <th className="text-right px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                                    Qty
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                                    Delivery
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                                    Priority
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                                    Status
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider min-w-[150px]">
                                    Progress
                                </th>

                                <th className="text-right px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                                    Amount
                                </th>

                                <th className="px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                                    Actions
                                </th>

                            </tr>

                            </thead>


                            <tbody>

                            {filteredOrders.map(
                                (order) => (
                                    <tr
                                        key={
                                            order.numericId
                                        }
                                        className="border-t border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                                    >

                                        <td className="px-5 py-3.5">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onNavigate(
                                                        'order-details',
                                                        order.id
                                                    )
                                                }
                                                className="font-semibold text-blue-600 hover:text-blue-700"
                                            >
                                                {order.id}
                                            </button>

                                        </td>


                                        <td className="px-4 py-3.5">

                                            <div className="font-medium text-[#334155]">
                                                {order.customer}
                                            </div>

                                        </td>


                                        <td className="px-4 py-3.5 text-[#64748b]">
                                            {order.garmentType}
                                        </td>


                                        <td className="px-4 py-3.5 text-right font-semibold text-[#0f172a]">
                                            {order.quantity.toLocaleString()}
                                        </td>


                                        <td className="px-4 py-3.5 text-[#64748b]">
                                            {formatDate(
                                                order.deliveryDate
                                            )}
                                        </td>


                                        <td className="px-4 py-3.5">

                                            <PriorityBadge
                                                priority={
                                                    order.priority
                                                }
                                            />

                                        </td>


                                        <td className="px-4 py-3.5">

                                            <StatusBadge
                                                status={
                                                    order.status
                                                }
                                            />

                                        </td>


                                        <td className="px-4 py-3.5 min-w-[150px]">

                                            <ProgressBar
                                                value={
                                                    order.progress
                                                }
                                            />

                                        </td>


                                        <td className="px-4 py-3.5 text-right font-semibold text-[#334155]">
                                            {formatCurrency(
                                                order.total
                                            )}
                                        </td>


                                        <td className="px-5 py-3.5">

                                            <div className="flex items-center gap-1.5">

                                                {canApprove &&
                                                    order.status ===
                                                    'pending' && (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                workingId ===
                                                                order.numericId
                                                            }
                                                            onClick={() =>
                                                                void approveOrder(
                                                                    order
                                                                )
                                                            }
                                                            className="px-2.5 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onNavigate(
                                                            'order-details',
                                                            order.id
                                                        )
                                                    }
                                                    className="px-2.5 py-1.5 text-xs font-semibold bg-white text-[#334155] border border-[#e2e8f0] rounded hover:bg-[#f8fafc] transition-colors"
                                                >
                                                    View
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                )
                            )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
}


/* ============================================================
   CREATE ORDER
   ============================================================ */
function CreateOrder({
                         onNavigate,
                     }: {
    onNavigate: Props['onNavigate'];
}) {
    const today =
        new Date().toISOString().slice(0, 10);

    const [customers, setCustomers] =
        useState<CustomerItem[]>([]);

    const [customersLoading, setCustomersLoading] =
        useState(true);

    const [customerError, setCustomerError] =
        useState('');

    const [selectedCustomerId, setSelectedCustomerId] =
        useState<number | ''>('');

    const [form, setForm] = useState({
        garmentType: '',
        quantity: 1,
        orderDate: today,
        deliveryDate: '',
        priority: 'medium' as Priority,
        unitPrice: 0,
        fabric: '',
        color: '',
        size: '',
    });

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState('');


    /* ========================================================
       LOAD CUSTOMERS
       ======================================================== */

    useEffect(() => {
        const loadCustomers = async () => {
            setCustomersLoading(true);
            setCustomerError('');

            try {
                const data =
                    await fetchAllCustomers();

                setCustomers(
                    data
                        .filter(
                            (customer) =>
                                customer.status ===
                                'active'
                        )
                        .map((customer) => ({
                            ...customer,
                            numericId:
                                customer.numericId ??
                                Number(customer.id),
                        }))
                );
            } catch (err) {
                setCustomers([]);

                setCustomerError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load customers.'
                );
            } finally {
                setCustomersLoading(false);
            }
        };

        void loadCustomers();
    }, []);


    /* ========================================================
       SELECTED CUSTOMER
       ======================================================== */

    const selectedCustomer =
        customers.find(
            (customer) =>
                customer.numericId ===
                selectedCustomerId
        );


    /* ========================================================
       FORM UPDATE
       ======================================================== */

    const updateForm = (
        field: keyof typeof form,
        value: string | number
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };


    /* ========================================================
       SUBMIT
       ======================================================== */

    const submit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError('');

        if (
            selectedCustomerId === ''
        ) {
            setError(
                'Please select a customer.'
            );
            return;
        }

        if (
            !form.garmentType.trim()
        ) {
            setError(
                'Please enter the garment type.'
            );
            return;
        }

        if (
            form.quantity < 1
        ) {
            setError(
                'Quantity must be at least 1.'
            );
            return;
        }

        if (
            form.unitPrice < 0
        ) {
            setError(
                'Unit price cannot be negative.'
            );
            return;
        }

        if (!form.orderDate) {
            setError(
                'Please select an order date.'
            );
            return;
        }

        if (!form.deliveryDate) {
            setError(
                'Please select a delivery date.'
            );
            return;
        }

        if (
            form.orderDate < today
        ) {
            setError(
                'Order date cannot be in the past.'
            );
            return;
        }

        if (
            form.deliveryDate < today
        ) {
            setError(
                'Delivery date cannot be in the past.'
            );
            return;
        }

        setSaving(true);

        try {
            const created =
                await apiCreateOrder({
                    customerId:
                        Number(
                            selectedCustomerId
                        ),

                    garmentType:
                        form.garmentType.trim(),

                    quantity:
                    form.quantity,

                    orderDate:
                    form.orderDate,

                    deliveryDate:
                    form.deliveryDate,

                    priority:
                    form.priority,

                    unitPrice:
                    form.unitPrice,

                    fabric:
                        form.fabric.trim(),

                    color:
                        form.color.trim(),

                    size:
                        form.size.trim(),
                });

            alert(
                `Order ${created.id} created successfully.`
            );

            onNavigate(
                'order-details',
                created.id
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create order.'
            );
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="space-y-5">

            {/* ==================================================
                HEADER
                ================================================== */}

            <div>

                <button
                    type="button"
                    onClick={() =>
                        onNavigate('orders')
                    }
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    ← Back to Orders
                </button>

                <div className="mt-2">

                    <h1 className="text-2xl font-bold text-[#0f172a]">
                        Create Order
                    </h1>

                    <p className="text-sm text-[#64748b] mt-0.5">
                        Create a new customer order using
                        information from the database.
                    </p>

                </div>

            </div>


            {/* ==================================================
                ERRORS
                ================================================== */}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            {customerError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {customerError}
                </div>
            )}


            {/* ==================================================
                FORM CARD
                ================================================== */}

            <form
                onSubmit={submit}
                className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden"
            >

                {/* ------------------------------------------------
                   CUSTOMER SECTION
                   ------------------------------------------------ */}

                <div className="px-6 py-5 border-b border-[#e2e8f0]">

                    <div className="flex items-center gap-3 mb-4">

                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">

                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.8}
                                    d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m8-8a4 4 0 100-8 4 4 0 000 8zm6-3v6m3-3h-6"
                                />
                            </svg>

                        </div>

                        <div>

                            <h2 className="text-base font-semibold text-[#0f172a]">
                                Customer
                            </h2>

                            <p className="text-xs text-[#64748b]">
                                Select a customer from the
                                database
                            </p>

                        </div>

                    </div>


                    <label className="block text-sm font-medium text-[#334155] mb-1.5">
                        Customer
                    </label>

                    <select
                        value={
                            selectedCustomerId
                        }
                        onChange={(event) => {
                            const value =
                                event.target.value;

                            setSelectedCustomerId(
                                value === ''
                                    ? ''
                                    : Number(value)
                            );
                        }}
                        disabled={
                            customersLoading
                        }
                        required
                        className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 disabled:opacity-60"
                    >

                        <option value="">
                            {customersLoading
                                ? 'Loading customers...'
                                : 'Select a customer'}
                        </option>

                        {customers.map(
                            (customer) => (
                                <option
                                    key={
                                        customer.numericId
                                    }
                                    value={
                                        customer.numericId
                                    }
                                >
                                    {customer.name}
                                    {' — '}
                                    {customer.company}
                                    {' — '}
                                    {customer.id}
                                </option>
                            )
                        )}

                    </select>


                    {/* CUSTOMER INFORMATION */}

                    {selectedCustomer && (
                        <div className="mt-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4">

                            <div className="flex items-center justify-between mb-4">

                                <div>

                                    <p className="text-sm font-semibold text-[#0f172a]">
                                        Customer Information
                                    </p>

                                    <p className="text-xs text-[#64748b] mt-0.5">
                                        Details loaded from
                                        the database
                                    </p>

                                </div>

                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                    {selectedCustomer.id}
                                </span>

                            </div>


                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                                <CustomerInfo
                                    label="Name"
                                    value={
                                        selectedCustomer.name
                                    }
                                />

                                <CustomerInfo
                                    label="Company"
                                    value={
                                        selectedCustomer.company
                                    }
                                />

                                <CustomerInfo
                                    label="Email"
                                    value={
                                        selectedCustomer.email
                                    }
                                />

                                <CustomerInfo
                                    label="Contact"
                                    value={
                                        selectedCustomer.contact
                                    }
                                />

                                <CustomerInfo
                                    label="Customer ID"
                                    value={
                                        `#${selectedCustomer.numericId}`
                                    }
                                />

                                <CustomerInfo
                                    label="Previous Orders"
                                    value={String(
                                        selectedCustomer.totalOrders ??
                                        0
                                    )}
                                />

                            </div>

                        </div>
                    )}

                </div>


                {/* ------------------------------------------------
                   ORDER DETAILS SECTION
                   ------------------------------------------------ */}

                <div className="px-6 py-5">

                    <div className="flex items-center gap-3 mb-5">

                        <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">

                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.8}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0M9 5h6"
                                />
                            </svg>

                        </div>

                        <div>

                            <h2 className="text-base font-semibold text-[#0f172a]">
                                Order Details
                            </h2>

                            <p className="text-xs text-[#64748b]">
                                Enter the order and product
                                information
                            </p>

                        </div>

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <FormField
                            label="Garment Type"
                            value={
                                form.garmentType
                            }
                            onChange={(value) =>
                                updateForm(
                                    'garmentType',
                                    value
                                )
                            }
                            required
                            placeholder="e.g. Jacket"
                        />


                        <FormField
                            label="Quantity"
                            type="number"
                            min="1"
                            value={String(
                                form.quantity
                            )}
                            onChange={(value) =>
                                updateForm(
                                    'quantity',
                                    Number(value)
                                )
                            }
                            required
                            placeholder="Enter quantity"
                        />


                        <FormField
                            label="Unit Price (LKR)"
                            type="number"
                            min="0"
                            step="0.01"
                            value={String(
                                form.unitPrice
                            )}
                            onChange={(value) =>
                                updateForm(
                                    'unitPrice',
                                    Number(value)
                                )
                            }
                            required
                            placeholder="0.00"
                        />


                        <FormField
                            label="Order Date"
                            type="date"
                            min={today}
                            value={
                                form.orderDate
                            }
                            onChange={(value) =>
                                updateForm(
                                    'orderDate',
                                    value
                                )
                            }
                            required
                        />


                        <FormField
                            label="Delivery Date"
                            type="date"
                            min={today}
                            value={
                                form.deliveryDate
                            }
                            onChange={(value) =>
                                updateForm(
                                    'deliveryDate',
                                    value
                                )
                            }
                            required
                        />


                        <div>

                            <label className="block text-sm font-medium text-[#334155] mb-1.5">
                                Priority
                            </label>

                            <select
                                value={
                                    form.priority
                                }
                                onChange={(event) =>
                                    updateForm(
                                        'priority',
                                        event.target
                                            .value as Priority
                                    )
                                }
                                className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                            >

                                <option value="low">
                                    Low
                                </option>

                                <option value="medium">
                                    Medium
                                </option>

                                <option value="high">
                                    High
                                </option>

                            </select>

                        </div>


                        <FormField
                            label="Fabric"
                            value={
                                form.fabric
                            }
                            onChange={(value) =>
                                updateForm(
                                    'fabric',
                                    value
                                )
                            }
                            placeholder="e.g. Polyester"
                        />


                        <FormField
                            label="Color"
                            value={
                                form.color
                            }
                            onChange={(value) =>
                                updateForm(
                                    'color',
                                    value
                                )
                            }
                            placeholder="e.g. White"
                        />


                        <FormField
                            label="Size"
                            value={
                                form.size
                            }
                            onChange={(value) =>
                                updateForm(
                                    'size',
                                    value
                                )
                            }
                            placeholder="e.g. M, L"
                        />

                    </div>

                </div>


                {/* ------------------------------------------------
                   FOOTER ACTIONS
                   ------------------------------------------------ */}

                <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-end gap-2">

                    <button
                        type="button"
                        onClick={() =>
                            onNavigate(
                                'orders'
                            )
                        }
                        className="px-4 py-2.5 text-sm font-semibold border border-[#e2e8f0] rounded-lg text-[#334155] bg-white hover:bg-[#f1f5f9] transition-colors"
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        disabled={
                            saving ||
                            customersLoading
                        }
                        className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >

                        {saving ? (
                            <>
                                <svg
                                    className="w-4 h-4 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />

                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    />
                                </svg>

                                Creating...
                            </>
                        ) : (
                            <>
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
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>

                                Create Order
                            </>
                        )}

                    </button>

                </div>

            </form>

        </div>
    );
}


/* ============================================================
   CUSTOMER INFO
   ============================================================ */

function CustomerInfo({
                          label,
                          value,
                      }: {
    label: string;
    value: string;
}) {
    return (
        <div>

            <p className="text-xs font-medium text-[#94a3b8] uppercase tracking-wide">
                {label}
            </p>

            <p className="text-sm font-medium text-[#334155] mt-1 break-words">
                {value || '-'}
            </p>

        </div>
    );
}


/* ============================================================
   FORM FIELD
   ============================================================ */

function FormField({
                       label,
                       value,
                       onChange,
                       type = 'text',
                       min,
                       step,
                       required = false,
                       placeholder,
                   }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    min?: string;
    step?: string;
    required?: boolean;
    placeholder?: string;
}) {
    return (
        <div>

            <label className="block text-sm font-medium text-[#334155] mb-1.5">
                {label}
            </label>

            <input
                type={type}
                value={value}
                min={min}
                step={step}
                required={required}
                placeholder={placeholder}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
            />

        </div>
    );
}


/* ============================================================
   ORDER DETAILS
   ============================================================ */
function OrderDetails({
                          orderId,
                          onNavigate,
                          userRole,
                      }: {
    orderId: string;
    onNavigate: Props['onNavigate'];
    userRole: User['role'];
}) {
    const [order, setOrder] =
        useState<LiveOrder | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [working, setWorking] =
        useState(false);


    /* ========================================================
       LOAD ORDER
       ======================================================== */

    const loadOrder = async () => {
        setLoading(true);
        setError('');

        try {
            const data =
                await fetchOrderByNumber(
                    orderId
                );

            setOrder(data);
        } catch (err) {
            setOrder(null);

            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load order details.'
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        void loadOrder();
    }, [orderId]);


    /* ========================================================
       LOADING STATE
       ======================================================== */

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center">

                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

                <p className="text-sm text-[#64748b]">
                    Loading order details...
                </p>

            </div>
        );
    }


    /* ========================================================
       NOT FOUND
       ======================================================== */

    if (!order) {
        return (
            <div className="space-y-5">

                <button
                    type="button"
                    onClick={() =>
                        onNavigate('orders')
                    }
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    ← Back to Orders
                </button>


                <div className="bg-white rounded-xl border border-red-200 p-10 text-center">

                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">

                        <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v3.75m0 3.75h.008M10.29 3.86l-8.2 14A2 2 0 003.82 21h16.36a2 2 0 001.73-3.14l-8.2-14a2 2 0 00-3.42 0z"
                            />
                        </svg>

                    </div>

                    <h2 className="text-lg font-semibold text-[#0f172a]">
                        Order Not Found
                    </h2>

                    <p className="text-sm text-[#64748b] mt-1">
                        {error ||
                            'The requested order could not be found.'}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            void loadOrder()
                        }
                        className="mt-5 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    /* ========================================================
       CHANGE STATUS
       ======================================================== */

    const changeStatus = async (
        status: OrderStatus
    ) => {
        try {
            setWorking(true);

            const updated =
                await updateOrderStatus(
                    order.numericId,
                    status
                );

            setOrder(updated);
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : 'Failed to update order status.'
            );
        } finally {
            setWorking(false);
        }
    };


    /* ========================================================
       DELETE ORDER
       ======================================================== */

    const removeOrder = async () => {
        const confirmed =
            window.confirm(
                `Are you sure you want to delete ${order.id}?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setWorking(true);

            await deleteOrder(
                order.numericId
            );

            onNavigate('orders');
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : 'Failed to delete order.'
            );
        } finally {
            setWorking(false);
        }
    };


    /* ========================================================
       PERMISSIONS
       ======================================================== */

    const canApprove =
        userRole === 'admin' ||
        userRole === 'operations';

    const canDelete =
        userRole === 'admin' ||
        userRole === 'sales';


    /* ========================================================
       NEXT STEP
       ======================================================== */

    const nextStep =
        getNextStep(order.status);


    return (
        <div className="space-y-5">

            {/* ==================================================
                BACK
                ================================================== */}

            <button
                type="button"
                onClick={() =>
                    onNavigate('orders')
                }
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
                ← Back to Orders
            </button>


            {/* ==================================================
                MAIN HEADER CARD
                ================================================== */}

            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">

                <div className="flex items-start justify-between gap-4 flex-wrap">

                    <div>

                        <div className="flex items-center gap-2 flex-wrap">

                            <h1 className="text-2xl font-bold text-[#0f172a]">
                                {order.id}
                            </h1>

                            <StatusBadge
                                status={
                                    order.status
                                }
                            />

                            <PriorityBadge
                                priority={
                                    order.priority
                                }
                            />

                        </div>

                        <p className="text-sm text-[#64748b] mt-1">
                            {order.customer}
                            {' · '}
                            {order.garmentType}
                            {' · Qty '}
                            {order.quantity}
                        </p>

                    </div>


                    {/* ACTION BUTTONS */}

                    <div className="flex items-center gap-2 flex-wrap">

                        {canApprove &&
                            order.status ===
                            'pending' && (
                                <button
                                    type="button"
                                    disabled={
                                        working
                                    }
                                    onClick={() =>
                                        void changeStatus(
                                            'approved'
                                        )
                                    }
                                    className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    Approve Order
                                </button>
                            )}


                        {canApprove &&
                            order.status ===
                            'approved' && (
                                <button
                                    type="button"
                                    disabled={
                                        working
                                    }
                                    onClick={() =>
                                        void changeStatus(
                                            'in_production'
                                        )
                                    }
                                    className="px-4 py-2 text-sm font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
                                >
                                    Start Production
                                </button>
                            )}


                        {canApprove &&
                            order.status ===
                            'in_production' && (
                                <button
                                    type="button"
                                    disabled={
                                        working
                                    }
                                    onClick={() =>
                                        void changeStatus(
                                            'quality_check'
                                        )
                                    }
                                    className="px-4 py-2 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                >
                                    Send to QC
                                </button>
                            )}


                        {canApprove &&
                            order.status ===
                            'quality_check' && (
                                <button
                                    type="button"
                                    disabled={
                                        working
                                    }
                                    onClick={() =>
                                        void changeStatus(
                                            'ready'
                                        )
                                    }
                                    className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    Mark Ready
                                </button>
                            )}


                        {canApprove &&
                            order.status ===
                            'ready' && (
                                <button
                                    type="button"
                                    disabled={
                                        working
                                    }
                                    onClick={() =>
                                        void changeStatus(
                                            'delivered'
                                        )
                                    }
                                    className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                >
                                    Mark Delivered
                                </button>
                            )}


                        {canDelete && (
                            <button
                                type="button"
                                disabled={
                                    working
                                }
                                onClick={() =>
                                    void removeOrder()
                                }
                                className="px-4 py-2 text-sm font-semibold border border-red-200 text-red-600 bg-white rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                                Delete
                            </button>
                        )}

                    </div>

                </div>


                {/* ==================================================
                    PROGRESS
                    ================================================== */}

                <div className="mt-6 pt-5 border-t border-[#f1f5f9]">

                    <div className="flex items-center justify-between mb-2">

                        <span className="text-sm font-medium text-[#64748b]">
                            Overall Progress
                        </span>

                        <span className="text-sm font-semibold text-[#0f172a]">
                            {order.progress}%
                        </span>

                    </div>

                    <ProgressBar
                        value={
                            order.progress
                        }
                    />

                </div>

            </div>


            {/* ==================================================
                INFORMATION GRID
                ================================================== */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ORDER INFORMATION */}

                <InfoCard
                    title="Order Information"
                    icon="order"
                    rows={[
                        [
                            'Customer',
                            order.customer,
                        ],
                        [
                            'Order Date',
                            formatDate(
                                order.orderDate
                            ),
                        ],
                        [
                            'Delivery Date',
                            formatDate(
                                order.deliveryDate
                            ),
                        ],
                        [
                            'Priority',
                            formatStatus(
                                order.priority
                            ),
                        ],
                    ]}
                />


                {/* GARMENT DETAILS */}

                <InfoCard
                    title="Garment Details"
                    icon="garment"
                    rows={[
                        [
                            'Garment',
                            order.garmentType,
                        ],
                        [
                            'Fabric',
                            order.fabric ||
                            '-',
                        ],
                        [
                            'Color',
                            order.color ||
                            '-',
                        ],
                        [
                            'Size',
                            order.size ||
                            '-',
                        ],
                        [
                            'Quantity',
                            `${order.quantity.toLocaleString()} pcs`,
                        ],
                    ]}
                />


                {/* PRICING */}

                <InfoCard
                    title="Pricing"
                    icon="pricing"
                    rows={[
                        [
                            'Unit Price',
                            formatCurrency(
                                order.unitPrice
                            ),
                        ],
                        [
                            'Quantity',
                            order.quantity.toLocaleString(),
                        ],
                        [
                            'Total',
                            formatCurrency(
                                order.total
                            ),
                        ],
                    ]}
                />


                {/* WORKFLOW */}

                <InfoCard
                    title="Workflow"
                    icon="workflow"
                    rows={[
                        [
                            'Current Status',
                            STATUS_LABELS[
                                order.status
                                ],
                        ],
                        [
                            'Next Step',
                            nextStep,
                        ],
                    ]}
                />

            </div>

        </div>
    );
}


/* ============================================================
   INFO CARD
   ============================================================ */

function InfoCard({
                      title,
                      rows,
                      icon,
                  }: {
    title: string;
    rows: string[][];
    icon:
        | 'order'
        | 'garment'
        | 'pricing'
        | 'workflow';
}) {

    const iconClasses = {
        order:
            'bg-blue-50 text-blue-600',

        garment:
            'bg-green-50 text-green-600',

        pricing:
            'bg-amber-50 text-amber-600',

        workflow:
            'bg-purple-50 text-purple-600',
    };


    return (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">

            <div className="flex items-center gap-3 mb-5">

                <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        iconClasses[icon]
                    }`}
                >

                    {icon === 'pricing' ? (
                        <span className="text-sm font-bold">
                            Rs
                        </span>
                    ) : (
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d={
                                    icon === 'order'
                                        ? 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0'
                                        : icon === 'garment'
                                            ? 'M6 4l3 3h6l3-3 3 3-3 3v10H6V10L3 7l3-3z'
                                            : 'M4 19V5a1 1 0 011-1h14a1 1 0 011 1v14M8 9h8M8 13h8M8 17h5'
                                }
                            />
                        </svg>
                    )}

                </div>

                <h2 className="text-base font-semibold text-[#0f172a]">
                    {title}
                </h2>

            </div>


            <dl className="space-y-3.5">

                {rows.map(
                    ([label, value]) => (
                        <div
                            key={label}
                            className="flex items-center justify-between gap-4"
                        >

                            <dt className="text-sm text-[#94a3b8]">
                                {label}
                            </dt>

                            <dd className="text-sm font-medium text-[#334155] text-right">
                                {value}
                            </dd>

                        </div>
                    )
                )}

            </dl>

        </div>
    );
}


/* ============================================================
   NEXT STEP
   ============================================================ */

function getNextStep(
    status: OrderStatus
): string {
    switch (status) {

        case 'pending':
            return 'Operations approval';

        case 'approved':
            return 'Production start';

        case 'in_production':
            return 'Quality check';

        case 'quality_check':
            return 'Mark ready';

        case 'ready':
            return 'Delivery';

        case 'delivered':
            return 'Completed';

        case 'cancelled':
            return 'Cancelled';

        default:
            return '-';
    }
}


/* ============================================================
   MAIN ORDERS COMPONENT
   ============================================================ */

export default function Orders({
                                   view,
                                   selectedOrderId,
                                   onNavigate,
                                   userRole,
                               }: Props) {

    if (view === 'create') {
        return (
            <CreateOrder
                onNavigate={
                    onNavigate
                }
            />
        );
    }


    if (
        view === 'details' &&
        selectedOrderId
    ) {
        return (
            <OrderDetails
                orderId={
                    selectedOrderId
                }
                onNavigate={
                    onNavigate
                }
                userRole={
                    userRole
                }
            />
        );
    }


    return (
        <OrderList
            onNavigate={
                onNavigate
            }
            userRole={
                userRole
            }
        />
    );
}