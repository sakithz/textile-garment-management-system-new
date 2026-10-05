import {
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    formatDate
} from '../types';

import {
    fetchAllOrders
} from '../services/orderApi';

import {
    fetchApprovedOrders,
    fetchAllProductionTasks
} from '../services/productionApi';

import {
    fetchAllInventory
} from '../services/inventoryApi';

import {
    fetchAllInvoices
} from '../services/financeApi';

import {
    fetchAllCampaigns
} from '../services/marketingApi';

import {
    fetchAllDeliveries
} from '../services/deliveryApi';

type NotificationType =
    | 'order'
    | 'production'
    | 'alert'
    | 'finance'
    | 'marketing'
    | 'delivery';

type NotificationItem = {

    id: string;

    type: NotificationType;

    message: string;

    date: string;
};

const READ_KEY =
    'fabriqs_read_notifications';

function getReadIds():
    Set<string> {

    try {

        return new Set(
            JSON.parse(
                localStorage.getItem(
                    READ_KEY
                ) || '[]'
            )
        );

    } catch {

        return new Set();
    }
}

function saveReadIds(
    ids: Set<string
    >
) {

    localStorage.setItem(
        READ_KEY,
        JSON.stringify(
            [...ids]
        )
    );
}

export default function Notifications() {

    const [
        notifications,
        setNotifications
    ] =
        useState<
            NotificationItem[]
        >([]);

    const [
        readIds,
        setReadIds
    ] =
        useState<
            Set<string>
        >(
            getReadIds
        );

    const [
        filter,
        setFilter
    ] =
        useState<
            'all'
            | 'unread'
            | NotificationType
        >(
            'all'
        );

    const [
        loading,
        setLoading
    ] =
        useState(
            true
        );

    const [
        error,
        setError
    ] =
        useState<
            string | null
        >(null);

    /*
     * =====================================================
     * LOAD NOTIFICATIONS
     * =====================================================
     *
     * Notifications are generated from LIVE database
     * records returned by the APIs.
     *
     * There is no mock notification array.
     */
    useEffect(() => {

        let active =
            true;

        const load =
            async () => {

                setLoading(
                    true
                );

                setError(
                    null
                );

                const [
                    orders,
                    approvedOrders,
                    production,
                    inventory,
                    invoices,
                    campaigns,
                    deliveries
                ] =
                    await Promise.allSettled([

                        fetchAllOrders(),

                        fetchApprovedOrders(),

                        fetchAllProductionTasks(),

                        fetchAllInventory(),

                        fetchAllInvoices(),

                        fetchAllCampaigns(),

                        fetchAllDeliveries()

                    ]);

                if (!active)
                    return;

                const next:
                    NotificationItem[] =
                    [];

                /*
                 * ORDERS
                 */
                if (
                    orders.status
                    === 'fulfilled'
                ) {

                    orders.value.forEach(
                        order => {

                            if (
                                order.status
                                === 'pending'
                            ) {

                                next.push({

                                    id:
                                        `order-pending-${order.numericId}`,

                                    type:
                                        'order',

                                    message:
                                        `Order ${order.id} is waiting for Operations approval.`,

                                    date:
                                    order.orderDate
                                });
                            }

                            if (
                                order.status
                                === 'approved'
                            ) {

                                next.push({

                                    id:
                                        `order-approved-${order.numericId}`,

                                    type:
                                        'order',

                                    message:
                                        `Order ${order.id} has been approved and is ready for production.`,

                                    date:
                                    order.orderDate
                                });
                            }

                            if (
                                order.status
                                === 'ready'
                            ) {

                                next.push({

                                    id:
                                        `order-ready-${order.numericId}`,

                                    type:
                                        'order',

                                    message:
                                        `Order ${order.id} is ready for delivery.`,

                                    date:
                                    order.deliveryDate
                                });
                            }

                        }
                    );
                }

                /*
                 * APPROVED ORDERS
                 */
                if (
                    approvedOrders.status
                    === 'fulfilled'
                ) {

                    approvedOrders.value.forEach(
                        order => {

                            next.push({

                                id:
                                    `production-approved-${order.numericId}`,

                                type:
                                    'production',

                                message:
                                    `Approved order ${order.id} is available in Production.`,

                                date:
                                order.orderDate

                            });

                        }
                    );
                }

                /*
                 * PRODUCTION
                 */
                if (
                    production.status
                    === 'fulfilled'
                ) {

                    production.value
                        .forEach(
                            task => {

                                if (
                                    task.progress
                                    >= 100
                                ) {

                                    next.push({

                                        id:
                                            `production-complete-${task.numericId}`,

                                        type:
                                            'production',

                                        message:
                                            `Production task ${task.id} for ${task.orderRef} is complete.`,

                                        date:
                                        task.dueDate

                                    });
                                }

                            }
                        );
                }

                /*
                 * INVENTORY
                 */
                if (
                    inventory.status
                    === 'fulfilled'
                ) {

                    inventory.value
                        .filter(
                            material =>
                                material.status
                                !== 'in_stock'
                        )
                        .forEach(
                            material => {

                                next.push({

                                    id:
                                        `inventory-${material.numericId}`,

                                    type:
                                        'alert',

                                    message:
                                        `${material.name} is ${material.status.replace(
                                            /_/g,
                                            ' '
                                        )}.`,

                                    date:
                                    material.lastUpdated

                                });

                            }
                        );
                }

                /*
                 * FINANCE
                 */
                if (
                    invoices.status
                    === 'fulfilled'
                ) {

                    invoices.value
                        .filter(
                            invoice =>
                                invoice.status
                                === 'overdue'
                        )
                        .forEach(
                            invoice => {

                                next.push({

                                    id:
                                        `invoice-${invoice.numericId}`,

                                    type:
                                        'finance',

                                    message:
                                        `Invoice ${invoice.id} is overdue. Amount: ${invoice.amount.toLocaleString(
                                            'en-IN'
                                        )}.`,

                                    date:
                                    invoice.dueDate

                                });

                            }
                        );
                }

                /*
                 * MARKETING
                 */
                if (
                    campaigns.status
                    === 'fulfilled'
                ) {

                    campaigns.value
                        .filter(
                            campaign =>
                                campaign.status
                                === 'active'
                        )
                        .forEach(
                            campaign => {

                                next.push({

                                    id:
                                        `campaign-${campaign.numericId}`,

                                    type:
                                        'marketing',

                                    message:
                                        `Campaign "${campaign.name}" is active.`,

                                    date:
                                    campaign.startDate

                                });

                            }
                        );
                }

                /*
                 * DELIVERY
                 */
                if (
                    deliveries.status
                    === 'fulfilled'
                ) {

                    deliveries.value
                        .filter(
                            delivery =>
                                delivery.status
                                === 'delayed'
                        )
                        .forEach(
                            delivery => {

                                next.push({

                                    id:
                                        `delivery-${delivery.numericId}`,

                                    type:
                                        'delivery',

                                    message:
                                        `Delivery ${delivery.id} for ${delivery.customer} is delayed.`,

                                    date:
                                    delivery.scheduledDate

                                });

                            }
                        );
                }

                /*
                 * Newest first.
                 */
                next.sort(
                    (a, b) =>
                        new Date(
                            b.date
                        ).getTime()
                        -
                        new Date(
                            a.date
                        ).getTime()
                );

                setNotifications(
                    next
                );

                /*
                 * Only show backend error if EVERY
                 * endpoint failed.
                 *
                 * 403 from an endpoint the role cannot
                 * access is therefore not treated as a
                 * system failure.
                 */
                const failures =
                    [
                        orders,
                        approvedOrders,
                        production,
                        inventory,
                        invoices,
                        campaigns,
                        deliveries
                    ]
                        .filter(
                            result =>
                                result.status
                                === 'rejected'
                        )
                        .length;

                if (
                    failures === 7
                ) {

                    setError(
                        'The backend is not reachable. Start the Spring Boot backend and refresh.'
                    );
                }

                setLoading(
                    false
                );
            };

        void load();

        return () => {

            active =
                false;

        };

    }, []);

    const visible =
        useMemo(
            () =>
                notifications.filter(
                    notification => {

                        if (
                            filter
                            === 'unread'
                        ) {

                            return !readIds.has(
                                notification.id
                            );
                        }

                        if (
                            filter
                            === 'all'
                        ) {

                            return true;
                        }

                        return (
                            notification.type
                            === filter
                        );
                    }
                ),
            [
                notifications,
                filter,
                readIds
            ]
        );

    const unreadCount =
        notifications.filter(
            notification =>
                !readIds.has(
                    notification.id
                )
        ).length;

    const markRead =
        (
            id: string
        ) => {

            const next =
                new Set(
                    readIds
                );

            next.add(
                id
            );

            setReadIds(
                next
            );

            saveReadIds(
                next
            );
        };

    const markAllRead =
        () => {

            const next =
                new Set(
                    notifications.map(
                        notification =>
                            notification.id
                    )
                );

            setReadIds(
                next
            );

            saveReadIds(
                next
            );
        };

    return (

        <div className="space-y-5">

            <div className="flex items-center justify-between gap-4 flex-wrap">

                <div>

                    <h1 className="text-2xl font-bold font-display text-[#0f172a]">
                        Notifications
                    </h1>

                    <p className="text-sm text-[#64748b] mt-0.5">
                        {unreadCount}
                        {' '}
                        unread · generated from live database records
                    </p>

                </div>

                <button
                    onClick={
                        markAllRead
                    }
                    className="text-sm font-semibold text-blue-600 hover:underline"
                >
                    Mark all as read
                </button>

            </div>

            <div className="flex gap-2 flex-wrap">

                {(
                    [
                        'all',
                        'unread',
                        'order',
                        'production',
                        'alert',
                        'finance',
                        'marketing',
                        'delivery'
                    ] as const
                ).map(
                    key => (

                        <button
                            key={key}
                            onClick={() =>
                                setFilter(
                                    key
                                )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                filter === key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-[#e2e8f0] text-[#64748b]'
                            }`}
                        >
                            {
                                key === 'all'
                                    ? 'All'
                                    : key === 'unread'
                                        ? 'Unread'
                                        : key
                                            .charAt(0)
                                            .toUpperCase()
                                        + key.slice(1)
                            }
                        </button>

                    )
                )}

            </div>

            {error && (

                <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    {error}
                </div>

            )}

            {loading ? (

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center text-sm text-[#64748b]">
                    Loading notifications from MySQL...
                </div>

            ) : visible.length === 0 ? (

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center text-sm text-[#94a3b8]">
                    No notifications generated from current database records.
                </div>

            ) : (

                <div className="space-y-2">

                    {visible.map(
                        notification => {

                            const read =
                                readIds.has(
                                    notification.id
                                );

                            return (

                                <button
                                    key={
                                        notification.id
                                    }
                                    onClick={() =>
                                        markRead(
                                            notification.id
                                        )
                                    }
                                    className={`w-full text-left bg-white rounded-xl border p-4 flex items-start gap-3 ${
                                        read
                                            ? 'border-[#e2e8f0]'
                                            : 'border-blue-200 shadow-sm'
                                    }`}
                                >

                                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                        ●
                                    </div>

                                    <div className="flex-1">

                                        <div className="text-sm font-semibold text-[#0f172a]">
                                            {notification.message}
                                        </div>

                                        <div className="text-xs text-[#94a3b8] mt-1">

                                            {notification.type}
                                            {' · '}
                                            {formatDate(
                                                notification.date
                                            )}

                                        </div>

                                    </div>

                                    {!read && (

                                        <span className="w-2 h-2 rounded-full bg-blue-600 mt-2" />

                                    )}

                                </button>

                            );
                        }
                    )}

                </div>

            )}

        </div>
    );
}