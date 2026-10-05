import { useEffect, useState } from 'react'
import { useApp } from '../App'
import {
  fetchCustomerOrders,
  fetchCustomerQuotations,
  fetchCustomerProfile,
  type CustomerOrder,
  type CustomerQuotation,
} from '../services/customerApi'

const formatStatus = (status: string) =>
    status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())

const formatCurrency = (value: number) =>
    `LKR ${Number(value || 0).toLocaleString()}`

export default function Dashboard() {
  const {
    navigate,
    customer,
    setCustomer,
    logout,
  } = useApp()

  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [quotations, setQuotations] = useState<CustomerQuotation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadDashboard = async () => {
      if (!customer) {
        setLoading(false)
        navigate('login')
        return
      }

      try {
        setError('')

        const [latestCustomer, customerOrders, customerQuotations] =
            await Promise.all([
              fetchCustomerProfile(customer.id),
              fetchCustomerOrders(customer.id),
              fetchCustomerQuotations(customer.id),
            ])

        if (!mounted) return

        setCustomer(latestCustomer)
        setOrders(customerOrders)
        setQuotations(customerQuotations)
      } catch (err) {
        if (!mounted) return

        setError(
            err instanceof Error
                ? err.message
                : 'Unable to load your dashboard.'
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      mounted = false
    }
  }, [customer?.id, navigate, setCustomer])

  if (loading) {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6">
          <div className="text-center">
            <p className="section-label">Customer Portal</p>
            <h1 className="font-display text-2xl font-bold text-charcoal mt-2">
              Loading your dashboard...
            </h1>
            <p className="text-charcoal-muted mt-2">
              Retrieving your latest orders and quotations.
            </p>
          </div>
        </div>
    )
  }

  if (!customer) {
    return null
  }

  const activeOrders = orders.filter(
      (order) => !['DELIVERED', 'CANCELLED'].includes(order.status)
  )

  const productionOrders = orders.filter(
      (order) => order.status === 'IN_PRODUCTION'
  )

  const deliveredOrders = orders.filter(
      (order) => order.status === 'DELIVERED'
  )

  const pendingQuotations = quotations.filter((quotation) =>
      ['PENDING', 'UNDER_REVIEW'].includes(quotation.status)
  )

  const totalOrderValue = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
  )

  const recentOrders = [...orders]
      .sort((a, b) => {
        const dateA = new Date(a.orderDate).getTime()
        const dateB = new Date(b.orderDate).getTime()

        if (Number.isNaN(dateA) || Number.isNaN(dateB)) {
          return b.id - a.id
        }

        return dateB - dateA
      })
      .slice(0, 5)

  const handleLogout = () => {
    logout()
  }

  return (
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-12">

        {/* ============================================================
          HEADER
      ============================================================ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10">
          <div>
            <p className="section-label">Customer Portal</p>

            <h1 className="font-display text-4xl font-bold text-charcoal mt-2">
              Welcome, {customer.name}
            </h1>

            <p className="text-charcoal-muted mt-2">
              {customer.company}
              {' · '}
              {customer.customerCode}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
                onClick={() => navigate('custom-builder')}
                className="btn-primary"
            >
              Request a Quotation
            </button>

            <button
                onClick={handleLogout}
                className="btn-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* ============================================================
          ERROR
      ============================================================ */}
        {error && (
            <div className="bg-error/10 border border-error/20 text-error p-4 mb-8">
              <p className="font-medium">Unable to load some dashboard data.</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
        )}

        {/* ============================================================
          STATISTICS
      ============================================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <div className="bg-white border border-border p-5">
            <p className="text-xs text-charcoal-muted uppercase tracking-wider">
              Total Orders
            </p>

            <p className="font-display text-2xl font-bold text-charcoal mt-2">
              {orders.length}
            </p>

            <p className="text-xs text-charcoal-muted mt-2">
              Orders linked to your account
            </p>
          </div>

          <div className="bg-white border border-border p-5">
            <p className="text-xs text-charcoal-muted uppercase tracking-wider">
              Active Orders
            </p>

            <p className="font-display text-2xl font-bold text-charcoal mt-2">
              {activeOrders.length}
            </p>

            <p className="text-xs text-charcoal-muted mt-2">
              Currently being processed
            </p>
          </div>

          <div className="bg-white border border-border p-5">
            <p className="text-xs text-charcoal-muted uppercase tracking-wider">
              Pending Quotations
            </p>

            <p className="font-display text-2xl font-bold text-charcoal mt-2">
              {pendingQuotations.length}
            </p>

            <p className="text-xs text-charcoal-muted mt-2">
              Awaiting sales review
            </p>
          </div>

          <div className="bg-white border border-border p-5">
            <p className="text-xs text-charcoal-muted uppercase tracking-wider">
              Total Order Value
            </p>

            <p className="font-display text-2xl font-bold text-charcoal mt-2">
              {formatCurrency(totalOrderValue)}
            </p>

            <p className="text-xs text-charcoal-muted mt-2">
              Value of your orders
            </p>
          </div>

        </div>

        {/* ============================================================
          ORDER / ACCOUNT AREA
      ============================================================ */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ==========================================================
            RECENT ORDERS
        ========================================================== */}
          <div className="lg:col-span-2 bg-white border border-border p-6">

            <div className="flex justify-between items-center mb-5">
              <div>
                <p className="section-label">Order Management</p>

                <h2 className="font-display text-xl font-bold mt-1">
                  Recent Orders
                </h2>
              </div>

              <button
                  onClick={() => navigate('order-history')}
                  className="text-sm text-bronze hover:underline"
              >
                View all
              </button>
            </div>

            {recentOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-charcoal font-medium">
                    No orders yet.
                  </p>

                  <p className="text-charcoal-muted text-sm mt-2">
                    Submit a quotation request to get started.
                  </p>

                  <button
                      onClick={() => navigate('custom-builder')}
                      className="btn-primary mt-5"
                  >
                    Request a Quotation
                  </button>
                </div>
            ) : (
                <div className="space-y-3">

                  {recentOrders.map((order) => (
                      <div
                          key={order.id}
                          className="border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >

                        <div>
                          <p className="font-semibold text-charcoal">
                            {order.orderNumber}
                          </p>

                          <p className="text-sm text-charcoal-muted mt-1">
                            {order.garmentType}
                            {' · '}
                            {order.quantity.toLocaleString()} units
                          </p>

                          <p className="text-xs text-charcoal-muted mt-1">
                            Delivery: {order.deliveryDate || 'Not specified'}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">

                          <p className="text-sm font-medium text-charcoal">
                            {formatStatus(order.status)}
                          </p>

                          <p className="text-xs text-charcoal-muted mt-1">
                            {order.progress}% complete
                          </p>

                          <p className="text-sm font-medium text-charcoal mt-1">
                            {formatCurrency(order.total)}
                          </p>

                        </div>

                      </div>
                  ))}

                </div>
            )}

          </div>

          {/* ==========================================================
            ACCOUNT DETAILS
        ========================================================== */}
          <div className="bg-charcoal text-ivory p-6">

            <p className="section-label text-ivory/50">
              Account
            </p>

            <h2 className="font-display text-xl font-bold mt-2 mb-6">
              Your Details
            </h2>

            <div className="space-y-4 text-sm">

              <div>
                <p className="text-ivory/40">Customer Code</p>
                <p className="mt-1">{customer.customerCode}</p>
              </div>

              <div>
                <p className="text-ivory/40">Name</p>
                <p className="mt-1">{customer.name}</p>
              </div>

              <div>
                <p className="text-ivory/40">Email</p>
                <p className="mt-1 break-words">{customer.email}</p>
              </div>

              <div>
                <p className="text-ivory/40">Phone</p>
                <p className="mt-1">{customer.contact}</p>
              </div>

              <div>
                <p className="text-ivory/40">Company</p>
                <p className="mt-1">{customer.company}</p>
              </div>

              <div>
                <p className="text-ivory/40">Country</p>
                <p className="mt-1">
                  {customer.country || '—'}
                </p>
              </div>

            </div>

            <button
                onClick={() => navigate('profile')}
                className="btn-secondary border-ivory text-ivory mt-7 w-full justify-center"
            >
              Manage Profile
            </button>

          </div>

        </div>

        {/* ============================================================
          ORDER STATUS SUMMARY
      ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          <div className="bg-white border border-border p-5">
            <p className="text-xs text-charcoal-muted uppercase tracking-wider">
              In Production
            </p>

            <p className="font-display text-2xl font-bold text-charcoal mt-2">
              {productionOrders.length}
            </p>

            <p className="text-xs text-charcoal-muted mt-2">
              Orders currently in production
            </p>
          </div>

          <div className="bg-white border border-border p-5">
            <p className="text-xs text-charcoal-muted uppercase tracking-wider">
              Delivered
            </p>

            <p className="font-display text-2xl font-bold text-charcoal mt-2">
              {deliveredOrders.length}
            </p>

            <p className="text-xs text-charcoal-muted mt-2">
              Successfully delivered orders
            </p>
          </div>

          <div className="bg-white border border-border p-5">
            <p className="text-xs text-charcoal-muted uppercase tracking-wider">
              Quotations
            </p>

            <p className="font-display text-2xl font-bold text-charcoal mt-2">
              {quotations.length}
            </p>

            <p className="text-xs text-charcoal-muted mt-2">
              Total quotation requests
            </p>
          </div>

        </div>

        {/* ============================================================
          RECENT QUOTATIONS
      ============================================================ */}
        <div className="bg-white border border-border p-6 mt-6">

          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="section-label">Quotation Management</p>

              <h2 className="font-display text-xl font-bold mt-1">
                Recent Quotations
              </h2>
            </div>

            <button
                onClick={() => navigate('custom-builder')}
                className="text-sm text-bronze hover:underline"
            >
              New quotation
            </button>
          </div>

          {quotations.length === 0 ? (
              <div className="py-8 text-center text-charcoal-muted">
                You have not submitted any quotation requests yet.
              </div>
          ) : (
              <div className="space-y-3">

                {[...quotations]
                    .sort((a, b) => {
                      const dateA = new Date(a.createdAt).getTime()
                      const dateB = new Date(b.createdAt).getTime()

                      if (
                          Number.isNaN(dateA) ||
                          Number.isNaN(dateB)
                      ) {
                        return b.id - a.id
                      }

                      return dateB - dateA
                    })
                    .slice(0, 5)
                    .map((quotation) => (
                        <div
                            key={quotation.id}
                            className="border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >

                          <div>
                            <p className="font-semibold text-charcoal">
                              {quotation.quotationNumber}
                            </p>

                            <p className="text-sm text-charcoal-muted mt-1">
                              {quotation.garmentType}
                              {' · '}
                              {quotation.quantity.toLocaleString()} units
                            </p>

                            <p className="text-xs text-charcoal-muted mt-1">
                              Requested delivery:{' '}
                              {quotation.requestedDeliveryDate || 'Not specified'}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">

                            <p className="text-sm font-medium text-charcoal">
                              {formatStatus(quotation.status)}
                            </p>

                            {quotation.totalPrice !== null &&
                                quotation.totalPrice !== undefined && (
                                    <p className="text-sm font-medium text-charcoal mt-1">
                                      {formatCurrency(quotation.totalPrice)}
                                    </p>
                                )}

                          </div>

                        </div>
                    ))}

              </div>
          )}

        </div>

      </div>
  )
}