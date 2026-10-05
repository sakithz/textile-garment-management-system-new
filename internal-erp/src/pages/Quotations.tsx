import { useEffect, useMemo, useState } from 'react'
import {
    approveQuotation,
    convertQuotationToOrder,
    fetchAllQuotations,
    rejectQuotation,
    startQuotationReview,
    type Priority,
    type Quotation,
    type QuotationStatus,
} from '../services/quotationApi'

function formatCurrency(value?: number | null): string {
    const amount = Number(value ?? 0)

    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        maximumFractionDigits: 0,
    }).format(amount)
}

function formatDate(value?: string | null): string {
    if (!value) {
        return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function getStatusLabel(status: QuotationStatus): string {
    switch (status) {
        case 'PENDING':
            return 'Pending'

        case 'UNDER_REVIEW':
            return 'Under Review'

        case 'APPROVED':
            return 'Approved'

        case 'REJECTED':
            return 'Rejected'

        case 'CONVERTED_TO_ORDER':
            return 'Converted to Order'

        default:
            return status
    }
}

function getStatusClass(status: QuotationStatus): string {
    switch (status) {
        case 'PENDING':
            return 'bg-amber-100 text-amber-700'

        case 'UNDER_REVIEW':
            return 'bg-blue-100 text-blue-700'

        case 'APPROVED':
            return 'bg-emerald-100 text-emerald-700'

        case 'REJECTED':
            return 'bg-red-100 text-red-700'

        case 'CONVERTED_TO_ORDER':
            return 'bg-purple-100 text-purple-700'

        default:
            return 'bg-slate-100 text-slate-600'
    }
}

function getPriorityClass(
    priority?: Priority | null
): string {
    switch (priority) {
        case 'HIGH':
            return 'bg-red-100 text-red-700'

        case 'MEDIUM':
            return 'bg-amber-100 text-amber-700'

        case 'LOW':
            return 'bg-slate-100 text-slate-600'

        default:
            return 'bg-slate-100 text-slate-500'
    }
}

function getPriorityLabel(
    priority?: Priority | null
): string {
    if (!priority) {
        return '-'
    }

    return priority.charAt(0) + priority.slice(1).toLowerCase()
}

export default function Quotations() {
    const [quotations, setQuotations] =
        useState<Quotation[]>([])

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState<string | null>(null)

    const [search, setSearch] =
        useState('')

    const [statusFilter, setStatusFilter] =
        useState<'ALL' | QuotationStatus>('ALL')

    const [selectedQuotation, setSelectedQuotation] =
        useState<Quotation | null>(null)

    const [actionLoading, setActionLoading] =
        useState(false)

    const [actionError, setActionError] =
        useState<string | null>(null)

    const [approveUnitPrice, setApproveUnitPrice] =
        useState('')

    const [approveDeliveryDate, setApproveDeliveryDate] =
        useState('')

    const [approvePriority, setApprovePriority] =
        useState<Priority>('MEDIUM')

    const [rejectReason, setRejectReason] =
        useState('')

    const [showApproveModal, setShowApproveModal] =
        useState(false)

    const [showRejectModal, setShowRejectModal] =
        useState(false)

    const [showDetails, setShowDetails] =
        useState(false)

    const loadQuotations = async () => {
        try {
            setLoading(true)
            setError(null)

            const data =
                await fetchAllQuotations()

            setQuotations(data)
        } catch (err) {
            console.error(
                'Failed to load quotations:',
                err
            )

            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load quotations from the database.'
            )

            setQuotations([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadQuotations()
    }, [])

    const filteredQuotations =
        useMemo(() => {
            const query =
                search.trim().toLowerCase()

            return quotations.filter(
                quotation => {
                    const matchesSearch =
                        query === '' ||
                        quotation.quotationNumber
                            .toLowerCase()
                            .includes(query) ||
                        quotation.customer?.name
                            ?.toLowerCase()
                            .includes(query) ||
                        quotation.customer?.company
                            ?.toLowerCase()
                            .includes(query) ||
                        quotation.customer?.email
                            ?.toLowerCase()
                            .includes(query) ||
                        quotation.garmentType
                            .toLowerCase()
                            .includes(query)

                    const matchesStatus =
                        statusFilter === 'ALL' ||
                        quotation.status === statusFilter

                    return (
                        matchesSearch &&
                        matchesStatus
                    )
                }
            )
        }, [
            quotations,
            search,
            statusFilter,
        ])

    const pendingCount =
        quotations.filter(
            quotation =>
                quotation.status === 'PENDING'
        ).length

    const reviewCount =
        quotations.filter(
            quotation =>
                quotation.status === 'UNDER_REVIEW'
        ).length

    const approvedCount =
        quotations.filter(
            quotation =>
                quotation.status === 'APPROVED'
        ).length

    const convertedCount =
        quotations.filter(
            quotation =>
                quotation.status ===
                'CONVERTED_TO_ORDER'
        ).length

    const handleStartReview = async (
        quotation: Quotation
    ) => {
        try {
            setActionLoading(true)
            setActionError(null)

            const updated =
                await startQuotationReview(
                    quotation.id
                )

            setQuotations(current =>
                current.map(item =>
                    item.id === updated.id
                        ? updated
                        : item
                )
            )

            setSelectedQuotation(updated)
        } catch (err) {
            console.error(
                'Failed to start quotation review:',
                err
            )

            setActionError(
                err instanceof Error
                    ? err.message
                    : 'Failed to start quotation review.'
            )
        } finally {
            setActionLoading(false)
        }
    }

    const openApproveModal = (
        quotation: Quotation
    ) => {
        setSelectedQuotation(quotation)
        setActionError(null)

        setApproveUnitPrice(
            quotation.unitPrice != null
                ? String(quotation.unitPrice)
                : ''
        )

        setApproveDeliveryDate(
            quotation.confirmedDeliveryDate ||
            quotation.requestedDeliveryDate ||
            ''
        )

        setApprovePriority(
            quotation.priority || 'MEDIUM'
        )

        setShowApproveModal(true)
    }

    const handleApprove = async (
        event: React.FormEvent
    ) => {
        event.preventDefault()

        if (!selectedQuotation) {
            return
        }

        const unitPrice =
            Number(approveUnitPrice)

        if (
            !approveUnitPrice.trim() ||
            !Number.isFinite(unitPrice) ||
            unitPrice <= 0
        ) {
            setActionError(
                'Please enter a valid unit price.'
            )
            return
        }

        if (!approveDeliveryDate) {
            setActionError(
                'Please select a confirmed delivery date.'
            )
            return
        }

        try {
            setActionLoading(true)
            setActionError(null)

            const updated =
                await approveQuotation(
                    selectedQuotation.id,
                    {
                        unitPrice,
                        confirmedDeliveryDate:
                        approveDeliveryDate,
                        priority:
                        approvePriority,
                    }
                )

            setQuotations(current =>
                current.map(item =>
                    item.id === updated.id
                        ? updated
                        : item
                )
            )

            setSelectedQuotation(updated)
            setShowApproveModal(false)
        } catch (err) {
            console.error(
                'Failed to approve quotation:',
                err
            )

            setActionError(
                err instanceof Error
                    ? err.message
                    : 'Failed to approve quotation.'
            )
        } finally {
            setActionLoading(false)
        }
    }

    const openRejectModal = (
        quotation: Quotation
    ) => {
        setSelectedQuotation(quotation)
        setRejectReason(
            quotation.rejectionReason || ''
        )
        setActionError(null)
        setShowRejectModal(true)
    }

    const handleReject = async (
        event: React.FormEvent
    ) => {
        event.preventDefault()

        if (!selectedQuotation) {
            return
        }

        if (!rejectReason.trim()) {
            setActionError(
                'Please provide a rejection reason.'
            )
            return
        }

        try {
            setActionLoading(true)
            setActionError(null)

            const updated =
                await rejectQuotation(
                    selectedQuotation.id,
                    {
                        reason:
                            rejectReason.trim(),
                    }
                )

            setQuotations(current =>
                current.map(item =>
                    item.id === updated.id
                        ? updated
                        : item
                )
            )

            setSelectedQuotation(updated)
            setShowRejectModal(false)
        } catch (err) {
            console.error(
                'Failed to reject quotation:',
                err
            )

            setActionError(
                err instanceof Error
                    ? err.message
                    : 'Failed to reject quotation.'
            )
        } finally {
            setActionLoading(false)
        }
    }

    const handleConvertToOrder = async (
        quotation: Quotation
    ) => {
        if (
            quotation.status !==
            'APPROVED'
        ) {
            return
        }

        const confirmed =
            window.confirm(
                `Convert quotation ${quotation.quotationNumber} into an order?`
            )

        if (!confirmed) {
            return
        }

        try {
            setActionLoading(true)
            setActionError(null)

            await convertQuotationToOrder(
                quotation.id
            )

            await loadQuotations()

            setSelectedQuotation(null)
            setShowDetails(false)
        } catch (err) {
            console.error(
                'Failed to convert quotation to order:',
                err
            )

            setActionError(
                err instanceof Error
                    ? err.message
                    : 'Failed to convert quotation into an order.'
            )
        } finally {
            setActionLoading(false)
        }
    }

    const openDetails = (
        quotation: Quotation
    ) => {
        setSelectedQuotation(quotation)
        setActionError(null)
        setShowDetails(true)
    }

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">

                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold font-display text-[#0f172a]">
                            Quotation Management
                        </h1>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
              Live MySQL
            </span>
                    </div>

                    <p className="text-sm text-[#64748b] mt-0.5">
                        Review customer quotation requests and convert approved quotations into orders.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        void loadQuotations()
                    }}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-semibold border border-[#e2e8f0] rounded-lg text-[#334155] hover:bg-[#f1f5f9] transition-colors disabled:opacity-50 flex items-center gap-2"
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

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
                    {error}
                </div>
            )}

            {actionError &&
                !showApproveModal &&
                !showRejectModal && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
                        {actionError}
                    </div>
                )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
                    <div className="text-xs text-[#94a3b8] font-medium">
                        Pending
                    </div>

                    <div className="text-2xl font-bold font-display text-[#0f172a] mt-1">
                        {pendingCount}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
                    <div className="text-xs text-[#94a3b8] font-medium">
                        Under Review
                    </div>

                    <div className="text-2xl font-bold font-display text-blue-600 mt-1">
                        {reviewCount}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
                    <div className="text-xs text-[#94a3b8] font-medium">
                        Approved
                    </div>

                    <div className="text-2xl font-bold font-display text-emerald-600 mt-1">
                        {approvedCount}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
                    <div className="text-xs text-[#94a3b8] font-medium">
                        Converted to Orders
                    </div>

                    <div className="text-2xl font-bold font-display text-purple-600 mt-1">
                        {convertedCount}
                    </div>
                </div>

            </div>

            {/* Search / Filter */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 flex gap-3 flex-wrap">

                <div className="flex-1 min-w-64 relative">
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
                        type="text"
                        value={search}
                        onChange={event =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search quotation, customer, company, garment..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-[#f8fafc]"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={event =>
                        setStatusFilter(
                            event.target.value as
                                | 'ALL'
                                | QuotationStatus
                        )
                    }
                    className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none bg-[#f8fafc] text-[#334155]"
                >
                    <option value="ALL">
                        All Status
                    </option>

                    <option value="PENDING">
                        Pending
                    </option>

                    <option value="UNDER_REVIEW">
                        Under Review
                    </option>

                    <option value="APPROVED">
                        Approved
                    </option>

                    <option value="REJECTED">
                        Rejected
                    </option>

                    <option value="CONVERTED_TO_ORDER">
                        Converted to Order
                    </option>
                </select>

            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">

                {loading ? (
                    <div className="p-12 text-center text-[#64748b]">
                        Loading quotations from database...
                    </div>
                ) : filteredQuotations.length === 0 ? (
                    <div className="p-12 text-center">

                        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
                            <svg
                                className="w-6 h-6 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>

                        <p className="text-sm font-medium text-[#334155]">
                            No quotations found
                        </p>

                        <p className="text-xs text-[#94a3b8] mt-1">
                            Customer quotation requests will appear here.
                        </p>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead>
                            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">

                                <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                                    Quotation
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                                    Customer
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">
                                    Garment
                                </th>

                                <th className="text-right px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                                    Qty
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden md:table-cell">
                                    Delivery
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                                    Actions
                                </th>

                            </tr>
                            </thead>

                            <tbody>

                            {filteredQuotations.map(
                                quotation => (
                                    <tr
                                        key={quotation.id}
                                        className="border-t border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                                    >

                                        <td className="px-5 py-3.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openDetails(
                                                        quotation
                                                    )
                                                }
                                                className="text-left"
                                            >
                          <span className="font-semibold text-blue-600 hover:text-blue-700">
                            {quotation.quotationNumber}
                          </span>

                                                <p className="text-xs text-[#94a3b8] mt-0.5">
                                                    {formatDate(
                                                        quotation.createdAt
                                                    )}
                                                </p>
                                            </button>
                                        </td>

                                        <td className="px-4 py-3.5">

                                            <p className="font-medium text-[#334155]">
                                                {quotation.customer?.name ||
                                                    '-'}
                                            </p>

                                            <p className="text-xs text-[#94a3b8] mt-0.5">
                                                {quotation.customer?.company ||
                                                    quotation.customer?.email ||
                                                    '-'}
                                            </p>

                                        </td>

                                        <td className="px-4 py-3.5 hidden lg:table-cell">

                                            <p className="font-medium text-[#334155]">
                                                {quotation.garmentType}
                                            </p>

                                            {quotation.fabric && (
                                                <p className="text-xs text-[#94a3b8] mt-0.5">
                                                    {quotation.fabric}
                                                </p>
                                            )}

                                        </td>

                                        <td className="px-4 py-3.5 text-right font-semibold text-[#0f172a]">
                                            {quotation.quantity}
                                        </td>

                                        <td className="px-4 py-3.5 text-[#64748b] hidden md:table-cell">
                                            {formatDate(
                                                quotation.confirmedDeliveryDate ||
                                                quotation.requestedDeliveryDate
                                            )}
                                        </td>

                                        <td className="px-4 py-3.5">

                        <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                                quotation.status
                            )}`}
                        >
                          {getStatusLabel(
                              quotation.status
                          )}
                        </span>

                                        </td>

                                        <td className="px-5 py-3.5">

                                            <div className="flex items-center gap-1">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDetails(
                                                            quotation
                                                        )
                                                    }
                                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#475569] hover:bg-[#f1f5f9]"
                                                >
                                                    View
                                                </button>

                                                {quotation.status ===
                                                    'PENDING' && (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                actionLoading
                                                            }
                                                            onClick={() =>
                                                                void handleStartReview(
                                                                    quotation
                                                                )
                                                            }
                                                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                                        >
                                                            Review
                                                        </button>
                                                    )}

                                                {quotation.status ===
                                                    'UNDER_REVIEW' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                                onClick={() =>
                                                                    openApproveModal(
                                                                        quotation
                                                                    )
                                                                }
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                                onClick={() =>
                                                                    openRejectModal(
                                                                        quotation
                                                                    )
                                                                }
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}

                                                {quotation.status ===
                                                    'APPROVED' && (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                actionLoading
                                                            }
                                                            onClick={() =>
                                                                void handleConvertToOrder(
                                                                    quotation
                                                                )
                                                            }
                                                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                                                        >
                                                            Convert
                                                        </button>
                                                    )}

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

            {/* Details Modal */}
            {showDetails &&
                selectedQuotation && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">

                            <div className="flex items-center justify-between p-6 border-b border-[#e2e8f0]">

                                <div>
                                    <h2 className="text-lg font-bold font-display text-[#0f172a]">
                                        {selectedQuotation.quotationNumber}
                                    </h2>

                                    <p className="text-sm text-[#64748b] mt-0.5">
                                        Quotation Details
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDetails(false)
                                    }
                                    className="text-[#94a3b8] hover:text-[#0f172a]"
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
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>

                            </div>

                            <div className="p-6 space-y-5">

                                {/* Status */}
                                <div className="flex items-center justify-between gap-3 flex-wrap">

                  <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusClass(
                          selectedQuotation.status
                      )}`}
                  >
                    {getStatusLabel(
                        selectedQuotation.status
                    )}
                  </span>

                                    {selectedQuotation.priority && (
                                        <span
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getPriorityClass(
                                                selectedQuotation.priority
                                            )}`}
                                        >
                      Priority:{' '}
                                            {getPriorityLabel(
                                                selectedQuotation.priority
                                            )}
                    </span>
                                    )}

                                </div>

                                {/* Customer */}
                                <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4">

                                    <h3 className="text-sm font-semibold text-[#0f172a] mb-3">
                                        Customer
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">

                                        <div>
                      <span className="text-xs text-[#94a3b8]">
                        Name
                      </span>

                                            <p className="font-medium text-[#334155]">
                                                {selectedQuotation.customer?.name ||
                                                    '-'}
                                            </p>
                                        </div>

                                        <div>
                      <span className="text-xs text-[#94a3b8]">
                        Company
                      </span>

                                            <p className="font-medium text-[#334155]">
                                                {selectedQuotation.customer?.company ||
                                                    '-'}
                                            </p>
                                        </div>

                                        <div>
                      <span className="text-xs text-[#94a3b8]">
                        Email
                      </span>

                                            <p className="font-medium text-[#334155]">
                                                {selectedQuotation.customer?.email ||
                                                    '-'}
                                            </p>
                                        </div>

                                        <div>
                      <span className="text-xs text-[#94a3b8]">
                        Contact
                      </span>

                                            <p className="font-medium text-[#334155]">
                                                {selectedQuotation.customer?.contact ||
                                                    '-'}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                {/* Product */}
                                <div>

                                    <h3 className="text-sm font-semibold text-[#0f172a] mb-3">
                                        Quotation Request
                                    </h3>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                                        <div className="bg-[#f8fafc] rounded-lg p-3">
                      <span className="text-xs text-[#94a3b8]">
                        Garment
                      </span>

                                            <p className="font-semibold text-sm text-[#334155] mt-1">
                                                {selectedQuotation.garmentType}
                                            </p>
                                        </div>

                                        <div className="bg-[#f8fafc] rounded-lg p-3">
                      <span className="text-xs text-[#94a3b8]">
                        Quantity
                      </span>

                                            <p className="font-semibold text-sm text-[#334155] mt-1">
                                                {selectedQuotation.quantity}
                                            </p>
                                        </div>

                                        <div className="bg-[#f8fafc] rounded-lg p-3">
                      <span className="text-xs text-[#94a3b8]">
                        Fabric
                      </span>

                                            <p className="font-semibold text-sm text-[#334155] mt-1">
                                                {selectedQuotation.fabric ||
                                                    '-'}
                                            </p>
                                        </div>

                                        <div className="bg-[#f8fafc] rounded-lg p-3">
                      <span className="text-xs text-[#94a3b8]">
                        Color
                      </span>

                                            <p className="font-semibold text-sm text-[#334155] mt-1">
                                                {selectedQuotation.color ||
                                                    '-'}
                                            </p>
                                        </div>

                                        <div className="bg-[#f8fafc] rounded-lg p-3">
                      <span className="text-xs text-[#94a3b8]">
                        Size
                      </span>

                                            <p className="font-semibold text-sm text-[#334155] mt-1">
                                                {selectedQuotation.size ||
                                                    '-'}
                                            </p>
                                        </div>

                                        <div className="bg-[#f8fafc] rounded-lg p-3">
                      <span className="text-xs text-[#94a3b8]">
                        Requested Delivery
                      </span>

                                            <p className="font-semibold text-sm text-[#334155] mt-1">
                                                {formatDate(
                                                    selectedQuotation.requestedDeliveryDate
                                                )}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                {/* Pricing */}
                                <div>

                                    <h3 className="text-sm font-semibold text-[#0f172a] mb-3">
                                        Pricing
                                    </h3>

                                    <div className="grid grid-cols-2 gap-3">

                                        <div className="bg-[#f8fafc] rounded-lg p-3">
                      <span className="text-xs text-[#94a3b8]">
                        Unit Price
                      </span>

                                            <p className="font-semibold text-sm text-[#334155] mt-1">
                                                {selectedQuotation.unitPrice != null
                                                    ? formatCurrency(
                                                        selectedQuotation.unitPrice
                                                    )
                                                    : '-'}
                                            </p>
                                        </div>

                                        <div className="bg-[#f8fafc] rounded-lg p-3">
                      <span className="text-xs text-[#94a3b8]">
                        Total Price
                      </span>

                                            <p className="font-semibold text-sm text-[#334155] mt-1">
                                                {selectedQuotation.totalPrice != null
                                                    ? formatCurrency(
                                                        selectedQuotation.totalPrice
                                                    )
                                                    : '-'}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                {/* Customer Message */}
                                {selectedQuotation.customerMessage && (
                                    <div>

                                        <h3 className="text-sm font-semibold text-[#0f172a] mb-2">
                                            Customer Message
                                        </h3>

                                        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3 text-sm text-[#475569] whitespace-pre-wrap">
                                            {
                                                selectedQuotation.customerMessage
                                            }
                                        </div>

                                    </div>
                                )}

                                {/* Rejection Reason */}
                                {selectedQuotation.rejectionReason && (
                                    <div>

                                        <h3 className="text-sm font-semibold text-red-700 mb-2">
                                            Rejection Reason
                                        </h3>

                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                                            {
                                                selectedQuotation.rejectionReason
                                            }
                                        </div>

                                    </div>
                                )}

                                {/* Confirmed Delivery */}
                                {selectedQuotation.confirmedDeliveryDate && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">

                    <span className="text-xs text-emerald-600">
                      Confirmed Delivery Date
                    </span>

                                        <p className="font-semibold text-emerald-800 mt-1">
                                            {formatDate(
                                                selectedQuotation.confirmedDeliveryDate
                                            )}
                                        </p>

                                    </div>
                                )}

                                {/* Actions */}
                                <div className="pt-4 border-t border-[#e2e8f0] flex justify-end gap-2 flex-wrap">

                                    {selectedQuotation.status ===
                                        'PENDING' && (
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() =>
                                                    void handleStartReview(
                                                        selectedQuotation
                                                    )
                                                }
                                                className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {actionLoading
                                                    ? 'Processing...'
                                                    : 'Start Review'}
                                            </button>
                                        )}

                                    {selectedQuotation.status ===
                                        'UNDER_REVIEW' && (
                                            <>
                                                <button
                                                    type="button"
                                                    disabled={actionLoading}
                                                    onClick={() =>
                                                        openRejectModal(
                                                            selectedQuotation
                                                        )
                                                    }
                                                    className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={actionLoading}
                                                    onClick={() =>
                                                        openApproveModal(
                                                            selectedQuotation
                                                        )
                                                    }
                                                    className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                            </>
                                        )}

                                    {selectedQuotation.status ===
                                        'APPROVED' && (
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() =>
                                                    void handleConvertToOrder(
                                                        selectedQuotation
                                                    )
                                                }
                                                className="px-4 py-2 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                Convert to Order
                                            </button>
                                        )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDetails(false)
                                        }
                                        className="px-4 py-2 text-sm font-semibold border border-[#e2e8f0] text-[#475569] rounded-lg hover:bg-[#f8fafc]"
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

            {/* Approve Modal */}
            {showApproveModal &&
                selectedQuotation && (
                    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">

                            <div className="flex items-center justify-between mb-5">

                                <div>
                                    <h2 className="text-lg font-bold font-display text-[#0f172a]">
                                        Approve Quotation
                                    </h2>

                                    <p className="text-xs text-[#64748b] mt-1">
                                        {selectedQuotation.quotationNumber}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowApproveModal(false)
                                    }
                                    className="text-[#94a3b8] hover:text-[#0f172a]"
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
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>

                            </div>

                            {actionError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                                    {actionError}
                                </div>
                            )}

                            <form
                                onSubmit={handleApprove}
                                className="space-y-4"
                            >

                                <div>
                                    <label className="block text-xs font-semibold text-[#475569] mb-1">
                                        Unit Price *
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={approveUnitPrice}
                                        onChange={event =>
                                            setApproveUnitPrice(
                                                event.target.value
                                            )
                                        }
                                        placeholder="e.g. 2500"
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#475569] mb-1">
                                        Confirmed Delivery Date *
                                    </label>

                                    <input
                                        type="date"
                                        required
                                        value={approveDeliveryDate}
                                        onChange={event =>
                                            setApproveDeliveryDate(
                                                event.target.value
                                            )
                                        }
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#475569] mb-1">
                                        Priority *
                                    </label>

                                    <select
                                        value={approvePriority}
                                        onChange={event =>
                                            setApprovePriority(
                                                event.target.value as Priority
                                            )
                                        }
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="LOW">
                                            Low
                                        </option>

                                        <option value="MEDIUM">
                                            Medium
                                        </option>

                                        <option value="HIGH">
                                            High
                                        </option>
                                    </select>
                                </div>

                                <div className="pt-3 border-t border-[#e2e8f0] flex justify-end gap-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowApproveModal(false)
                                        }
                                        className="px-4 py-2 text-sm font-semibold text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {actionLoading
                                            ? 'Approving...'
                                            : 'Approve Quotation'}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )}

            {/* Reject Modal */}
            {showRejectModal &&
                selectedQuotation && (
                    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">

                            <div className="flex items-center justify-between mb-5">

                                <div>
                                    <h2 className="text-lg font-bold font-display text-[#0f172a]">
                                        Reject Quotation
                                    </h2>

                                    <p className="text-xs text-[#64748b] mt-1">
                                        {selectedQuotation.quotationNumber}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowRejectModal(false)
                                    }
                                    className="text-[#94a3b8] hover:text-[#0f172a]"
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
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>

                            </div>

                            {actionError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                                    {actionError}
                                </div>
                            )}

                            <form
                                onSubmit={handleReject}
                                className="space-y-4"
                            >

                                <div>
                                    <label className="block text-xs font-semibold text-[#475569] mb-1">
                                        Rejection Reason *
                                    </label>

                                    <textarea
                                        required
                                        rows={5}
                                        value={rejectReason}
                                        onChange={event =>
                                            setRejectReason(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter the reason for rejecting this quotation..."
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                    />
                                </div>

                                <div className="pt-3 border-t border-[#e2e8f0] flex justify-end gap-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowRejectModal(false)
                                        }
                                        className="px-4 py-2 text-sm font-semibold text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {actionLoading
                                            ? 'Rejecting...'
                                            : 'Reject Quotation'}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )}

        </div>
    )
}