import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from 'react';

import type {
    Delivery as DeliveryType,
    DeliveryStatus,
    ProductionTask,
} from '../types';

import {
    fetchAllDeliveries,
    createDelivery,
    updateDeliveryStatus,
    deleteDelivery,
} from '../services/deliveryApi';

import {
    fetchAllProductionTasks,
} from '../services/productionApi';

import {
    formatDate,
} from '../data/mockData';

type LiveDelivery = DeliveryType & {
    numericId: number;
};

type ReadyProductionTask = ProductionTask & {
    numericId?: number;
};

const STATUS_LABELS: Record<DeliveryStatus, string> = {
    scheduled: 'Scheduled',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    delayed: 'Delayed',
    cancelled: 'Cancelled',
    failed: 'Failed',
};

function Metric({
                    label,
                    value,
                }: {
    label: string;
    value: number;
}) {
    return (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">
            <div className="text-2xl font-bold text-[#0f172a]">
                {value}
            </div>

            <div className="text-sm text-[#64748b] mt-1">
                {label}
            </div>
        </div>
    );
}

function ReadOnlyField({
                           label,
                           value,
                       }: {
    label: string;
    value: string;
}) {
    return (
        <label>
      <span className="text-sm font-medium text-[#334155]">
        {label}
      </span>

            <input
                value={value}
                readOnly
                className="mt-1 w-full px-3 py-2 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#64748b] cursor-not-allowed"
            />
        </label>
    );
}

function Field({
                   label,
                   value,
                   onChange,
                   type = 'text',
                   required = true,
                   min,
               }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    min?: string;
}) {
    return (
        <label>
      <span className="text-sm font-medium text-[#334155]">
        {label}
      </span>

            <input
                required={required}
                type={type}
                value={value}
                min={min}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-[#e2e8f0] rounded-lg bg-white text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
        </label>
    );
}

function formatOrderOption(
    task: ReadyProductionTask
): string {
    return `${task.orderRef} — ${task.garmentType} — Qty ${task.quantity} — ${task.customer}`;
}

export default function Delivery({
                                     _props,
                                 }: {
    _props?: {
        onNavigate?: (
            page: string,
            orderId?: string
        ) => void;
    };
}) {
    const today = new Date().toISOString().slice(0, 10);

    const [deliveries, setDeliveries] =
        useState<LiveDelivery[]>([]);

    const [productionTasks, setProductionTasks] =
        useState<ReadyProductionTask[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [loadingOrders, setLoadingOrders] =
        useState(true);

    const [error, setError] =
        useState('');

    const [modalOpen, setModalOpen] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [selectedOrderId, setSelectedOrderId] =
        useState('');

    const [form, setForm] =
        useState({
            orderId: '',
            customer: '',
            deliveryAddress: '',
            scheduledDate: today,
            officer: '',
            method: 'ROAD',
            priority: 'MEDIUM',
            garmentType: '',
            quantity: 1,
            specialInstructions: '',
        });

    const load = async () => {
        setLoading(true);
        setLoadingOrders(true);
        setError('');

        try {
            const [
                deliveryData,
                productionData,
            ] = await Promise.all([
                fetchAllDeliveries(),
                fetchAllProductionTasks(),
            ]);

            setDeliveries(deliveryData);

            setProductionTasks(
                productionData.filter(
                    (task) => task.progress >= 100
                )
            );
        } catch (error) {
            setDeliveries([]);
            setProductionTasks([]);

            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to load delivery and production data from MySQL.'
            );
        } finally {
            setLoading(false);
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const scheduledOrderIds =
        useMemo(
            () =>
                new Set(
                    deliveries.map(
                        (delivery) => delivery.orderId
                    )
                ),
            [deliveries]
        );

    const readyOrders =
        useMemo(
            () =>
                productionTasks.filter(
                    (task) =>
                        !scheduledOrderIds.has(
                            task.orderRef
                        )
                ),
            [
                productionTasks,
                scheduledOrderIds,
            ]
        );

    const selectedOrder =
        useMemo(
            () =>
                productionTasks.find(
                    (task) =>
                        task.orderRef ===
                        selectedOrderId
                ) || null,
            [
                productionTasks,
                selectedOrderId,
            ]
        );

    const counts =
        useMemo(
            () => ({
                total: deliveries.length,

                scheduled:
                deliveries.filter(
                    (item) =>
                        item.status ===
                        'scheduled'
                ).length,

                out:
                deliveries.filter(
                    (item) =>
                        item.status ===
                        'out_for_delivery'
                ).length,

                delivered:
                deliveries.filter(
                    (item) =>
                        item.status ===
                        'delivered'
                ).length,

                delayed:
                deliveries.filter(
                    (item) =>
                        item.status ===
                        'delayed'
                ).length,
            }),
            [deliveries]
        );

    const resetForm = () => {
        setSelectedOrderId('');

        setForm({
            orderId: '',
            customer: '',
            deliveryAddress: '',
            scheduledDate: today,
            officer: '',
            method: 'ROAD',
            priority: 'MEDIUM',
            garmentType: '',
            quantity: 1,
            specialInstructions: '',
        });

        sessionStorage.removeItem(
            'silkroute_delivery_order_id'
        );
    };

    const openScheduleModal = () => {
        const storedOrderId =
            sessionStorage.getItem(
                'silkroute_delivery_order_id'
            );

        setModalOpen(true);

        if (storedOrderId) {
            const task =
                readyOrders.find(
                    (item) =>
                        item.orderRef ===
                        storedOrderId
                );

            if (task) {
                selectOrder(task);
                return;
            }
        }

        setSelectedOrderId('');
    };

    const selectOrder = (
        task: ReadyProductionTask
    ) => {
        const suggestedDate =
            task.dueDate &&
            task.dueDate >= today
                ? task.dueDate
                : today;

        setSelectedOrderId(
            task.orderRef
        );

        setForm((previous) => ({
            ...previous,
            orderId: task.orderRef,
            customer: task.customer,
            garmentType: task.garmentType,
            quantity: task.quantity,
            priority:
                task.priority.toUpperCase(),
            scheduledDate: suggestedDate,
        }));
    };

    const handleOrderChange = (
        orderId: string
    ) => {
        setSelectedOrderId(orderId);

        const task =
            readyOrders.find(
                (item) =>
                    item.orderRef ===
                    orderId
            );

        if (!task) {
            setForm((previous) => ({
                ...previous,
                orderId: '',
                customer: '',
                garmentType: '',
                quantity: 1,
                priority: 'MEDIUM',
            }));

            return;
        }

        selectOrder(task);
    };

    const submit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        if (!selectedOrder) {
            alert(
                'Please select a completed production order.'
            );
            return;
        }

        if (form.scheduledDate < today) {
            alert(
                'Scheduled date cannot be before today.'
            );
            return;
        }

        setSaving(true);

        try {
            await createDelivery({
                orderId: form.orderId,
                customer: form.customer,
                deliveryAddress:
                form.deliveryAddress,
                scheduledDate:
                form.scheduledDate,
                officer: form.officer,
                method: form.method,
                priority: form.priority,
                specialInstructions:
                form.specialInstructions,
                garmentType:
                form.garmentType,
                quantity: form.quantity,
            });

            setModalOpen(false);
            resetForm();
            await load();
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : 'Failed to create delivery.'
            );
        } finally {
            setSaving(false);
        }
    };

    const changeStatus =
        async (
            id: number,
            status: DeliveryStatus
        ) => {
            try {
                await updateDeliveryStatus(
                    id,
                    status
                );

                await load();
            } catch (error) {
                alert(
                    error instanceof Error
                        ? error.message
                        : 'Failed to update delivery.'
                );
            }
        };

    const remove = async (
        id: number
    ) => {
        if (
            !window.confirm(
                'Delete this delivery?'
            )
        ) {
            return;
        }

        try {
            await deleteDelivery(id);
            await load();
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete delivery.'
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-[#0f172a]">
                            Delivery Dashboard
                        </h1>

                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
              Live MySQL DB
            </span>
                    </div>

                    <p className="text-sm text-[#64748b] mt-1">
                        Completed production orders are available for delivery scheduling.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => void load()}
                        className="px-3 py-2 border border-[#e2e8f0] bg-white rounded-lg text-sm font-semibold text-[#334155] hover:bg-[#f8fafc]"
                    >
                        ↻ Refresh
                    </button>

                    <button
                        type="button"
                        onClick={openScheduleModal}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                    >
                        + Schedule Delivery
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Metric
                    label="Total"
                    value={counts.total}
                />

                <Metric
                    label="Scheduled"
                    value={counts.scheduled}
                />

                <Metric
                    label="Out for Delivery"
                    value={counts.out}
                />

                <Metric
                    label="Delivered"
                    value={counts.delivered}
                />

                <Metric
                    label="Delayed"
                    value={counts.delayed}
                />
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e2e8f0]">
                    <h2 className="font-semibold text-[#0f172a]">
                        Delivery Records
                    </h2>

                    <p className="text-sm text-[#64748b] mt-1">
                        Live delivery information from the database.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#f8fafc]">
                        <tr>
                            {[
                                'Delivery',
                                'Order',
                                'Customer',
                                'Scheduled',
                                'Officer',
                                'Method',
                                'Priority',
                                'Status',
                                'Actions',
                            ].map((heading) => (
                                <th
                                    key={heading}
                                    className="text-left px-4 py-3 text-xs uppercase tracking-wide text-[#64748b] font-semibold"
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={9}
                                    className="p-12 text-center text-[#64748b]"
                                >
                                    Loading deliveries from MySQL...
                                </td>
                            </tr>
                        ) : deliveries.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={9}
                                    className="p-12 text-center text-[#94a3b8]"
                                >
                                    No delivery records in the database.
                                </td>
                            </tr>
                        ) : (
                            deliveries.map(
                                (delivery) => (
                                    <tr
                                        key={
                                            delivery.numericId
                                        }
                                        className="border-t border-[#e2e8f0] hover:bg-[#f8fafc]"
                                    >
                                        <td className="px-4 py-3 font-semibold text-blue-600">
                                            {delivery.id}
                                        </td>

                                        <td className="px-4 py-3 text-[#334155]">
                                            {delivery.orderId}
                                        </td>

                                        <td className="px-4 py-3 text-[#334155]">
                                            {delivery.customer}
                                        </td>

                                        <td className="px-4 py-3 text-[#334155]">
                                            {formatDate(
                                                delivery.scheduledDate
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-[#334155]">
                                            {delivery.officer}
                                        </td>

                                        <td className="px-4 py-3 capitalize text-[#334155]">
                                            {delivery.method.replace(
                                                '_',
                                                ' '
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-[#334155]">
                                            {delivery.priority}
                                        </td>

                                        <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                          {
                              STATUS_LABELS[
                                  delivery.status
                                  ]
                          }
                        </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex gap-1 flex-wrap">
                                                {delivery.status ===
                                                    'scheduled' && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void changeStatus(
                                                                    delivery.numericId,
                                                                    'out_for_delivery'
                                                                )
                                                            }
                                                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                                        >
                                                            Dispatch
                                                        </button>
                                                    )}

                                                {delivery.status ===
                                                    'out_for_delivery' && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void changeStatus(
                                                                    delivery.numericId,
                                                                    'delivered'
                                                                )
                                                            }
                                                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                                        >
                                                            Delivered
                                                        </button>
                                                    )}

                                                {delivery.status !==
                                                    'delivered' &&
                                                    delivery.status !==
                                                    'cancelled' && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void changeStatus(
                                                                    delivery.numericId,
                                                                    'cancelled'
                                                                )
                                                            }
                                                            className="px-2 py-1 border border-red-200 text-red-600 rounded text-xs hover:bg-red-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void remove(
                                                            delivery.numericId
                                                        )
                                                    }
                                                    className="px-2 py-1 border border-[#e2e8f0] rounded text-xs text-[#475569] hover:bg-[#f8fafc]"
                                                >
                                                    Delete
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

            {modalOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                    <form
                        onSubmit={submit}
                        className="bg-white rounded-xl w-full max-w-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="md:col-span-2">
                            <h2 className="text-xl font-bold text-[#0f172a]">
                                Schedule Delivery
                            </h2>

                            <p className="text-sm text-[#64748b] mt-1">
                                Select a production order that has reached 100% completion. Order details will be filled automatically.
                            </p>
                        </div>

                        <label className="md:col-span-2">
              <span className="text-sm font-medium text-[#334155]">
                Completed Order{' '}
                  <span className="text-red-500">
                  *
                </span>
              </span>

                            <select
                                required
                                value={selectedOrderId}
                                onChange={(e) =>
                                    handleOrderChange(
                                        e.target.value
                                    )
                                }
                                disabled={loadingOrders}
                                className="mt-1 w-full px-3 py-2 border border-[#e2e8f0] rounded-lg bg-white text-[#0f172a]"
                            >
                                <option value="">
                                    {loadingOrders
                                        ? 'Loading completed production orders...'
                                        : readyOrders.length ===
                                        0
                                            ? 'No completed orders available'
                                            : 'Select a completed order'}
                                </option>

                                {readyOrders.map(
                                    (task) => (
                                        <option
                                            key={
                                                task.orderRef
                                            }
                                            value={
                                                task.orderRef
                                            }
                                        >
                                            {formatOrderOption(
                                                task
                                            )}
                                        </option>
                                    )
                                )}
                            </select>

                            <span className="block text-xs text-[#64748b] mt-1">
                Only production tasks with 100% progress and no existing delivery are shown.
              </span>
                        </label>

                        <ReadOnlyField
                            label="Order ID"
                            value={form.orderId}
                        />

                        <ReadOnlyField
                            label="Customer"
                            value={form.customer}
                        />

                        <ReadOnlyField
                            label="Garment Type"
                            value={form.garmentType}
                        />

                        <ReadOnlyField
                            label="Quantity"
                            value={String(
                                form.quantity
                            )}
                        />

                        <Field
                            label="Delivery Address"
                            value={
                                form.deliveryAddress
                            }
                            onChange={(value) =>
                                setForm((p) => ({
                                    ...p,
                                    deliveryAddress:
                                    value,
                                }))
                            }
                        />

                        <Field
                            label="Officer"
                            value={form.officer}
                            onChange={(value) =>
                                setForm((p) => ({
                                    ...p,
                                    officer: value,
                                }))
                            }
                        />

                        <Field
                            label="Scheduled Date"
                            type="date"
                            min={today}
                            value={
                                form.scheduledDate
                            }
                            onChange={(value) =>
                                setForm((p) => ({
                                    ...p,
                                    scheduledDate:
                                    value,
                                }))
                            }
                        />

                        <label>
              <span className="text-sm font-medium text-[#334155]">
                Method
              </span>

                            <select
                                value={form.method}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        method:
                                        e.target.value,
                                    }))
                                }
                                className="mt-1 w-full px-3 py-2 border border-[#e2e8f0] rounded-lg bg-white text-[#0f172a]"
                            >
                                <option value="ROAD">
                                    ROAD
                                </option>

                                <option value="RAIL">
                                    RAIL
                                </option>

                                <option value="AIR">
                                    AIR
                                </option>

                                <option value="COURIER">
                                    COURIER
                                </option>

                                <option value="OWN_VEHICLE">
                                    OWN VEHICLE
                                </option>
                            </select>
                        </label>

                        <ReadOnlyField
                            label="Priority"
                            value={form.priority}
                        />

                        <div className="md:col-span-2">
              <span className="text-sm font-medium text-[#334155]">
                Special Instructions
              </span>

                            <textarea
                                value={
                                    form.specialInstructions
                                }
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        specialInstructions:
                                        e.target.value,
                                    }))
                                }
                                className="mt-1 w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                rows={3}
                                placeholder="Optional delivery instructions..."
                            />
                        </div>

                        {selectedOrder && (
                            <div className="md:col-span-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700">
                                <strong>
                                    {
                                        selectedOrder.orderRef
                                    }
                                </strong>{' '}
                                is ready for delivery.
                                Production progress:{' '}
                                {
                                    selectedOrder.progress
                                }
                                %.
                            </div>
                        )}

                        <div className="md:col-span-2 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setModalOpen(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 border border-[#e2e8f0] rounded-lg text-[#334155] hover:bg-[#f8fafc]"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    saving ||
                                    !selectedOrder
                                }
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-blue-700"
                            >
                                {saving
                                    ? 'Saving...'
                                    : 'Schedule'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}