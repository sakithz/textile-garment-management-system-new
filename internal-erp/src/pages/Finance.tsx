import { useEffect, useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import {
  fetchAllInvoices,
  createInvoice,
  deleteInvoice,
  fetchAllPayments,
  verifyPayment,
  rejectPayment,
  type BackendInvoice,
  type BackendPayment,
} from '../services/financeApi'

import {
  fetchAllOrders,
  type FrontendOrder,
} from '../services/orderApi'


// ============================================================
// HELPERS
// ============================================================
const getTodayDate = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
};

const formatCurrency = (
    value: number | null | undefined
) => {

    return new Intl.NumberFormat(
        'en-LK',
        {
            style: 'currency',
            currency: 'LKR',
            maximumFractionDigits: 2,
        }
    ).format(value ?? 0)
}


const formatDate = (
    value: string | null | undefined
) => {

  if (!value) {
    return '—'
  }

  const date =
      new Date(value)

  if (
      Number.isNaN(
          date.getTime()
      )
  ) {
    return value
  }

  return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
  )
}


const statusClass: Record<
    string,
    string
> = {

  PAID:
      'bg-green-100 text-green-700',

  PENDING:
      'bg-blue-100 text-blue-700',

  OVERDUE:
      'bg-red-100 text-red-700',

  PARTIAL:
      'bg-amber-100 text-amber-700',
}


const paymentStatusClass: Record<
    string,
    string
> = {

  PENDING:
      'bg-amber-100 text-amber-700',

  VERIFIED:
      'bg-green-100 text-green-700',

  REJECTED:
      'bg-red-100 text-red-700',
}


const paymentMethodLabel = (
    method: string
) => {

  return method
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(
          /\b\w/g,
          letter =>
              letter.toUpperCase()
      )
}


// ============================================================
// COMPONENT
// ============================================================

export default function Finance() {

  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const [
    invoices,
    setInvoices,
  ] = useState<BackendInvoice[]>([])

  const [
    orders,
    setOrders,
  ] = useState<FrontendOrder[]>([])

  const [
    payments,
    setPayments,
  ] = useState<BackendPayment[]>([])


  // ----------------------------------------------------------
  // UI STATE
  // ----------------------------------------------------------

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    isLiveDb,
    setIsLiveDb,
  ] = useState(false)

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all')

  const [
    activeTab,
    setActiveTab,
  ] = useState<
      'invoices' | 'payments'
  >('invoices')


  // ----------------------------------------------------------
  // CREATE INVOICE MODAL
  // ----------------------------------------------------------

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState(false)

  const [
    submitting,
    setSubmitting,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<string | null>(null)


  // ----------------------------------------------------------
  // CREATE INVOICE FORM
  // ----------------------------------------------------------

  const [
    selectedOrderId,
    setSelectedOrderId,
  ] = useState('')

  const [
    invoiceDate,
    setInvoiceDate,
  ] = useState(
      new Date()
          .toISOString()
          .split('T')[0]
  )

  const [
    dueDate,
    setDueDate,
  ] = useState(
      new Date(
          Date.now() +
          30 *
          24 *
          60 *
          60 *
          1000
      )
          .toISOString()
          .split('T')[0]
  )


  // ----------------------------------------------------------
  // PAYMENT REJECTION MODAL
  // ----------------------------------------------------------

  const [
    rejectingPayment,
    setRejectingPayment,
  ] = useState<BackendPayment | null>(null)

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState('')


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData = async () => {

    try {

      setLoading(true)
      setError(null)

      const [
        invoiceData,
        orderData,
        paymentData,
      ] = await Promise.all([
        fetchAllInvoices(),
        fetchAllOrders(),
        fetchAllPayments(),
      ])

      setInvoices(
          invoiceData
      )

      setOrders(
          orderData
      )

      setPayments(
          paymentData
      )

      setIsLiveDb(true)

    } catch (err) {

      console.error(
          'Finance data loading failed:',
          err
      )

      setInvoices([])
      setOrders([])
      setPayments([])

      setIsLiveDb(false)

      setError(
          err instanceof Error
              ? err.message
              : 'Unable to load Finance data.'
      )

    } finally {

      setLoading(false)
    }
  }


  useEffect(() => {

    void loadData()

  }, [])


  // ==========================================================
  // INVOICED ORDER IDS
  // ==========================================================

  const invoicedOrderIds =
      useMemo(
          () =>
              new Set(
                  invoices.map(
                      invoice =>
                          invoice.orderId
                  )
              ),
          [invoices]
      )


  // ==========================================================
  // ORDERS ELIGIBLE FOR INVOICE
  // ==========================================================

  const invoiceableOrders =
      useMemo(
          () => {

            return orders.filter(
                order => {

                  const completed =
                      order.status === 'ready' ||
                      order.status === 'delivered'

                  const alreadyInvoiced =
                      invoicedOrderIds.has(
                          order.id
                      )

                  return (
                      completed &&
                      !alreadyInvoiced
                  )
                }
            )
          },
          [
            orders,
            invoicedOrderIds,
          ]
      )


  // ==========================================================
  // SELECTED ORDER
  // ==========================================================

  const selectedOrder =
      useMemo(
          () =>
              orders.find(
                  order =>
                      order.id ===
                      selectedOrderId
              ) ?? null,
          [
            orders,
            selectedOrderId,
          ]
      )


  // ==========================================================
  // FILTER INVOICES
  // ==========================================================

  const filteredInvoices =
      useMemo(
          () => {

            const query =
                search
                    .trim()
                    .toLowerCase()

            return invoices.filter(
                invoice => {

                  const matchesSearch =
                      !query ||
                      invoice.invoiceNumber
                          .toLowerCase()
                          .includes(query) ||
                      invoice.orderId
                          .toLowerCase()
                          .includes(query) ||
                      invoice.customer
                          .toLowerCase()
                          .includes(query) ||
                      (
                          invoice.campaignName ??
                          ''
                      )
                          .toLowerCase()
                          .includes(query)

                  const matchesStatus =
                      statusFilter === 'all' ||
                      invoice.status.toLowerCase() ===
                      statusFilter.toLowerCase()

                  return (
                      matchesSearch &&
                      matchesStatus
                  )
                }
            )
          },
          [
            invoices,
            search,
            statusFilter,
          ]
      )


  // ==========================================================
  // FINANCIAL TOTALS
  // ==========================================================

  const totalRevenue =
      invoices.reduce(
          (
              total,
              invoice
          ) =>
              total +
              (
                  invoice.amount ??
                  0
              ),
          0
      )


  const totalPaid =
      invoices.reduce(
          (
              total,
              invoice
          ) =>
              total +
              (
                  invoice.amountPaid ??
                  0
              ),
          0
      )


  const totalBalance =
      invoices.reduce(
          (
              total,
              invoice
          ) =>
              total +
              (
                  invoice.balanceDue ??
                  0
              ),
          0
      )


  const totalDiscount =
      invoices.reduce(
          (
              total,
              invoice
          ) =>
              total +
              (
                  invoice.discountAmount ??
                  0
              ),
          0
      )


  // ==========================================================
  // REVENUE TREND
  // ==========================================================

  const revenueData =
      useMemo(
          () => {

            const grouped:
                Record<
                    string,
                    number
                > = {}

            invoices.forEach(
                invoice => {

                  const date =
                      new Date(
                          invoice.date
                      )

                  if (
                      Number.isNaN(
                          date.getTime()
                      )
                  ) {
                    return
                  }

                  const key =
                      date.toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            year: 'numeric',
                          }
                      )

                  grouped[key] =
                      (
                          grouped[key] ??
                          0
                      ) +
                      (
                          invoice.amount ??
                          0
                      )
                }
            )

            return Object.entries(
                grouped
            )
                .map(
                    ([
                       month,
                       revenue,
                     ]) => ({
                      month,
                      revenue,
                    })
                )
                .slice(-8)

          },
          [invoices]
      )


  // ==========================================================
  // CREATE INVOICE
  // ==========================================================

  const handleCreateInvoice =
      async (
          event: React.FormEvent
      ) => {

        event.preventDefault()

        if (!selectedOrderId) {

          setError(
              'Please select an eligible order.'
          )

          return
        }

        try {

          setSubmitting(true)
          setError(null)

          await createInvoice({
            orderId:
            selectedOrderId,

            date:
            invoiceDate,

            dueDate:
            dueDate,
          })

          setSelectedOrderId('')

          setIsCreateModalOpen(false)

          await loadData()

        } catch (err) {

          setError(
              err instanceof Error
                  ? err.message
                  : 'Failed to create invoice.'
          )

        } finally {

          setSubmitting(false)
        }
      }


  // ==========================================================
  // DELETE INVOICE
  // ==========================================================

  const handleDeleteInvoice =
      async (
          invoice: BackendInvoice
      ) => {

        if (
            !window.confirm(
                `Delete invoice ${invoice.invoiceNumber}?`
            )
        ) {
          return
        }

        try {

          await deleteInvoice(
              invoice.id
          )

          await loadData()

        } catch (err) {

          setError(
              err instanceof Error
                  ? err.message
                  : 'Failed to delete invoice.'
          )
        }
      }


  // ==========================================================
  // VERIFY PAYMENT
  // ==========================================================

  const handleVerifyPayment =
      async (
          payment: BackendPayment
      ) => {

        if (
            !window.confirm(
                `Verify payment of ${formatCurrency(
                    payment.amountPaid
                )}?`
            )
        ) {
          return
        }

        try {

          await verifyPayment(
              payment.id
          )

          await loadData()

        } catch (err) {

          setError(
              err instanceof Error
                  ? err.message
                  : 'Failed to verify payment.'
          )
        }
      }


  // ==========================================================
  // REJECT PAYMENT
  // ==========================================================

  const handleRejectPayment =
      async () => {

        if (!rejectingPayment) {
          return
        }

        if (
            !rejectionReason.trim()
        ) {

          return
        }

        try {

          await rejectPayment(
              rejectingPayment.id,
              rejectionReason.trim()
          )

          setRejectingPayment(
              null
          )

          setRejectionReason('')

          await loadData()

        } catch (err) {

          setError(
              err instanceof Error
                  ? err.message
                  : 'Failed to reject payment.'
          )
        }
      }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
      <div className="space-y-5">

        {/* ======================================================
          HEADER
          ====================================================== */}

        <div className="flex items-center justify-between gap-4 flex-wrap">

          <div>

            <h1 className="text-2xl font-bold font-display text-[#0f172a]">
              Finance &amp; Billing
            </h1>

            <div className="flex items-center gap-2 mt-1">

              <p className="text-sm text-[#64748b]">
                Invoices, payments and billing overview
              </p>

              {isLiveDb ? (

                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Live MySQL DB
              </span>

              ) : (

                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                ● Database unavailable
              </span>
              )}

            </div>

          </div>


          <button
              onClick={() => {
                setError(null)
                setSelectedOrderId('')
                setIsCreateModalOpen(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
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

            Create Invoice

          </button>

        </div>


        {/* ======================================================
          ERROR
          ====================================================== */}

        {error && (

            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">

              {error}

            </div>

        )}


        {/* ======================================================
          SUMMARY CARDS
          ====================================================== */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-white rounded-xl p-5 border border-[#e2e8f0]">

            <div className="text-xs text-[#94a3b8] uppercase tracking-wider mb-2">
              Invoice Revenue
            </div>

            <div className="text-2xl font-bold font-display text-blue-600">
              {formatCurrency(
                  totalRevenue
              )}
            </div>

          </div>


          <div className="bg-white rounded-xl p-5 border border-[#e2e8f0]">

            <div className="text-xs text-[#94a3b8] uppercase tracking-wider mb-2">
              Verified Paid
            </div>

            <div className="text-2xl font-bold font-display text-green-600">
              {formatCurrency(
                  totalPaid
              )}
            </div>

          </div>


          <div className="bg-white rounded-xl p-5 border border-[#e2e8f0]">

            <div className="text-xs text-[#94a3b8] uppercase tracking-wider mb-2">
              Balance Due
            </div>

            <div className="text-2xl font-bold font-display text-amber-600">
              {formatCurrency(
                  totalBalance
              )}
            </div>

          </div>


          <div className="bg-white rounded-xl p-5 border border-[#e2e8f0]">

            <div className="text-xs text-[#94a3b8] uppercase tracking-wider mb-2">
              Discounts Given
            </div>

            <div className="text-2xl font-bold font-display text-purple-600">
              {formatCurrency(
                  totalDiscount
              )}
            </div>

          </div>

        </div>


        {/* ======================================================
          REVENUE TREND
          ====================================================== */}

        <div className="bg-white rounded-xl p-5 border border-[#e2e8f0]">

          <h3 className="font-semibold font-display text-[#0f172a] mb-4">
            Revenue Trend
          </h3>

          {revenueData.length === 0 ? (

              <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">
                No invoice data available yet.
              </div>

          ) : (

              <ResponsiveContainer
                  width="100%"
                  height={220}
              >

                <AreaChart
                    data={revenueData}
                >

                  <defs>

                    <linearGradient
                        id="financeRevenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >

                      <stop
                          offset="5%"
                          stopColor="#2563eb"
                          stopOpacity={0.18}
                      />

                      <stop
                          offset="95%"
                          stopColor="#2563eb"
                          stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                  />

                  <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 11,
                        fill: '#94a3b8',
                      }}
                      axisLine={false}
                      tickLine={false}
                  />

                  <YAxis
                      tick={{
                        fontSize: 11,
                        fill: '#94a3b8',
                      }}
                      axisLine={false}
                      tickLine={false}
                  />

                  <Tooltip
                      formatter={(
                          value
                      ) =>
                          formatCurrency(
                              Number(value)
                          )
                      }
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border:
                            '1px solid #e2e8f0',
                      }}
                  />

                  <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fill="url(#financeRevenueGradient)"
                  />

                </AreaChart>

              </ResponsiveContainer>

          )}

        </div>


        {/* ======================================================
          TABS
          ====================================================== */}

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-2 flex gap-2">

          <button
              onClick={() =>
                  setActiveTab('invoices')
              }
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'invoices'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            Invoices
            <span className="ml-2 opacity-70">
            {invoices.length}
          </span>
          </button>


          <button
              onClick={() =>
                  setActiveTab('payments')
              }
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'payments'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            Payments
            <span className="ml-2 opacity-70">
            {payments.length}
          </span>
          </button>

        </div>


        {/* ======================================================
          INVOICES
          ====================================================== */}

        {activeTab === 'invoices' && (

            <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">

              {/* FILTER BAR */}

              <div className="p-4 flex gap-3 flex-wrap border-b border-slate-100">

                <div className="flex-1 min-w-[220px] relative">

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
                      onChange={event =>
                          setSearch(
                              event.target.value
                          )
                      }
                      placeholder="Search invoice, order, customer or offer..."
                      className="w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-[#f8fafc]"
                  />

                </div>


                <select
                    value={statusFilter}
                    onChange={event =>
                        setStatusFilter(
                            event.target.value
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

                  <option value="partial">
                    Partial
                  </option>

                  <option value="paid">
                    Paid
                  </option>

                  <option value="overdue">
                    Overdue
                  </option>

                </select>

              </div>


              {/* TABLE */}

              {loading ? (

                  <div className="p-12 text-center text-sm text-slate-500">
                    Loading Finance data...
                  </div>

              ) : filteredInvoices.length === 0 ? (

                  <div className="p-12 text-center">

                    <div className="text-4xl mb-3">
                      🧾
                    </div>

                    <h3 className="font-semibold text-slate-800">
                      No invoices found
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Create an invoice from a completed order.
                    </p>

                  </div>

              ) : (

                  <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                      <thead className="bg-[#f8fafc]">

                      <tr>

                        <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase">
                          Invoice
                        </th>

                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase">
                          Order
                        </th>

                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase">
                          Customer
                        </th>

                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase">
                          Offer / Discount
                        </th>

                        <th className="text-right px-4 py-3 text-xs font-semibold text-[#64748b] uppercase">
                          Base
                        </th>

                        <th className="text-right px-4 py-3 text-xs font-semibold text-[#64748b] uppercase">
                          Discount
                        </th>

                        <th className="text-right px-4 py-3 text-xs font-semibold text-[#64748b] uppercase">
                          Invoice Total
                        </th>

                        <th className="text-right px-4 py-3 text-xs font-semibold text-[#64748b] uppercase">
                          Balance
                        </th>

                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase">
                          Status
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold text-[#64748b] uppercase text-right">
                          Actions
                        </th>

                      </tr>

                      </thead>


                      <tbody>

                      {filteredInvoices.map(
                          invoice => (

                              <tr
                                  key={invoice.id}
                                  className="border-t border-[#f1f5f9] hover:bg-[#f8fafc]"
                              >

                                <td className="px-5 py-4">

                                  <div className="font-semibold text-blue-600">
                                    {invoice.invoiceNumber}
                                  </div>

                                  <div className="text-xs text-slate-400 mt-1">
                                    {formatDate(
                                        invoice.date
                                    )}
                                  </div>

                                </td>


                                <td className="px-4 py-4 font-medium text-slate-700">
                                  {invoice.orderId}
                                </td>


                                <td className="px-4 py-4 text-slate-700">
                                  {invoice.customer}
                                </td>


                                <td className="px-4 py-4">

                                  {invoice.discountAmount &&
                                  invoice.discountAmount > 0 ? (

                                      <div>

                                        <div className="font-medium text-purple-700">
                                          {invoice.campaignName ||
                                              'Offer Discount'}
                                        </div>

                                        <div className="text-xs text-purple-500 mt-1">
                                          {invoice.discountPercent ?? 0}%
                                          discount
                                        </div>

                                      </div>

                                  ) : (

                                      <span className="text-xs text-slate-400">
                              No discount
                            </span>

                                  )}

                                </td>


                                <td className="px-4 py-4 text-right text-slate-600">
                                  {formatCurrency(
                                      invoice.baseAmount ??
                                      invoice.amount
                                  )}
                                </td>


                                <td className="px-4 py-4 text-right">

                                  {invoice.discountAmount &&
                                  invoice.discountAmount > 0 ? (

                                      <span className="font-semibold text-purple-600">
                              -
                                        {formatCurrency(
                                            invoice.discountAmount
                                        )}
                            </span>

                                  ) : (

                                      <span className="text-slate-400">
                              —
                            </span>

                                  )}

                                </td>


                                <td className="px-4 py-4 text-right font-bold text-slate-900">
                                  {formatCurrency(
                                      invoice.amount
                                  )}
                                </td>


                                <td className="px-4 py-4 text-right font-semibold text-amber-700">
                                  {formatCurrency(
                                      invoice.balanceDue
                                  )}
                                </td>


                                <td className="px-4 py-4">

                          <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  statusClass[
                                      invoice.status
                                      ] ??
                                  'bg-slate-100 text-slate-600'
                              }`}
                          >

                            {invoice.status
                                    .charAt(0)
                                    .toUpperCase() +
                                invoice.status
                                    .slice(1)
                                    .toLowerCase()}

                          </span>

                                </td>


                                <td className="px-5 py-4">

                                  <div className="flex justify-end">

                                    <button
                                        onClick={() =>
                                            handleDeleteInvoice(
                                                invoice
                                            )
                                        }
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"
                                        title="Delete invoice"
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
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />

                                      </svg>

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

        )}


        {/* ======================================================
          PAYMENTS
          ====================================================== */}

        {activeTab === 'payments' && (

            <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">

              {payments.length === 0 ? (

                  <div className="p-12 text-center text-sm text-slate-500">
                    No payment records found.
                  </div>

              ) : (

                  <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                      <thead className="bg-[#f8fafc]">

                      <tr>

                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Invoice
                        </th>

                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Order
                        </th>

                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Date
                        </th>

                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Method
                        </th>

                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Amount
                        </th>

                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Reference
                        </th>

                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Status
                        </th>

                        <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Actions
                        </th>

                      </tr>

                      </thead>


                      <tbody>

                      {payments.map(
                          payment => (

                              <tr
                                  key={payment.id}
                                  className="border-t border-slate-100"
                              >

                                <td className="px-5 py-4 font-semibold text-blue-600">
                                  {payment.invoiceNumber || '—'}
                                </td>

                                <td className="px-4 py-4 text-slate-700">
                                  {payment.orderId || '—'}
                                </td>

                                <td className="px-4 py-4 text-slate-500">
                                  {formatDate(
                                      payment.paymentDate
                                  )}
                                </td>

                                <td className="px-4 py-4 text-slate-700">
                                  {paymentMethodLabel(
                                      payment.paymentMethod
                                  )}
                                </td>

                                <td className="px-4 py-4 text-right font-semibold text-slate-900">
                                  {formatCurrency(
                                      payment.amountPaid
                                  )}
                                </td>

                                <td className="px-4 py-4 text-slate-500">
                                  {payment.referenceNo || '—'}
                                </td>

                                <td className="px-4 py-4">

                          <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  paymentStatusClass[
                                      payment.status
                                      ]
                              }`}
                          >

                            {payment.status
                                    .charAt(0)
                                    .toUpperCase() +
                                payment.status
                                    .slice(1)
                                    .toLowerCase()}

                          </span>

                                </td>

                                <td className="px-5 py-4">

                                  {payment.status ===
                                      'PENDING' && (

                                          <div className="flex justify-end gap-2">

                                            <button
                                                onClick={() =>
                                                    handleVerifyPayment(
                                                        payment
                                                    )
                                                }
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                                            >
                                              Verify
                                            </button>

                                            <button
                                                onClick={() => {
                                                  setRejectingPayment(
                                                      payment
                                                  )
                                                  setRejectionReason('')
                                                }}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                            >
                                              Reject
                                            </button>

                                          </div>

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

        )}


        {/* ======================================================
          CREATE INVOICE MODAL
          ====================================================== */}

        {isCreateModalOpen && (

            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

              <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6">

                <div className="flex items-center justify-between mb-5">

                  <div>

                    <h2 className="text-xl font-bold font-display text-slate-900">
                      Create Invoice
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      Select a completed order. Customer, amount and discount are taken from the database.
                    </p>

                  </div>

                  <button
                      onClick={() =>
                          setIsCreateModalOpen(false)
                      }
                      className="text-slate-400 hover:text-slate-600"
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


                <form
                    onSubmit={
                      handleCreateInvoice
                    }
                    className="space-y-4"
                >

                  <div>

                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Completed Order *
                    </label>

                    <select
                        required
                        value={selectedOrderId}
                        onChange={event =>
                            setSelectedOrderId(
                                event.target.value
                            )
                        }
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                    >

                      <option value="">
                        Select completed order
                      </option>

                      {invoiceableOrders.map(
                          order => (

                              <option
                                  key={order.id}
                                  value={order.id}
                              >
                                {order.id} — {order.customer} — {order.garmentType}
                              </option>

                          )
                      )}

                    </select>

                    {invoiceableOrders.length === 0 && (

                        <p className="text-xs text-amber-600 mt-2">
                          No READY or DELIVERED orders are currently available for invoicing.
                        </p>

                    )}

                  </div>


                  {selectedOrder && (

                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-3">

                        <div className="flex justify-between">

                    <span className="text-xs text-slate-500">
                      Customer
                    </span>

                          <span className="text-sm font-semibold text-slate-800">
                      {selectedOrder.customer}
                    </span>

                        </div>


                        <div className="flex justify-between">

                    <span className="text-xs text-slate-500">
                      Garment
                    </span>

                          <span className="text-sm font-medium text-slate-800">
                      {selectedOrder.garmentType}
                    </span>

                        </div>


                        <div className="flex justify-between">

                    <span className="text-xs text-slate-500">
                      Quantity
                    </span>

                          <span className="text-sm font-medium text-slate-800">
                      {selectedOrder.quantity.toLocaleString()}
                    </span>

                        </div>


                        <div className="flex justify-between border-t border-blue-100 pt-3">

                    <span className="text-xs text-slate-500">
                      Order Total
                    </span>

                          <span className="text-base font-bold text-blue-700">
                      {formatCurrency(
                          selectedOrder.total
                      )}
                    </span>

                        </div>

                      </div>

                  )}


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Invoice Date
                      </label>

                      <input
                          type="date"
                          value={invoiceDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={event =>
                              setInvoiceDate(
                                  event.target.value
                              )
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />

                    </div>


                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Payment Due Date
                      </label>

                      <input
                          type="date"
                          value={dueDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={event =>
                              setDueDate(
                                  event.target.value
                              )
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />

                    </div>

                  </div>


                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">

                    <p className="text-xs text-slate-500 leading-5">

                      <strong className="text-slate-700">
                        Automatic billing:
                      </strong>{' '}
                      The invoice amount, customer and any campaign discount are calculated from the selected order and its quotation. Finance does not manually enter the discount.

                    </p>

                  </div>


                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">

                    <button
                        type="button"
                        onClick={() =>
                            setIsCreateModalOpen(false)
                        }
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>


                    <button
                        type="submit"
                        disabled={
                            submitting ||
                            !selectedOrderId
                        }
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
                    >

                      {submitting
                          ? 'Generating...'
                          : 'Generate Invoice'}

                    </button>

                  </div>

                </form>

              </div>

            </div>

        )}


        {/* ======================================================
          REJECT PAYMENT MODAL
          ====================================================== */}

        {rejectingPayment && (

            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Reject Payment
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Payment #{rejectingPayment.id}
                </p>


                <div className="mt-5">

                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rejection Reason *
                  </label>

                  <textarea
                      value={rejectionReason}
                      onChange={event =>
                          setRejectionReason(
                              event.target.value
                          )
                      }
                      rows={4}
                      placeholder="Enter reason for rejecting this payment..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />

                </div>


                <div className="flex justify-end gap-3 mt-5">

                  <button
                      onClick={() => {
                        setRejectingPayment(
                            null
                        )
                        setRejectionReason('')
                      }}
                      className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>


                  <button
                      onClick={
                        handleRejectPayment
                      }
                      disabled={
                        !rejectionReason.trim()
                      }
                      className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                  >
                    Reject Payment
                  </button>

                </div>

              </div>

            </div>

        )}

      </div>
  )
}