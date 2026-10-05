import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import type { User } from '../types';

import { fetchAllOrders } from '../services/orderApi';
import { fetchAllInventory } from '../services/inventoryApi';
import { fetchAllProductionTasks } from '../services/productionApi';
import { fetchFinanceSummary } from '../services/financeApi';
import { fetchMarketingSummary } from '../services/marketingApi';
import { fetchAllDeliveries } from '../services/deliveryApi';


interface Props {
    user: User;

    onNavigate: (
        page: string,
        orderId?: string
    ) => void;
}


/* ============================================================
   ROLE LABELS
   ============================================================ */

const ROLE_LABELS: Record<User['role'], string> = {
    admin: 'Administrator',
    sales: 'Sales Executive',
    operations: 'Operations Manager',
    inventory: 'Inventory Officer',
    production: 'Production Supervisor',
    finance: 'Finance Officer',
    marketing: 'Marketing Manager',
    delivery: 'Delivery Officer',
};


/* ============================================================
   CHART COLORS
   ============================================================ */

const CHART_COLORS = [
    '#2563eb',
    '#16a34a',
    '#f59e0b',
    '#8b5cf6',
    '#ef4444',
    '#06b6d4',
    '#64748b',
];


/* ============================================================
   LKR FORMAT
   ============================================================ */

function formatLKR(value: number): string {
    if (!Number.isFinite(value)) {
        return 'LKR 0';
    }

    if (value >= 1_000_000) {
        return `LKR ${(value / 1_000_000).toFixed(1)}M`;
    }

    if (value >= 100_000) {
        return `LKR ${(value / 100_000).toFixed(1)}L`;
    }

    if (value >= 1_000) {
        return `LKR ${(value / 1_000).toFixed(0)}K`;
    }

    return `LKR ${Math.round(value).toLocaleString('en-LK')}`;
}


/* ============================================================
   KPI CARD
   ============================================================ */

function KpiCard({
                     label,
                     value,
                     sub,
                     icon,
                     tone = 'blue',
                 }: {
    label: string;
    value: string | number;
    sub?: string;
    icon: string;
    tone?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}) {
    const tones = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        red: 'bg-red-50 text-red-600',
        purple: 'bg-violet-50 text-violet-600',
    };

    return (
        <div
            className="
                bg-white
                rounded-2xl
                border
                border-slate-200
                p-5
                shadow-sm
                hover:shadow-md
                transition-shadow
            "
        >
            <div className="flex items-start justify-between">
                <div
                    className={`
                        w-11
                        h-11
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        ${tones[tone]}
                    `}
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
                            d={icon}
                        />
                    </svg>
                </div>

                {sub && (
                    <span className="text-xs font-medium text-slate-400">
                        {sub}
                    </span>
                )}
            </div>

            <div className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                {value}
            </div>

            <div className="text-sm text-slate-500 mt-1">
                {label}
            </div>
        </div>
    );
}


/* ============================================================
   STATUS BADGE
   ============================================================ */

function StatusBadge({
                         status,
                     }: {
    status: string;
}) {
    const normalized = status.toLowerCase();

    const classes =
        normalized.includes('delivered') ||
        normalized === 'ready' ||
        normalized === 'paid' ||
        normalized === 'active'
            ? 'bg-emerald-50 text-emerald-700'
            : normalized.includes('cancel') ||
            normalized.includes('overdue') ||
            normalized.includes('failed')
                ? 'bg-red-50 text-red-700'
                : normalized.includes('production') ||
                normalized.includes('pending') ||
                normalized.includes('scheduled')
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-blue-50 text-blue-700';

    return (
        <span
            className={`
                inline-flex
                px-2.5
                py-1
                rounded-full
                text-xs
                font-semibold
                ${classes}
            `}
        >
            {status.replace(/_/g, ' ')}
        </span>
    );
}


/* ============================================================
   EMPTY GRAPH
   ============================================================ */

function GraphEmpty({
                        message,
                    }: {
    message: string;
}) {
    return (
        <div
            className="
                min-h-[250px]
                flex
                items-center
                justify-center
                text-sm
                text-slate-400
                text-center
            "
        >
            {message}
        </div>
    );
}


/* ============================================================
   DASHBOARD
   ============================================================ */

export default function Dashboard({
                                      user,
                                      onNavigate,
                                  }: Props) {

    /* ========================================================
       LIVE DATABASE STATE
       ======================================================== */

    const [orders, setOrders] = useState<
        Array<
            Awaited<
                ReturnType<typeof fetchAllOrders>
            >[number]
        >
    >([]);

    const [inventoryItems, setInventoryItems] = useState<
        Array<
            Awaited<
                ReturnType<typeof fetchAllInventory>
            >[number]
        >
    >([]);

    const [productionTasks, setProductionTasks] = useState<
        Array<
            Awaited<
                ReturnType<typeof fetchAllProductionTasks>
            >[number]
        >
    >([]);

    const [deliveries, setDeliveries] = useState<
        Array<
            Awaited<
                ReturnType<typeof fetchAllDeliveries>
            >[number]
        >
    >([]);

    const [finance, setFinance] = useState({
        totalRevenue: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        invoiceCount: 0,
    });

    const [marketing, setMarketing] = useState({
        activeCampaigns: 0,
        scheduledCampaigns: 0,
        ordersUsed: 0,
        promoRevenue: 0,
        totalCampaigns: 0,
    });

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');


    /* ========================================================
       LOAD DATABASE DATA
       ======================================================== */

    const load = async () => {
        setLoading(true);
        setError('');

        const tasks: Promise<void>[] = [];

        const canOrders = [
            'admin',
            'sales',
            'operations',
        ].includes(user.role);

        const canInventory = [
            'admin',
            'inventory',
            'production',
        ].includes(user.role);

        const canProduction = [
            'admin',
            'operations',
            'production',
        ].includes(user.role);

        const canFinance = [
            'admin',
            'finance',
        ].includes(user.role);

        const canMarketing = [
            'admin',
            'marketing',
        ].includes(user.role);

        const canDelivery = [
            'admin',
            'operations',
            'delivery',
        ].includes(user.role);


        if (canOrders) {
            tasks.push(
                fetchAllOrders().then((data) => {
                    setOrders(data);
                })
            );
        }


        if (canInventory) {
            tasks.push(
                fetchAllInventory().then((data) => {
                    setInventoryItems(data);
                })
            );
        }


        if (canProduction) {
            tasks.push(
                fetchAllProductionTasks().then((data) => {
                    setProductionTasks(data);
                })
            );
        }


        if (canFinance) {
            tasks.push(
                fetchFinanceSummary().then((data) => {
                    setFinance(data);
                })
            );
        }


        if (canMarketing) {
            tasks.push(
                fetchMarketingSummary().then((data) => {
                    setMarketing(data);
                })
            );
        }


        if (canDelivery) {
            tasks.push(
                fetchAllDeliveries().then((data) => {
                    setDeliveries(data);
                })
            );
        }


        const results = await Promise.allSettled(tasks);

        if (
            results.some(
                (result) => result.status === 'rejected'
            )
        ) {
            setError(
                'Some dashboard data could not be loaded from the database. Check the backend and your role permissions.'
            );
        }

        setLoading(false);
    };


    useEffect(() => {
        void load();
    }, [user.role]);


    /* ========================================================
       ORDER KPIs
       ======================================================== */

    const totalOrders = orders.length;

    const pendingOrders = useMemo(
        () =>
            orders.filter(
                (order) =>
                    order.status === 'pending'
            ).length,
        [orders]
    );

    const approvedOrders = useMemo(
        () =>
            orders.filter(
                (order) =>
                    order.status === 'approved'
            ).length,
        [orders]
    );

    const inProductionOrders = useMemo(
        () =>
            orders.filter(
                (order) =>
                    order.status === 'in_production'
            ).length,
        [orders]
    );

    const qualityCheckOrders = useMemo(
        () =>
            orders.filter(
                (order) =>
                    order.status === 'quality_check'
            ).length,
        [orders]
    );

    const readyOrders = useMemo(
        () =>
            orders.filter(
                (order) =>
                    order.status === 'ready'
            ).length,
        [orders]
    );

    const deliveredOrders = useMemo(
        () =>
            orders.filter(
                (order) =>
                    order.status === 'delivered'
            ).length,
        [orders]
    );


    /* ========================================================
       RECENT ORDERS
       ======================================================== */

    const recentOrders = useMemo(
        () =>
            [...orders]
                .sort((first, second) => {
                    const firstId = Number(
                        (
                            first as {
                                numericId?: number;
                            }
                        ).numericId ?? 0
                    );

                    const secondId = Number(
                        (
                            second as {
                                numericId?: number;
                            }
                        ).numericId ?? 0
                    );

                    return secondId - firstId;
                })
                .slice(0, 5),
        [orders]
    );


    /* ========================================================
       ORDER STATUS GRAPH
       ======================================================== */

    const orderStatusData = useMemo(() => {
        const statusMap = new Map<string, number>();

        orders.forEach((order) => {
            const status = order.status.replace(/_/g, ' ');

            statusMap.set(
                status,
                (statusMap.get(status) || 0) + 1
            );
        });

        return Array.from(statusMap.entries()).map(
            ([name, value]) => ({
                name,
                value,
            })
        );
    }, [orders]);


    /* ========================================================
       GARMENT CATEGORY GRAPH
       ======================================================== */

    const garmentCategoryData = useMemo(() => {
        const categoryMap = new Map<string, number>();

        orders.forEach((order) => {
            const garment =
                order.garmentType || 'Unknown';

            const current =
                categoryMap.get(garment) || 0;

            categoryMap.set(
                garment,
                current +
                Number(order.quantity || 0)
            );
        });

        return Array.from(categoryMap.entries())
            .map(([category, quantity]) => ({
                category,
                quantity,
            }))
            .sort(
                (first, second) =>
                    second.quantity -
                    first.quantity
            )
            .slice(0, 6);
    }, [orders]);


    /* ========================================================
       REVENUE TREND
       ======================================================== */

    const revenueTrendData = useMemo(() => {
        const monthMap = new Map<
            string,
            {
                sortKey: number;
                month: string;
                revenue: number;
            }
        >();

        orders.forEach((order) => {
            const date = new Date(
                order.orderDate
            );

            if (Number.isNaN(date.getTime())) {
                return;
            }

            const year = date.getFullYear();
            const month = date.getMonth();

            const key =
                `${year}-${String(
                    month + 1
                ).padStart(2, '0')}`;

            const label =
                date.toLocaleDateString(
                    'en-US',
                    {
                        month: 'short',
                        year: 'numeric',
                    }
                );

            const existing =
                monthMap.get(key);

            monthMap.set(key, {
                sortKey:
                    year * 100 + month,
                month: label,
                revenue:
                    (existing?.revenue || 0) +
                    Number(order.total || 0),
            });
        });

        return Array.from(monthMap.values())
            .sort(
                (first, second) =>
                    first.sortKey -
                    second.sortKey
            )
            .map((item) => ({
                month: item.month,
                revenue: item.revenue,
            }));
    }, [orders]);


    /* ========================================================
       INVENTORY STATUS
       ======================================================== */

    const inventoryStatusData = useMemo(() => {
        const statusMap = new Map<string, number>();

        inventoryItems.forEach((item) => {
            const status =
                item.status.replace(
                    /_/g,
                    ' '
                );

            statusMap.set(
                status,
                (statusMap.get(status) || 0) + 1
            );
        });

        return Array.from(statusMap.entries()).map(
            ([name, value]) => ({
                name,
                value,
            })
        );
    }, [inventoryItems]);


    /* ========================================================
       PRODUCTION PIPELINE
       ======================================================== */

    const productionStageData = useMemo(() => {
        const stageMap = new Map<string, number>();

        productionTasks.forEach((task) => {
            const stage =
                task.stage.replace(
                    /_/g,
                    ' '
                );

            stageMap.set(
                stage,
                (stageMap.get(stage) || 0) + 1
            );
        });

        return Array.from(stageMap.entries()).map(
            ([stage, count]) => ({
                stage,
                count,
            })
        );
    }, [productionTasks]);


    /* ========================================================
       DELIVERY STATUS
       ======================================================== */

    const deliveryStatusData = useMemo(() => {
        const statusMap = new Map<string, number>();

        deliveries.forEach((delivery) => {
            const status =
                delivery.status.replace(
                    /_/g,
                    ' '
                );

            statusMap.set(
                status,
                (statusMap.get(status) || 0) + 1
            );
        });

        return Array.from(statusMap.entries()).map(
            ([name, value]) => ({
                name,
                value,
            })
        );
    }, [deliveries]);


    /* ========================================================
       INVENTORY KPIs
       ======================================================== */

    const inventoryCount =
        inventoryItems.length;

    const lowStock =
        inventoryItems.filter(
            (item) =>
                item.status !== 'in_stock'
        ).length;

    const outOfStock =
        inventoryItems.filter(
            (item) =>
                item.status === 'out_of_stock'
        ).length;


    /* ========================================================
       PRODUCTION KPIs
       ======================================================== */

    const productionCount =
        productionTasks.length;

    const productionInProgress =
        productionTasks.filter(
            (task) =>
                Number(task.progress || 0) > 0 &&
                Number(task.progress || 0) < 100
        ).length;

    const productionCompleted =
        productionTasks.filter(
            (task) =>
                Number(task.progress || 0) >= 100
        ).length;


    /* ========================================================
       DELIVERY KPIs
       ======================================================== */

    const deliveryCount =
        deliveries.length;

    const deliveredCount =
        deliveries.filter(
            (delivery) =>
                delivery.status === 'delivered'
        ).length;

    const pendingDeliveryCount =
        deliveries.filter(
            (delivery) =>
                delivery.status !== 'delivered' &&
                delivery.status !== 'cancelled'
        ).length;


    /* ========================================================
       FINANCE
       ======================================================== */

    const totalRevenue =
        Number(
            finance.totalRevenue || 0
        );

    const pendingRevenue =
        Number(
            finance.pending || 0
        );

    const overdueRevenue =
        Number(
            finance.overdue || 0
        );


    /* ========================================================
       MARKETING
       ======================================================== */

    const activeCampaigns =
        Number(
            marketing.activeCampaigns || 0
        );


    /* ========================================================
       GRAPH HELPERS
       ======================================================== */

    const maxRevenue =
        Math.max(
            ...revenueTrendData.map(
                (item) => item.revenue
            ),
            0
        );

    const maxGarmentQuantity =
        Math.max(
            ...garmentCategoryData.map(
                (item) => item.quantity
            ),
            0
        );

    const maxProductionCount =
        Math.max(
            ...productionStageData.map(
                (item) => item.count
            ),
            0
        );


    /* ========================================================
       REAL ORDER STATUS DONUT
       ======================================================== */

    const orderStatusGradient = useMemo(() => {
        if (!orderStatusData.length) {
            return '#e2e8f0 0deg 360deg';
        }

        const total =
            orderStatusData.reduce(
                (sum, item) =>
                    sum + item.value,
                0
            );

        let currentDegree = 0;

        const segments = orderStatusData.map(
            (item, index) => {
                const start =
                    currentDegree;

                const degree =
                    (item.value / total) *
                    360;

                currentDegree += degree;

                return `${
                    CHART_COLORS[
                    index %
                    CHART_COLORS.length
                        ]
                } ${start}deg ${currentDegree}deg`;
            }
        );

        return segments.join(', ');
    }, [orderStatusData]);


    /* ========================================================
       DASHBOARD
       ======================================================== */

    return (
        <div
            className="
                min-h-full
                bg-[#f1f5f9]
                -mx-6
                -my-6
                p-6
            "
        >

            {/* ==================================================
               HEADER
               ================================================== */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    flex-wrap
                    mb-7
                "
            >
                <div>
                    <h1
                        className="
                            text-3xl
                            font-bold
                            tracking-tight
                            text-[#172033]
                        "
                    >
                        {user.role === 'admin'
                            ? 'Admin Dashboard'
                            : `${ROLE_LABELS[user.role]} Dashboard`}
                    </h1>

                    <p
                        className="
                            text-sm
                            text-[#718096]
                            mt-1
                        "
                    >
                        Company-wide performance
                        overview from live
                        database records
                    </p>
                </div>

                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >
                    <button
                        onClick={() => void load()}
                        className="
                            px-4
                            py-2.5
                            bg-white
                            border
                            border-[#dbe3ee]
                            rounded-xl
                            text-sm
                            font-semibold
                            text-[#475569]
                            shadow-sm
                            hover:bg-[#f8fafc]
                            transition
                        "
                    >
                        ↻ Refresh
                    </button>

                    {[
                        'admin',
                        'sales',
                    ].includes(user.role) && (
                        <button
                            onClick={() =>
                                onNavigate(
                                    'order-create'
                                )
                            }
                            className="
                                px-5
                                py-2.5
                                bg-blue-600
                                text-white
                                rounded-xl
                                text-sm
                                font-semibold
                                shadow-sm
                                hover:bg-blue-700
                                transition
                            "
                        >
                            + New Order
                        </button>
                    )}
                </div>
            </div>


            {/* ==================================================
               ERROR
               ================================================== */}

            {error && (
                <div
                    className="
                        mb-6
                        bg-amber-50
                        border
                        border-amber-200
                        text-amber-800
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                    "
                >
                    {error}
                </div>
            )}


            {/* ==================================================
               LOADING
               ================================================== */}

            {loading ? (
                <div
                    className="
                        bg-white
                        border
                        border-[#e2e8f0]
                        rounded-2xl
                        p-16
                        text-center
                        text-[#64748b]
                        shadow-sm
                    "
                >
                    Loading live dashboard
                    data...
                </div>
            ) : (
                <>

                    {/* ==================================================
                       KPI CARDS
                       ================================================== */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            xl:grid-cols-4
                            gap-5
                            mb-6
                        "
                    >

                        {[
                            'admin',
                            'sales',
                            'operations',
                        ].includes(user.role) && (
                            <>
                                <KpiCard
                                    label="Total Orders"
                                    value={totalOrders}
                                    sub="Live"
                                    tone="blue"
                                    icon="
                                        M9 5H7a2 2 0 00-2 2v12
                                        a2 2 0 002 2h10a2 2 0
                                        002-2V7a2 2 0 00-2-2h-2
                                    "
                                />

                                <KpiCard
                                    label="Pending Orders"
                                    value={pendingOrders}
                                    sub="Orders"
                                    tone="amber"
                                    icon="
                                        M12 8v4l3 3
                                        m6-3a9 9 0 11-18 0
                                    "
                                />

                                <KpiCard
                                    label="In Production"
                                    value={inProductionOrders}
                                    sub="Active"
                                    tone="purple"
                                    icon="
                                        M4 6h16
                                        M4 12h16
                                        M4 18h16
                                    "
                                />

                                <KpiCard
                                    label="Ready for Delivery"
                                    value={readyOrders}
                                    sub="Orders"
                                    tone="green"
                                    icon="
                                        M5 8h14
                                        M5 8a2 2 0 110-4h14
                                        a2 2 0 110 4
                                        M5 8v10a2 2 0 002 2
                                        h10a2 2 0 002-2V8
                                    "
                                />
                            </>
                        )}


                        {[
                            'admin',
                            'inventory',
                            'production',
                        ].includes(user.role) && (
                            <>
                                <KpiCard
                                    label="Inventory Items"
                                    value={inventoryCount}
                                    sub="Materials"
                                    tone="blue"
                                    icon="
                                        M20 7l-8-4-8 4
                                        m16 0l-8 4m8-4v10
                                        l-8 4m0-10L4 7m8 4v10
                                    "
                                />

                                <KpiCard
                                    label="Low / Out of Stock"
                                    value={lowStock}
                                    sub="Inventory"
                                    tone="red"
                                    icon="
                                        M12 9v2
                                        m0 4h.01
                                        m-6.9 4h13.8
                                        c1.5 0 2.5-1.7
                                        1.7-3L13.7 4
                                        c-.8-1.3-2.6-1.3-3.4 0
                                        L3.3 16c-.8 1.3.2 3 1.7 3z
                                    "
                                />
                            </>
                        )}


                        {[
                            'admin',
                            'operations',
                            'production',
                        ].includes(user.role) && (
                            <KpiCard
                                label="Production Tasks"
                                value={productionCount}
                                sub="Tasks"
                                tone="purple"
                                icon="
                                    M4 6h16
                                    M4 12h16
                                    M4 18h16
                                "
                            />
                        )}


                        {[
                            'admin',
                            'operations',
                            'delivery',
                        ].includes(user.role) && (
                            <KpiCard
                                label="Deliveries"
                                value={deliveryCount}
                                sub="Shipments"
                                tone="green"
                                icon="
                                    M3 7h11v10H3z
                                    M14 10h4l3 3v4h-7z
                                "
                            />
                        )}


                        {[
                            'admin',
                            'finance',
                        ].includes(user.role) && (
                            <>
                                <KpiCard
                                    label="Total Revenue"
                                    value={formatLKR(totalRevenue)}
                                    sub="Finance"
                                    tone="green"
                                    icon="
                                        M12 8c-1.7 0-3 .9-3 2
                                        s1.3 2 3 2 3 .9 3 2
                                        -1.3 2-3 2
                                        m0-8V7
                                        m0 1v8
                                    "
                                />

                                <KpiCard
                                    label="Outstanding"
                                    value={formatLKR(
                                        pendingRevenue +
                                        overdueRevenue
                                    )}
                                    sub="Finance"
                                    tone="red"
                                    icon="
                                        M12 9v2
                                        m0 4h.01
                                        m-6.9 4h13.8
                                        c1.5 0 2.5-1.7
                                        1.7-3L13.7 4
                                        c-.8-1.3-2.6-1.3-3.4 0
                                        L3.3 16c-.8 1.3.2 3 1.7 3z
                                    "
                                />
                            </>
                        )}


                        {[
                            'admin',
                            'marketing',
                        ].includes(user.role) && (
                            <>
                                <KpiCard
                                    label="Active Campaigns"
                                    value={activeCampaigns}
                                    sub="Marketing"
                                    tone="purple"
                                    icon="
                                        M3 11l18-5v12L3 14v-3z
                                    "
                                />

                                <KpiCard
                                    label="Promo Revenue"
                                    value={formatLKR(
                                        marketing.promoRevenue
                                    )}
                                    sub="Campaigns"
                                    tone="amber"
                                    icon="
                                        M12 8c-1.7 0-3 .9-3 2
                                        s1.3 2 3 2 3 .9 3 2
                                        -1.3 2-3 2
                                    "
                                />
                            </>
                        )}

                    </div>


                    {/* ==================================================
                       REVENUE + ORDER STATUS
                       ================================================== */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            xl:grid-cols-3
                            gap-5
                            mb-6
                        "
                    >

                        {[
                            'admin',
                            'finance',
                            'operations',
                        ].includes(user.role) && (
                            <div
                                className="
                                    xl:col-span-2
                                    bg-white
                                    rounded-2xl
                                    border
                                    border-[#e2e8f0]
                                    shadow-sm
                                    p-6
                                "
                            >
                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        mb-5
                                    "
                                >
                                    <div>
                                        <h2
                                            className="
                                                text-lg
                                                font-bold
                                                text-[#172033]
                                            "
                                        >
                                            Revenue Trend
                                        </h2>

                                        <p
                                            className="
                                                text-xs
                                                text-[#94a3b8]
                                                mt-1
                                            "
                                        >
                                            Monthly revenue calculated
                                            from live order records
                                        </p>
                                    </div>

                                    <div
                                        className="
                                            px-3
                                            py-1.5
                                            bg-blue-50
                                            text-blue-700
                                            rounded-full
                                            text-xs
                                            font-semibold
                                        "
                                    >
                                        LKR
                                    </div>
                                </div>

                                {revenueTrendData.length > 0 ? (
                                    <div className="h-[300px]">
                                        <div
                                            className="
                                                h-full
                                                flex
                                                items-end
                                                gap-3
                                                border-b
                                                border-slate-200
                                                pb-8
                                            "
                                        >
                                            {revenueTrendData.map(
                                                (item) => {
                                                    const height =
                                                        maxRevenue > 0
                                                            ? Math.max(
                                                                (
                                                                    item.revenue /
                                                                    maxRevenue
                                                                ) * 230,
                                                                8
                                                            )
                                                            : 0;

                                                    return (
                                                        <div
                                                            key={item.month}
                                                            className="
                                                                flex-1
                                                                h-full
                                                                flex
                                                                flex-col
                                                                justify-end
                                                                items-center
                                                                min-w-0
                                                            "
                                                        >
                                                            <div
                                                                className="
                                                                    text-[10px]
                                                                    font-semibold
                                                                    text-slate-500
                                                                    mb-1
                                                                    truncate
                                                                    max-w-full
                                                                "
                                                            >
                                                                {formatLKR(
                                                                    item.revenue
                                                                )}
                                                            </div>

                                                            <div
                                                                className="
                                                                    w-full
                                                                    max-w-[52px]
                                                                    bg-blue-500
                                                                    rounded-t-lg
                                                                    hover:bg-blue-600
                                                                    transition-all
                                                                "
                                                                style={{
                                                                    height:
                                                                        `${height}px`,
                                                                }}
                                                                title={`${item.month}: ${formatLKR(
                                                                    item.revenue
                                                                )}`}
                                                            />

                                                            <div
                                                                className="
                                                                    mt-2
                                                                    text-[10px]
                                                                    text-slate-400
                                                                    truncate
                                                                    max-w-full
                                                                "
                                                            >
                                                                {item.month}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <GraphEmpty
                                        message="
                                            No revenue data is available
                                            from the database.
                                        "
                                    />
                                )}
                            </div>
                        )}


                        {[
                            'admin',
                            'sales',
                            'operations',
                        ].includes(user.role) && (
                            <div
                                className="
                                    bg-white
                                    rounded-2xl
                                    border
                                    border-[#e2e8f0]
                                    shadow-sm
                                    p-6
                                "
                            >
                                <div className="mb-5">
                                    <h2
                                        className="
                                            text-lg
                                            font-bold
                                            text-[#172033]
                                        "
                                    >
                                        Order Status
                                    </h2>

                                    <p
                                        className="
                                            text-xs
                                            text-[#94a3b8]
                                            mt-1
                                        "
                                    >
                                        Distribution by
                                        current stage
                                    </p>
                                </div>

                                {orderStatusData.length > 0 ? (
                                    <>
                                        <div className="flex justify-center">
                                            <div
                                                className="
                                                    w-48
                                                    h-48
                                                    rounded-full
                                                    flex
                                                    items-center
                                                    justify-center
                                                "
                                                style={{
                                                    background:
                                                        `conic-gradient(${orderStatusGradient})`,
                                                }}
                                            >
                                                <div
                                                    className="
                                                        w-28
                                                        h-28
                                                        rounded-full
                                                        bg-white
                                                        flex
                                                        items-center
                                                        justify-center
                                                        text-center
                                                        shadow-inner
                                                    "
                                                >
                                                    <div>
                                                        <div
                                                            className="
                                                                text-2xl
                                                                font-bold
                                                                text-slate-800
                                                            "
                                                        >
                                                            {totalOrders}
                                                        </div>

                                                        <div
                                                            className="
                                                                text-[10px]
                                                                text-slate-400
                                                            "
                                                        >
                                                            Orders
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-2">
                                            {orderStatusData.map(
                                                (item, index) => (
                                                    <div
                                                        key={item.name}
                                                        className="
                                                            flex
                                                            items-center
                                                            justify-between
                                                            text-xs
                                                        "
                                                    >
                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-2
                                                            "
                                                        >
                                                            <span
                                                                className="
                                                                    w-2.5
                                                                    h-2.5
                                                                    rounded-full
                                                                "
                                                                style={{
                                                                    background:
                                                                        CHART_COLORS[
                                                                        index %
                                                                        CHART_COLORS.length
                                                                            ],
                                                                }}
                                                            />

                                                            <span
                                                                className="
                                                                    capitalize
                                                                    text-slate-500
                                                                "
                                                            >
                                                                {item.name}
                                                            </span>
                                                        </div>

                                                        <span
                                                            className="
                                                                font-semibold
                                                                text-slate-700
                                                            "
                                                        >
                                                            {item.value}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <GraphEmpty
                                        message="
                                            No order status data
                                            is available.
                                        "
                                    />
                                )}
                            </div>
                        )}
                    </div>


                    {/* ==================================================
                       GARMENT + PRODUCTION
                       ================================================== */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            xl:grid-cols-2
                            gap-5
                            mb-6
                        "
                    >

                        {[
                            'admin',
                            'sales',
                            'operations',
                        ].includes(user.role) && (
                            <div
                                className="
                                    bg-white
                                    rounded-2xl
                                    border
                                    border-[#e2e8f0]
                                    shadow-sm
                                    p-6
                                "
                            >
                                <div className="mb-5">
                                    <h2
                                        className="
                                            text-lg
                                            font-bold
                                            text-[#172033]
                                        "
                                    >
                                        Top Garment Categories
                                    </h2>

                                    <p
                                        className="
                                            text-xs
                                            text-[#94a3b8]
                                            mt-1
                                        "
                                    >
                                        Based on actual ordered
                                        quantities
                                    </p>
                                </div>

                                {garmentCategoryData.length > 0 ? (
                                    <div className="space-y-4">
                                        {garmentCategoryData.map(
                                            (item) => {
                                                const width =
                                                    maxGarmentQuantity > 0
                                                        ? (
                                                        item.quantity /
                                                        maxGarmentQuantity
                                                    ) * 100
                                                        : 0;

                                                return (
                                                    <div
                                                        key={item.category}
                                                    >
                                                        <div
                                                            className="
                                                                flex
                                                                justify-between
                                                                items-center
                                                                mb-1.5
                                                            "
                                                        >
                                                            <span
                                                                className="
                                                                    text-sm
                                                                    font-medium
                                                                    text-slate-600
                                                                "
                                                            >
                                                                {item.category}
                                                            </span>

                                                            <span
                                                                className="
                                                                    text-xs
                                                                    font-semibold
                                                                    text-slate-500
                                                                "
                                                            >
                                                                {item.quantity}
                                                                {' '}
                                                                units
                                                            </span>
                                                        </div>

                                                        <div
                                                            className="
                                                                h-3
                                                                bg-slate-100
                                                                rounded-full
                                                                overflow-hidden
                                                            "
                                                        >
                                                            <div
                                                                className="
                                                                    h-full
                                                                    bg-blue-500
                                                                    rounded-full
                                                                    transition-all
                                                                "
                                                                style={{
                                                                    width:
                                                                        `${width}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                ) : (
                                    <GraphEmpty
                                        message="
                                            No garment category
                                            data is available.
                                        "
                                    />
                                )}
                            </div>
                        )}


                        {[
                            'admin',
                            'operations',
                            'production',
                        ].includes(user.role) && (
                            <div
                                className="
                                    bg-white
                                    rounded-2xl
                                    border
                                    border-[#e2e8f0]
                                    shadow-sm
                                    p-6
                                "
                            >
                                <div className="mb-5">
                                    <h2
                                        className="
                                            text-lg
                                            font-bold
                                            text-[#172033]
                                        "
                                    >
                                        Production Pipeline
                                    </h2>

                                    <p
                                        className="
                                            text-xs
                                            text-[#94a3b8]
                                            mt-1
                                        "
                                    >
                                        Current production
                                        tasks by stage
                                    </p>
                                </div>

                                {productionStageData.length > 0 ? (
                                    <div
                                        className="
                                            grid
                                            grid-cols-2
                                            gap-4
                                        "
                                    >
                                        {productionStageData.map(
                                            (item) => {
                                                const width =
                                                    maxProductionCount > 0
                                                        ? (
                                                        item.count /
                                                        maxProductionCount
                                                    ) * 100
                                                        : 0;

                                                return (
                                                    <div
                                                        key={item.stage}
                                                        className="
                                                            border
                                                            border-slate-100
                                                            rounded-xl
                                                            p-4
                                                        "
                                                    >
                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                justify-between
                                                                gap-2
                                                            "
                                                        >
                                                            <span
                                                                className="
                                                                    text-sm
                                                                    capitalize
                                                                    text-slate-600
                                                                    truncate
                                                                "
                                                            >
                                                                {item.stage}
                                                            </span>

                                                            <span
                                                                className="
                                                                    text-lg
                                                                    font-bold
                                                                    text-slate-800
                                                                "
                                                            >
                                                                {item.count}
                                                            </span>
                                                        </div>

                                                        <div
                                                            className="
                                                                mt-3
                                                                h-2
                                                                bg-slate-100
                                                                rounded-full
                                                                overflow-hidden
                                                            "
                                                        >
                                                            <div
                                                                className="
                                                                    h-full
                                                                    rounded-full
                                                                    bg-violet-500
                                                                "
                                                                style={{
                                                                    width:
                                                                        `${width}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                ) : (
                                    <GraphEmpty
                                        message="
                                            No production data
                                            is available.
                                        "
                                    />
                                )}
                            </div>
                        )}
                    </div>


                    {/* ==================================================
                       INVENTORY + DELIVERY
                       ================================================== */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            xl:grid-cols-2
                            gap-5
                            mb-6
                        "
                    >

                        {[
                            'admin',
                            'inventory',
                            'production',
                        ].includes(user.role) && (
                            <div
                                className="
                                    bg-white
                                    rounded-2xl
                                    border
                                    border-[#e2e8f0]
                                    shadow-sm
                                    p-6
                                "
                            >
                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        mb-5
                                    "
                                >
                                    <div>
                                        <h2
                                            className="
                                                text-lg
                                                font-bold
                                                text-[#172033]
                                            "
                                        >
                                            Inventory Overview
                                        </h2>

                                        <p
                                            className="
                                                text-xs
                                                text-[#94a3b8]
                                                mt-1
                                            "
                                        >
                                            Live stock condition
                                        </p>
                                    </div>

                                    <span
                                        className="
                                            px-3
                                            py-1
                                            rounded-full
                                            bg-blue-50
                                            text-blue-700
                                            text-xs
                                            font-semibold
                                        "
                                    >
                                        {inventoryCount} Items
                                    </span>
                                </div>

                                {inventoryStatusData.length > 0 ? (
                                    <div className="space-y-3">
                                        {inventoryStatusData.map(
                                            (item, index) => (
                                                <div
                                                    key={item.name}
                                                    className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        p-3
                                                        bg-slate-50
                                                        rounded-xl
                                                    "
                                                >
                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                        "
                                                    >
                                                        <span
                                                            className="
                                                                w-3
                                                                h-3
                                                                rounded-full
                                                            "
                                                            style={{
                                                                background:
                                                                    CHART_COLORS[
                                                                    index %
                                                                    CHART_COLORS.length
                                                                        ],
                                                            }}
                                                        />

                                                        <span
                                                            className="
                                                                text-sm
                                                                capitalize
                                                                text-slate-600
                                                            "
                                                        >
                                                            {item.name}
                                                        </span>
                                                    </div>

                                                    <span
                                                        className="
                                                            font-bold
                                                            text-slate-800
                                                        "
                                                    >
                                                        {item.value}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <GraphEmpty
                                        message="
                                            No inventory status
                                            data is available.
                                        "
                                    />
                                )}
                            </div>
                        )}


                        {[
                            'admin',
                            'operations',
                            'delivery',
                        ].includes(user.role) && (
                            <div
                                className="
                                    bg-white
                                    rounded-2xl
                                    border
                                    border-[#e2e8f0]
                                    shadow-sm
                                    p-6
                                "
                            >
                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        mb-5
                                    "
                                >
                                    <div>
                                        <h2
                                            className="
                                                text-lg
                                                font-bold
                                                text-[#172033]
                                            "
                                        >
                                            Delivery Overview
                                        </h2>

                                        <p
                                            className="
                                                text-xs
                                                text-[#94a3b8]
                                                mt-1
                                            "
                                        >
                                            Current delivery
                                            status
                                        </p>
                                    </div>

                                    <span
                                        className="
                                            px-3
                                            py-1
                                            rounded-full
                                            bg-emerald-50
                                            text-emerald-700
                                            text-xs
                                            font-semibold
                                        "
                                    >
                                        {deliveredCount} Delivered
                                    </span>
                                </div>

                                {deliveryStatusData.length > 0 ? (
                                    <div className="space-y-3">
                                        {deliveryStatusData.map(
                                            (item, index) => (
                                                <div
                                                    key={item.name}
                                                    className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        p-3
                                                        bg-slate-50
                                                        rounded-xl
                                                    "
                                                >
                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                        "
                                                    >
                                                        <span
                                                            className="
                                                                w-3
                                                                h-3
                                                                rounded-full
                                                            "
                                                            style={{
                                                                background:
                                                                    CHART_COLORS[
                                                                    index %
                                                                    CHART_COLORS.length
                                                                        ],
                                                            }}
                                                        />

                                                        <span
                                                            className="
                                                                text-sm
                                                                capitalize
                                                                text-slate-600
                                                            "
                                                        >
                                                            {item.name}
                                                        </span>
                                                    </div>

                                                    <span
                                                        className="
                                                            font-bold
                                                            text-slate-800
                                                        "
                                                    >
                                                        {item.value}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <GraphEmpty
                                        message="
                                            No delivery data
                                            is available.
                                        "
                                    />
                                )}
                            </div>
                        )}
                    </div>


                    {/* ==================================================
                       RECENT ORDERS
                       ================================================== */}

                    {recentOrders.length > 0 ? (
                        <div
                            className="
                                bg-white
                                rounded-2xl
                                border
                                border-[#e2e8f0]
                                overflow-hidden
                                shadow-sm
                            "
                        >
                            <div
                                className="
                                    p-6
                                    flex
                                    items-center
                                    justify-between
                                    border-b
                                    border-[#eef2f7]
                                "
                            >
                                <div>
                                    <h2
                                        className="
                                            font-semibold
                                            text-lg
                                            text-[#172033]
                                        "
                                    >
                                        Recent Orders
                                    </h2>

                                    <p
                                        className="
                                            text-xs
                                            text-[#94a3b8]
                                            mt-1
                                        "
                                    >
                                        Latest records from
                                        the database
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        onNavigate('orders')
                                    }
                                    className="
                                        text-sm
                                        font-semibold
                                        text-blue-600
                                        hover:text-blue-700
                                        hover:underline
                                    "
                                >
                                    View all
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#f8fafc]">
                                    <tr>
                                        {[
                                            'Order',
                                            'Customer',
                                            'Garment',
                                            'Qty',
                                            'Status',
                                            'Amount',
                                        ].map(
                                            (heading) => (
                                                <th
                                                    key={heading}
                                                    className="
                                                            text-left
                                                            px-5
                                                            py-3
                                                            text-[11px]
                                                            font-semibold
                                                            uppercase
                                                            tracking-wider
                                                            text-[#64748b]
                                                        "
                                                >
                                                    {heading}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {recentOrders.map(
                                        (order) => (
                                            <tr
                                                key={order.id}
                                                className="
                                                        border-t
                                                        border-[#eef2f7]
                                                        hover:bg-[#f8fafc]
                                                        cursor-pointer
                                                        transition-colors
                                                    "
                                                onClick={() =>
                                                    onNavigate(
                                                        'order-details',
                                                        order.id
                                                    )
                                                }
                                            >
                                                <td
                                                    className="
                                                            px-5
                                                            py-4
                                                            font-semibold
                                                            text-blue-600
                                                        "
                                                >
                                                    {order.id}
                                                </td>

                                                <td
                                                    className="
                                                            px-5
                                                            py-4
                                                            text-slate-700
                                                        "
                                                >
                                                    {order.customer}
                                                </td>

                                                <td
                                                    className="
                                                            px-5
                                                            py-4
                                                            text-slate-600
                                                        "
                                                >
                                                    {order.garmentType}
                                                </td>

                                                <td
                                                    className="
                                                            px-5
                                                            py-4
                                                            text-slate-600
                                                        "
                                                >
                                                    {order.quantity}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <StatusBadge
                                                        status={
                                                            order.status
                                                        }
                                                    />
                                                </td>

                                                <td
                                                    className="
                                                            px-5
                                                            py-4
                                                            font-semibold
                                                            text-slate-800
                                                        "
                                                >
                                                    {formatLKR(
                                                        Number(
                                                            order.total ||
                                                            0
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="
                                bg-white
                                border
                                border-[#e2e8f0]
                                rounded-2xl
                                p-12
                                text-center
                                text-[#94a3b8]
                                shadow-sm
                            "
                        >
                            No order records are
                            available from the
                            database.
                        </div>
                    )}

                </>
            )}
        </div>
    );
}