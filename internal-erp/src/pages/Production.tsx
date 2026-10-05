import {
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    type Order,
    type ProductionTask,
    type Priority,
    formatDate
} from '../types';

import {
    fetchAllProductionTasks,
    fetchApprovedOrders,
    createProductionTask,
    updateProductionProgress,
    deleteProductionTask
} from '../services/productionApi';


interface Props {
    onNavigate?: (
        page: string,
        orderId?: string
    ) => void;
}


type ProductionTaskItem =
    ProductionTask & {
    numericId?: number;
};


type ApprovedOrder =
    Order & {
    numericId: number;
};


/* ============================================================
   PRODUCTION STAGES
   ============================================================ */

const STAGE_CONFIG = {

    cutting: {
        label: 'Cutting',
        color: 'bg-blue-500',
        light:
            'bg-blue-50 text-blue-700'
    },

    stitching: {
        label: 'Stitching',
        color: 'bg-amber-500',
        light:
            'bg-amber-50 text-amber-700'
    },

    finishing: {
        label: 'Finishing',
        color: 'bg-purple-500',
        light:
            'bg-purple-50 text-purple-700'
    },

    quality_check: {
        label: 'Quality Check',
        color: 'bg-green-500',
        light:
            'bg-green-50 text-green-700'
    },

} as const;


const PRIORITY_COLOR:
    Record<string, string> = {

    low:
        'bg-slate-100 text-slate-500',

    medium:
        'bg-blue-100 text-blue-600',

    high:
        'bg-orange-100 text-orange-600',

    urgent:
        'bg-red-100 text-red-600',
};


/* ============================================================
   TASK CARD
   ============================================================ */

function TaskCard({
                      task,
                      onNavigate,
                      onOpenProgress,
                      onDelete
                  }: {
    task:
        ProductionTaskItem;

    onNavigate?:
        (
            page: string,
            orderId?: string
        ) => void;

    onOpenProgress:
        (
            task: ProductionTaskItem
        ) => void;

    onDelete:
        (
            id?: number
        ) => void;
}) {

    const stage =
        STAGE_CONFIG[
            task.stage
            ] ||
        STAGE_CONFIG.cutting;


    const stages =
        Object.keys(
            STAGE_CONFIG
        );


    const currentIndex =
        stages.indexOf(
            task.stage
        );


    return (

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 hover:shadow-md transition-all">

            {/* ==================================================
                CARD HEADER
                ================================================== */}

            <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                    <div className="flex items-center gap-2 flex-wrap">

                        <button
                            type="button"
                            onClick={() =>
                                onNavigate?.(
                                    'order-details',
                                    task.orderRef
                                )
                            }
                            className="font-semibold text-blue-600 text-sm hover:text-blue-700"
                        >
                            {task.orderRef}
                        </button>


                        <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stage.light}`}
                        >
                            {stage.label}
                        </span>


                        <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                PRIORITY_COLOR[
                                    task.priority
                                    ]
                            }`}
                        >
                            {task.priority}
                        </span>

                    </div>


                    <p className="text-sm font-semibold text-[#334155] mt-2">
                        {task.garmentType}
                    </p>


                    <p className="text-xs text-[#94a3b8] mt-0.5">
                        {task.customer}
                        {' · '}
                        Qty {task.quantity.toLocaleString()}
                    </p>


                    <p className="text-xs text-[#94a3b8] mt-1">
                        Team: {task.assignedTo}
                        {' · '}
                        Due: {formatDate(
                        task.dueDate
                    )}
                    </p>

                </div>


                {/* PROGRESS NUMBER */}

                <div className="text-right flex-shrink-0">

                    <div className="text-3xl font-bold text-[#0f172a]">
                        {task.progress}%
                    </div>

                    <div className="text-xs text-[#94a3b8]">
                        complete
                    </div>

                </div>

            </div>


            {/* ==================================================
                PROGRESS BAR
                ================================================== */}

            <div className="mt-5">

                <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1.5">

                    <span>
                        Started{' '}
                        {formatDate(
                            task.startDate
                        )}
                    </span>

                    <span>
                        Due{' '}
                        {formatDate(
                            task.dueDate
                        )}
                    </span>

                </div>


                <div className="w-full h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden">

                    <div
                        className={`h-full rounded-full transition-all ${stage.color}`}
                        style={{
                            width:
                                `${Math.min(
                                    100,
                                    Math.max(
                                        0,
                                        task.progress
                                    )
                                )}%`
                        }}
                    />

                </div>

            </div>


            {/* ==================================================
                STAGE PROGRESS
                ================================================== */}

            <div className="mt-4 flex gap-2">

                {stages.map(
                    (
                        key,
                        index
                    ) => (

                        <div
                            key={key}
                            className={`flex-1 h-1 rounded-full ${
                                index < currentIndex
                                    ? 'bg-blue-500'
                                    : index === currentIndex
                                        ? stage.color
                                        : 'bg-[#f1f5f9]'
                            }`}
                        />

                    )
                )}

            </div>


            {/* ==================================================
                DELIVERY STATUS
                ================================================== */}

            <div className="mt-4 flex items-center justify-between py-2.5 px-3 bg-[#f8fafc] rounded-lg border border-[#f1f5f9]">

                <div className="flex items-center gap-2">

                    <span
                        className={`w-2 h-2 rounded-full ${
                            task.progress >= 100
                                ? 'bg-green-500'
                                : stage.color
                        }`}
                    />

                    <span className="text-xs font-medium text-[#64748b]">

                        {task.progress >= 100
                            ? 'Ready for Delivery'
                            : 'In Production'}

                    </span>

                </div>


                {task.progress >= 100 && (

                    <button
                        type="button"
                        onClick={() => {

                            sessionStorage.setItem(
                                'silkroute_delivery_order_id',
                                task.orderRef
                            );

                            onNavigate?.(
                                'delivery',
                                task.orderRef
                            );

                        }}
                        className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1.5 rounded-lg hover:bg-green-200 transition-colors"
                    >
                        Schedule Delivery →
                    </button>

                )}

            </div>


            {/* ==================================================
                ACTIONS
                ================================================== */}

            <div className="mt-3 flex gap-2">

                <button
                    type="button"
                    onClick={() =>
                        onOpenProgress(task)
                    }
                    className="flex-1 px-3 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Update Progress
                </button>


                <button
                    type="button"
                    onClick={() =>
                        onDelete(
                            task.numericId
                        )
                    }
                    className="px-3 py-2 text-xs font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                    Delete
                </button>

            </div>

        </div>
    );
}


/* ============================================================
   APPROVED ORDER CARD
   ============================================================ */

function ApprovedOrderCard({
                               order,
                               onStart,
                               disabled
                           }: {
    order:
        ApprovedOrder;

    onStart:
        (
            order: ApprovedOrder
        ) => void;

    disabled: boolean;
}) {

    return (

        <div className="bg-white rounded-xl border border-blue-200 p-5 hover:shadow-md transition-all">

            <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                    <div className="flex items-center gap-2">

                        <span className="font-bold text-blue-600 text-sm">
                            {order.id}
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">

                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />

                            Approved

                        </span>

                    </div>


                    <p className="text-sm font-semibold text-[#334155] mt-2">
                        {order.customer}
                    </p>


                    <p className="text-xs text-[#64748b] mt-0.5">
                        {order.garmentType}
                        {' · '}
                        Qty {order.quantity.toLocaleString()}
                    </p>


                    <p className="text-xs text-[#94a3b8] mt-1">
                        Delivery:{' '}
                        {formatDate(
                            order.deliveryDate
                        )}
                    </p>

                </div>


                <div className="text-right flex-shrink-0">

                    <div className="font-bold text-[#0f172a] text-sm">
                        LKR{' '}
                        {order.total.toLocaleString(
                            'en-LK'
                        )}
                    </div>

                    <div className="text-xs text-[#94a3b8] mt-0.5">
                        Order value
                    </div>

                </div>

            </div>


            <button
                type="button"
                disabled={disabled}
                onClick={() =>
                    onStart(order)
                }
                className="w-full mt-4 px-3 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                Start Production
            </button>

        </div>
    );
}


/* ============================================================
   PRODUCTION PAGE
   ============================================================ */

export default function Production({
                                       onNavigate
                                   }: Props) {

    const [
        tasks,
        setTasks
    ] = useState<
        ProductionTaskItem[]
    >([]);


    const [
        approvedOrders,
        setApprovedOrders
    ] = useState<
        ApprovedOrder[]
    >([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        isLiveDb,
        setIsLiveDb
    ] = useState(false);


    const [
        error,
        setError
    ] = useState<string | null>(
        null
    );


    const [
        isProgressModalOpen,
        setIsProgressModalOpen
    ] = useState(false);


    const [
        isStartModalOpen,
        setIsStartModalOpen
    ] = useState(false);


    const [
        selectedTask,
        setSelectedTask
    ] =
        useState<ProductionTaskItem | null>(
            null
        );


    const [
        selectedOrder,
        setSelectedOrder
    ] =
        useState<ApprovedOrder | null>(
            null
        );


    const [
        progressVal,
        setProgressVal
    ] = useState(0);


    const [
        stageVal,
        setStageVal
    ] =
        useState<
            ProductionTask['stage']
        >(
            'cutting'
        );


    const [
        assignedTo,
        setAssignedTo
    ] = useState('');


    const [
        startDate,
        setStartDate
    ] =
        useState(
            new Date()
                .toISOString()
                .split('T')[0]
        );


    const [
        dueDate,
        setDueDate
    ] = useState('');


    const [
        priority,
        setPriority
    ] =
        useState<Priority>(
            'medium'
        );


    const [
        submitting,
        setSubmitting
    ] = useState(false);


    /* ============================================================
       LOAD DATABASE DATA
       ============================================================ */

    const loadData =
        async () => {

            try {

                setLoading(true);

                setError(null);


                const [
                    taskData,
                    orderData
                ] =
                    await Promise.all([
                        fetchAllProductionTasks(),
                        fetchApprovedOrders()
                    ]);


                setTasks(
                    taskData
                );


                setApprovedOrders(
                    orderData
                );


                setIsLiveDb(
                    true
                );

            } catch (err) {

                console.error(
                    'Failed to load production data:',
                    err
                );


                setTasks([]);

                setApprovedOrders([]);

                setIsLiveDb(
                    false
                );


                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load production data.'
                );

            } finally {

                setLoading(false);

            }

        };


    useEffect(() => {

        void loadData();

    }, []);


    /* ============================================================
       STAGE COUNTS
       ============================================================ */

    const stageCounts =
        useMemo(
            () => ({

                cutting:
                tasks.filter(
                    task =>
                        task.stage ===
                        'cutting'
                ).length,

                stitching:
                tasks.filter(
                    task =>
                        task.stage ===
                        'stitching'
                ).length,

                finishing:
                tasks.filter(
                    task =>
                        task.stage ===
                        'finishing'
                ).length,

                quality_check:
                tasks.filter(
                    task =>
                        task.stage ===
                        'quality_check'
                ).length,

            }),
            [tasks]
        );


    /* ============================================================
       START PRODUCTION
       ============================================================ */

    const openStartModal =
        (
            order: ApprovedOrder
        ) => {

            setSelectedOrder(
                order
            );


            setAssignedTo(
                ''
            );


            setStartDate(
                new Date()
                    .toISOString()
                    .split('T')[0]
            );


            setDueDate(
                order.deliveryDate
                ||
                new Date(
                    Date.now()
                    + 14 *
                    86400000
                )
                    .toISOString()
                    .split('T')[0]
            );


            setPriority(
                order.priority
            );


            setStageVal(
                'cutting'
            );


            setIsStartModalOpen(
                true
            );
        };


    const handleStartProduction =
        async (
            e: React.FormEvent
        ) => {

            e.preventDefault();


            if (!selectedOrder)
                return;


            if (
                !assignedTo.trim()
            ) {

                setError(
                    'Please enter the production team / line.'
                );

                return;
            }


            try {

                setSubmitting(
                    true
                );


                setError(null);


                await createProductionTask({

                    orderRef:
                    selectedOrder.id,

                    customer:
                    selectedOrder.customer,

                    garmentType:
                    selectedOrder.garmentType,

                    quantity:
                    selectedOrder.quantity,

                    stage:
                    stageVal,

                    assignedTo:
                        assignedTo.trim(),

                    startDate,

                    dueDate,

                    progress:
                        0,

                    priority

                });


                setIsStartModalOpen(
                    false
                );


                setSelectedOrder(
                    null
                );


                await loadData();

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to start production.'
                );

            } finally {

                setSubmitting(
                    false
                );

            }
        };


    /* ============================================================
       PROGRESS
       ============================================================ */

    const openProgress =
        (
            task: ProductionTaskItem
        ) => {

            setSelectedTask(
                task
            );


            setProgressVal(
                task.progress
            );


            setStageVal(
                task.stage
            );


            setIsProgressModalOpen(
                true
            );
        };


    const handleProgress =
        async (
            e: React.FormEvent
        ) => {

            e.preventDefault();


            if (
                !selectedTask?.numericId
            ) {
                return;
            }


            try {

                setSubmitting(
                    true
                );


                await updateProductionProgress(
                    selectedTask.numericId,
                    progressVal,
                    stageVal
                );


                setIsProgressModalOpen(
                    false
                );


                await loadData();

            } catch (err) {

                alert(
                    err instanceof Error
                        ? err.message
                        : 'Failed to update production progress.'
                );

            } finally {

                setSubmitting(
                    false
                );

            }
        };


    /* ============================================================
       DELETE
       ============================================================ */

    const handleDelete =
        async (
            id?: number
        ) => {

            if (!id)
                return;


            if (
                !window.confirm(
                    'Delete this production task?'
                )
            ) {
                return;
            }


            try {

                await deleteProductionTask(
                    id
                );


                await loadData();

            } catch (err) {

                alert(
                    err instanceof Error
                        ? err.message
                        : 'Failed to delete production task.'
                );

            }
        };


    /* ============================================================
       PAGE UI
       ============================================================ */

    return (

        <div className="space-y-5">

            {/* ==================================================
                HEADER
                ================================================== */}

            <div className="flex items-center justify-between gap-4 flex-wrap">

                <div>

                    <div className="flex items-center gap-2 flex-wrap">

                        <h1 className="text-2xl font-bold text-[#0f172a]">
                            Production Management
                        </h1>


                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                isLiveDb
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-700'
                            }`}
                        >

                            <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                    isLiveDb
                                        ? 'bg-green-600 animate-pulse'
                                        : 'bg-red-600'
                                }`}
                            />

                            {isLiveDb
                                ? 'Live MySQL Connected'
                                : 'Database unavailable'}

                        </span>

                    </div>


                    <p className="text-sm text-[#64748b] mt-0.5">
                        Approved orders become production work only after Operations approval.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={
                        loadData
                    }
                    className="px-4 py-2 text-sm font-semibold border border-[#e2e8f0] rounded-lg text-[#334155] bg-white hover:bg-[#f1f5f9] transition-colors flex items-center gap-2"
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

            </div>


            {/* ERROR */}

            {error && (

                <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    {error}
                </div>

            )}


            {/* ==================================================
                SUMMARY CARDS
                ================================================== */}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                {(
                    [
                        'cutting',
                        'stitching',
                        'finishing',
                        'quality_check'
                    ] as const
                ).map(
                    stage => (

                        <div
                            key={stage}
                            className="bg-white rounded-xl border border-[#e2e8f0] p-5"
                        >

                            <div
                                className={`w-9 h-9 rounded-lg ${STAGE_CONFIG[stage].light} flex items-center justify-center mb-3`}
                            >

                                <span
                                    className={`w-2.5 h-2.5 rounded-full ${STAGE_CONFIG[stage].color}`}
                                />

                            </div>


                            <div className="text-2xl font-bold text-[#0f172a]">
                                {stageCounts[stage]}
                            </div>


                            <div className="text-sm text-[#64748b] mt-0.5">
                                {STAGE_CONFIG[stage].label}
                            </div>

                        </div>

                    )
                )}

            </div>


            {/* ==================================================
                APPROVED ORDERS
                ================================================== */}

            <section className="space-y-3">

                <div className="flex items-center justify-between gap-3">

                    <div>

                        <h2 className="text-lg font-bold text-[#0f172a]">
                            Approved Orders Waiting for Production
                        </h2>

                        <p className="text-xs text-[#94a3b8]">
                            These records come directly from the MySQL orders table.
                        </p>

                    </div>


                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                        {approvedOrders.length}{' '}
                        {approvedOrders.length === 1
                            ? 'order'
                            : 'orders'}
                    </span>

                </div>


                {loading ? (

                    <div className="bg-white rounded-xl border border-[#e2e8f0] p-10 text-center">

                        <div className="w-9 h-9 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />

                        <p className="text-sm text-[#64748b]">
                            Loading production data...
                        </p>

                    </div>

                ) : approvedOrders.length === 0 ? (

                    <div className="bg-white rounded-xl border border-[#e2e8f0] p-10 text-center">

                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3">

                            <svg
                                className="w-6 h-6 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.8}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0"
                                />
                            </svg>

                        </div>

                        <p className="text-sm font-medium text-[#334155]">
                            No approved orders waiting for production
                        </p>

                        <p className="text-xs text-[#94a3b8] mt-1">
                            Approved orders will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                        {approvedOrders.map(
                            order => (

                                <ApprovedOrderCard
                                    key={
                                        order.numericId
                                    }
                                    order={
                                        order
                                    }
                                    onStart={
                                        openStartModal
                                    }
                                    disabled={
                                        submitting
                                    }
                                />

                            )
                        )}

                    </div>

                )}

            </section>


            {/* ==================================================
                ACTIVE PRODUCTION
                ================================================== */}

            <section className="space-y-3">

                <div className="flex items-center justify-between gap-3">

                    <div>

                        <h2 className="text-lg font-bold text-[#0f172a]">
                            Active Production
                        </h2>

                        <p className="text-xs text-[#94a3b8]">
                            Monitor production progress and
                            update current stages.
                        </p>

                    </div>


                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                        {tasks.length}{' '}
                        {tasks.length === 1
                            ? 'task'
                            : 'tasks'}
                    </span>

                </div>


                {loading ? (

                    <div className="bg-white rounded-xl border border-[#e2e8f0] p-10 text-center">

                        <p className="text-sm text-[#64748b]">
                            Loading tasks...
                        </p>

                    </div>

                ) : tasks.length === 0 ? (

                    <div className="bg-white rounded-xl border border-[#e2e8f0] p-10 text-center">

                        <p className="text-sm font-medium text-[#334155]">
                            No active production tasks
                        </p>

                        <p className="text-xs text-[#94a3b8] mt-1">
                            Start production from an approved order above.
                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                        {tasks.map(
                            task => (

                                <TaskCard
                                    key={
                                        task.numericId ??
                                        task.id
                                    }
                                    task={
                                        task
                                    }
                                    onNavigate={
                                        onNavigate
                                    }
                                    onOpenProgress={
                                        openProgress
                                    }
                                    onDelete={
                                        handleDelete
                                    }
                                />

                            )
                        )}

                    </div>

                )}

            </section>


            {/* ==================================================
                START PRODUCTION MODAL
                ================================================== */}

            {isStartModalOpen &&
                selectedOrder && (

                    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

                        <div className="w-full max-w-lg bg-white rounded-xl border border-[#e2e8f0] shadow-xl overflow-hidden">

                            <div className="px-6 py-5 border-b border-[#e2e8f0]">

                                <h2 className="text-lg font-bold text-[#0f172a]">
                                    Start Production
                                </h2>

                                <p className="text-sm text-[#64748b] mt-0.5">
                                    {selectedOrder.id}
                                    {' · '}
                                    {selectedOrder.customer}
                                </p>

                            </div>


                            <form
                                onSubmit={
                                    handleStartProduction
                                }
                            >

                                <div className="p-6 space-y-4">

                                    <div className="bg-[#f8fafc] rounded-lg border border-[#e2e8f0] p-4">

                                        <div className="grid grid-cols-2 gap-4">

                                            <div>

                                                <p className="text-xs text-[#94a3b8]">
                                                    Garment
                                                </p>

                                                <p className="text-sm font-semibold text-[#334155] mt-1">
                                                    {selectedOrder.garmentType}
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-xs text-[#94a3b8]">
                                                    Quantity
                                                </p>

                                                <p className="text-sm font-semibold text-[#334155] mt-1">
                                                    {selectedOrder.quantity.toLocaleString()}
                                                </p>

                                            </div>

                                        </div>

                                    </div>


                                    <div>

                                        <label className="block text-sm font-medium text-[#334155] mb-1.5">
                                            Production Team / Line
                                        </label>

                                        <input
                                            value={
                                                assignedTo
                                            }
                                            onChange={
                                                event =>
                                                    setAssignedTo(
                                                        event.target.value
                                                    )
                                            }
                                            placeholder="e.g. Team A"
                                            required
                                            className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                        />

                                    </div>


                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        <div>

                                            <label className="block text-sm font-medium text-[#334155] mb-1.5">
                                                Start Date
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    startDate
                                                }
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={
                                                    event =>
                                                        setStartDate(
                                                            event.target.value
                                                        )
                                                }
                                                required
                                                className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                            />

                                        </div>


                                        <div>

                                            <label className="block text-sm font-medium text-[#334155] mb-1.5">
                                                Due Date
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    dueDate
                                                }
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={
                                                    event =>
                                                        setDueDate(
                                                            event.target.value
                                                        )
                                                }
                                                required
                                                className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                            />

                                        </div>

                                    </div>


                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        <div>

                                            <label className="block text-sm font-medium text-[#334155] mb-1.5">
                                                Stage
                                            </label>

                                            <select
                                                value={
                                                    stageVal
                                                }
                                                onChange={
                                                    event =>
                                                        setStageVal(
                                                            event.target.value as ProductionTask['stage']
                                                        )
                                                }
                                                className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                            >

                                                <option value="cutting">
                                                    Cutting
                                                </option>

                                                <option value="stitching">
                                                    Stitching
                                                </option>

                                                <option value="finishing">
                                                    Finishing
                                                </option>

                                                <option value="quality_check">
                                                    Quality Check
                                                </option>

                                            </select>

                                        </div>


                                        <div>

                                            <label className="block text-sm font-medium text-[#334155] mb-1.5">
                                                Priority
                                            </label>

                                            <select
                                                value={
                                                    priority
                                                }
                                                onChange={
                                                    event =>
                                                        setPriority(
                                                            event.target.value as Priority
                                                        )
                                                }
                                                className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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

                                                <option value="urgent">
                                                    Urgent
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                </div>


                                <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end gap-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsStartModalOpen(
                                                false
                                            )
                                        }
                                        className="px-4 py-2.5 text-sm font-semibold border border-[#e2e8f0] rounded-lg bg-white text-[#334155] hover:bg-[#f1f5f9]"
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        disabled={
                                            submitting
                                        }
                                        className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {submitting
                                            ? 'Starting...'
                                            : 'Start Production'}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}


            {/* ==================================================
                UPDATE PROGRESS MODAL
                ================================================== */}

            {isProgressModalOpen &&
                selectedTask && (

                    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

                        <div className="w-full max-w-md bg-white rounded-xl border border-[#e2e8f0] shadow-xl overflow-hidden">

                            <div className="px-6 py-5 border-b border-[#e2e8f0]">

                                <h2 className="text-lg font-bold text-[#0f172a]">
                                    Update Production Progress
                                </h2>

                                <p className="text-sm text-[#64748b] mt-0.5">
                                    {selectedTask.orderRef}
                                    {' · '}
                                    {selectedTask.garmentType}
                                </p>

                            </div>


                            <form
                                onSubmit={
                                    handleProgress
                                }
                            >

                                <div className="p-6 space-y-5">

                                    <div>

                                        <div className="flex items-center justify-between mb-2">

                                            <label className="text-sm font-medium text-[#334155]">
                                                Progress
                                            </label>

                                            <span className="text-sm font-bold text-blue-600">
                                                {progressVal}%
                                            </span>

                                        </div>


                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={
                                                progressVal
                                            }
                                            onChange={
                                                event =>
                                                    setProgressVal(
                                                        Number(
                                                            event.target.value
                                                        )
                                                    )
                                            }
                                            className="w-full accent-blue-600"
                                        />

                                    </div>


                                    <div>

                                        <label className="block text-sm font-medium text-[#334155] mb-1.5">
                                            Production Stage
                                        </label>

                                        <select
                                            value={
                                                stageVal
                                            }
                                            onChange={
                                                event =>
                                                    setStageVal(
                                                        event.target.value as ProductionTask['stage']
                                                    )
                                            }
                                            className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                        >

                                            <option value="cutting">
                                                Cutting
                                            </option>

                                            <option value="stitching">
                                                Stitching
                                            </option>

                                            <option value="finishing">
                                                Finishing
                                            </option>

                                            <option value="quality_check">
                                                Quality Check
                                            </option>

                                        </select>

                                    </div>


                                    {progressVal >= 100 && (

                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">

                                            <p className="text-sm font-semibold text-green-700">
                                                Production Complete
                                            </p>

                                            <p className="text-xs text-green-600 mt-0.5">
                                                This order will become available for Delivery Management.
                                            </p>

                                        </div>

                                    )}

                                </div>


                                <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end gap-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsProgressModalOpen(
                                                false
                                            )
                                        }
                                        className="px-4 py-2.5 text-sm font-semibold border border-[#e2e8f0] rounded-lg bg-white text-[#334155] hover:bg-[#f1f5f9]"
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        disabled={
                                            submitting
                                        }
                                        className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {submitting
                                            ? 'Updating...'
                                            : 'Update Progress'}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

        </div>
    );
}