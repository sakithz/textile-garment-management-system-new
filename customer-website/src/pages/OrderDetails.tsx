import {
  useEffect,
  useState,
} from 'react'

import { useApp } from '../App'

import {
  fetchOrderByNumber,
  type CustomerOrder,
} from '../services/customerApi'

import {
  fetchCustomerInvoice,
  fetchCustomerInvoicePayments,
  submitCustomerPayment,
  type CustomerInvoice,
  type CustomerPayment,
  type PaymentMethod,
} from '../services/customerBillingApi'


// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (
    value: number | null | undefined
) => {

  return new Intl.NumberFormat(
      'en-US',
      {
        style: 'currency',
        currency: 'LKR',
      }
  ).format(
      value ?? 0
  )
}


const formatDate = (
    value:
        | string
        | null
        | undefined
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
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
  )
}


const getLabel = (
    value: string
) => {

  return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(
          /\b\w/g,
          letter =>
              letter.toUpperCase()
      )
}


// ============================================================
// STATUS
// ============================================================

const getStatusStyle = (
    status: string
) => {

  switch (status) {

    case 'DELIVERED':
      return 'bg-green-100 text-green-700'

    case 'IN_PRODUCTION':
      return 'bg-blue-100 text-blue-700'

    case 'QUALITY_CHECK':
      return 'bg-purple-100 text-purple-700'

    case 'READY':
      return 'bg-emerald-100 text-emerald-700'

    case 'APPROVED':
      return 'bg-cyan-100 text-cyan-700'

    case 'CANCELLED':
      return 'bg-red-100 text-red-700'

    default:
      return 'bg-amber-100 text-amber-700'
  }
}


const getInvoiceStatusStyle = (
    status: string
) => {

  switch (status) {

    case 'PAID':
      return 'bg-green-100 text-green-700'

    case 'PARTIAL':
      return 'bg-amber-100 text-amber-700'

    case 'OVERDUE':
      return 'bg-red-100 text-red-700'

    default:
      return 'bg-blue-100 text-blue-700'
  }
}


const getPaymentStatusStyle = (
    status: string
) => {

  switch (status) {

    case 'VERIFIED':
      return 'bg-green-100 text-green-700'

    case 'REJECTED':
      return 'bg-red-100 text-red-700'

    default:
      return 'bg-amber-100 text-amber-700'
  }
}


// ============================================================
// COMPONENT
// ============================================================

export default function OrderDetails() {

  const {
    navigate,
    customer,
  } = useApp()


  // ----------------------------------------------------------
  // ORDER
  // ----------------------------------------------------------

  const [
    order,
    setOrder,
  ] = useState<CustomerOrder | null>(
      null
  )


  // ----------------------------------------------------------
  // BILLING
  // ----------------------------------------------------------

  const [
    invoice,
    setInvoice,
  ] = useState<CustomerInvoice | null>(
      null
  )

  const [
    payments,
    setPayments,
  ] = useState<CustomerPayment[]>([])


  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    billingLoading,
    setBillingLoading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')


  // ----------------------------------------------------------
  // INVOICE MODAL
  // ----------------------------------------------------------

  const [
    showInvoiceModal,
    setShowInvoiceModal,
  ] = useState(false)


  // ----------------------------------------------------------
  // PAYMENT MODAL
  // ----------------------------------------------------------

  const [
    showPaymentModal,
    setShowPaymentModal,
  ] = useState(false)

  const [
    paymentAmount,
    setPaymentAmount,
  ] = useState('')

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<PaymentMethod>(
      'BANK_TRANSFER'
  )

  const [
    referenceNo,
    setReferenceNo,
  ] = useState('')

  const [
    paymentSubmitting,
    setPaymentSubmitting,
  ] = useState(false)

  const [
    paymentError,
    setPaymentError,
  ] = useState('')

  const [
    paymentSuccess,
    setPaymentSuccess,
  ] = useState('')


  // ==========================================================
  // LOAD ORDER
  // ==========================================================

  useEffect(() => {

    if (!customer) {

      navigate('login')

      return
    }


    const loadOrder =
        async () => {

          setLoading(true)
          setError('')


          try {

            const storedOrderNumber =
                sessionStorage.getItem(
                    'silkroute_selected_order'
                )


            if (!storedOrderNumber) {

              setError(
                  'No order was selected.'
              )

              return
            }


            const data =
                await fetchOrderByNumber(
                    storedOrderNumber
                )


            if (
                data.customer &&
                data.customer.id !==
                customer.id
            ) {

              setError(
                  'You are not authorized to view this order.'
              )

              return
            }


            setOrder(data)


            /*
             * Billing is loaded separately.
             *
             * If an invoice does not exist yet,
             * the customer simply sees:
             *
             * "Invoice not generated yet"
             */
            await loadBilling(
                data.orderNumber
            )

          } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load order details.'
            )

          } finally {

            setLoading(false)
          }
        }


    void loadOrder()

  }, [
    customer,
    navigate,
  ])


  // ==========================================================
  // LOAD BILLING
  // ==========================================================

  const loadBilling =
      async (
          orderNumber: string
      ) => {

        setBillingLoading(true)

        try {

          const customerInvoice =
              await fetchCustomerInvoice(
                  orderNumber
              )


          setInvoice(
              customerInvoice
          )


          if (customerInvoice) {

            const invoicePayments =
                await fetchCustomerInvoicePayments(
                    customerInvoice.id
                )

            setPayments(
                invoicePayments
            )

          } else {

            setPayments([])
          }

        } catch (err) {

          console.error(
              'Failed to load billing:',
              err
          )

        } finally {

          setBillingLoading(false)
        }
      }


  // ==========================================================
  // BACK
  // ==========================================================

  const handleBack = () => {

    sessionStorage.removeItem(
        'silkroute_selected_order'
    )

    navigate(
        'order-history'
    )
  }


  // ==========================================================
  // OPEN PAYMENT
  // ==========================================================

  const openPaymentModal =
      () => {

        if (!invoice) {
          return
        }

        const balance =
            Math.max(
                invoice.balanceDue ??
                (
                    invoice.amount -
                    (
                        invoice.amountPaid ??
                        0
                    )
                ),
                0
            )


        if (balance <= 0) {
          return
        }


        setPaymentAmount(
            balance.toFixed(2)
        )

        setPaymentMethod(
            'BANK_TRANSFER'
        )

        setReferenceNo('')

        setPaymentError('')

        setPaymentSuccess('')

        setShowPaymentModal(
            true
        )
      }


  // ==========================================================
  // SUBMIT PAYMENT
  // ==========================================================

  const handleSubmitPayment =
      async (
          event: React.FormEvent
      ) => {

        event.preventDefault()


        if (!invoice) {
          return
        }


        setPaymentError('')
        setPaymentSuccess('')


        const amount =
            Number(
                paymentAmount
            )


        const balance =
            Math.max(
                invoice.balanceDue ??
                (
                    invoice.amount -
                    (
                        invoice.amountPaid ??
                        0
                    )
                ),
                0
            )


        if (
            !Number.isFinite(
                amount
            ) ||
            amount <= 0
        ) {

          setPaymentError(
              'Please enter a valid payment amount.'
          )

          return
        }


        if (amount > balance) {

          setPaymentError(
              `Payment cannot exceed the remaining balance of ${formatCurrency(
                  balance
              )}.`
          )

          return
        }


        try {

          setPaymentSubmitting(
              true
          )


          await submitCustomerPayment(
              invoice.id,
              {
                amountPaid:
                amount,

                paymentMethod:
                paymentMethod,

                referenceNo:
                    referenceNo.trim() ||
                    undefined,

                paymentDate:
                    new Date()
                        .toISOString()
                        .split('T')[0],
              }
          )


          setPaymentSuccess(
              'Payment submitted successfully. It is now waiting for Finance verification.'
          )


          /*
           * Refresh invoice and payment history.
           */
          await loadBilling(
              invoice.orderId
          )


          setPaymentAmount('')

          setReferenceNo('')

        } catch (err) {

          setPaymentError(
              err instanceof Error
                  ? err.message
                  : 'Unable to submit payment.'
          )

        } finally {

          setPaymentSubmitting(
              false
          )
        }
      }


  // ==========================================================
  // LOADING
  // ==========================================================

  if (!customer) {

    return null
  }


  if (loading) {

    return (

        <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center">

          <div className="text-center">

            <div className="w-8 h-8 border-2 border-[#1F4D3A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />

            <p className="text-sm text-gray-500">
              Loading order details...
            </p>

          </div>

        </div>
    )
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !order) {

    return (

        <div className="min-h-screen bg-[#F8F8F6] py-12 px-4">

          <div className="max-w-2xl mx-auto">

            <button
                type="button"
                onClick={handleBack}
                className="text-sm text-gray-500 hover:text-[#1F4D3A] mb-6"
            >
              ← Back to Orders
            </button>


            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">

              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 text-xl">
                !
              </div>


              <h1 className="text-xl font-semibold text-[#1F2937]">
                Unable to Load Order
              </h1>


              <p className="text-sm text-gray-500 mt-2">
                {error ||
                    'Order details could not be found.'}
              </p>


              <button
                  type="button"
                  onClick={handleBack}
                  className="mt-6 px-5 py-3 rounded-lg bg-[#1F4D3A] text-white text-sm font-medium hover:bg-[#173A2C]"
              >
                Back to Orders
              </button>

            </div>

          </div>

        </div>
    )
  }


  // ==========================================================
  // CALCULATIONS
  // ==========================================================

  const progress =
      Math.max(
          0,
          Math.min(
              100,
              Number(
                  order.progress ??
                  0
              )
          )
      )


  const baseAmount =
      invoice?.baseAmount ??
      order.total


  const discountAmount =
      invoice?.discountAmount ??
      0


  const discountPercent =
      invoice?.discountPercent ??
      0


  const amountPaid =
      invoice?.amountPaid ??
      0


  const balanceDue =
      invoice
          ? (
              invoice.balanceDue ??
              Math.max(
                  invoice.amount -
                  amountPaid,
                  0
              )
          )
          : 0


  const hasDiscount =
      discountAmount > 0


  const hasPendingPayment =
      payments.some(
          payment =>
              payment.status ===
              'PENDING'
      )


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

      <div className="min-h-screen bg-[#F8F8F6] py-8 px-4 sm:px-6 lg:px-8">

        <div className="max-w-5xl mx-auto">


          {/* ==================================================
            BACK
            ================================================== */}

          <button
              type="button"
              onClick={handleBack}
              className="text-sm text-gray-500 hover:text-[#1F4D3A] transition-colors mb-6"
          >
            ← Back to Orders
          </button>


          {/* ==================================================
            HEADER
            ================================================== */}

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">

            <div>

              <p className="text-sm text-gray-500 mb-1">
                Order Details
              </p>


              <h1 className="text-3xl font-semibold text-[#1F2937]">
                {order.orderNumber}
              </h1>


              <p className="text-sm text-gray-500 mt-2">
                Placed on{' '}
                {formatDate(
                    order.orderDate
                )}
              </p>

            </div>


            <span
                className={`inline-flex self-start px-4 py-2 rounded-full text-sm font-medium ${getStatusStyle(
                    order.status
                )}`}
            >
            {getLabel(
                order.status
            )}
          </span>

          </div>


          {/* ==================================================
            PROGRESS
            ================================================== */}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">

            <div className="flex items-center justify-between mb-3">

              <div>

                <h2 className="font-semibold text-[#1F2937]">
                  Order Progress
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Current production progress
                </p>

              </div>


              <span className="text-lg font-semibold text-[#1F4D3A]">
              {progress}%
            </span>

            </div>


            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

              <div
                  className="h-full bg-[#1F4D3A] rounded-full transition-all duration-500"
                  style={{
                    width:
                        `${progress}%`,
                  }}
              />

            </div>

          </div>


          {/* ==================================================
            MAIN GRID
            ================================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


            {/* =================================================
              LEFT
              ================================================= */}

            <div className="lg:col-span-2 space-y-6">


              {/* ==============================================
                PRODUCT DETAILS
                ============================================== */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                <h2 className="text-lg font-semibold text-[#1F2937] mb-6">
                  Product Details
                </h2>


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">

                  <div>

                    <p className="text-xs text-gray-500 mb-1">
                      Garment Type
                    </p>

                    <p className="text-sm font-medium text-[#1F2937]">
                      {order.garmentType ||
                          '—'}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-gray-500 mb-1">
                      Quantity
                    </p>

                    <p className="text-sm font-medium text-[#1F2937]">
                      {order.quantity.toLocaleString()}{' '}
                      units
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-gray-500 mb-1">
                      Fabric
                    </p>

                    <p className="text-sm font-medium text-[#1F2937]">
                      {order.fabric ||
                          '—'}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-gray-500 mb-1">
                      Color
                    </p>

                    <p className="text-sm font-medium text-[#1F2937]">
                      {order.color ||
                          '—'}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-gray-500 mb-1">
                      Size
                    </p>

                    <p className="text-sm font-medium text-[#1F2937]">
                      {order.size ||
                          '—'}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-gray-500 mb-1">
                      Priority
                    </p>

                    <p className="text-sm font-medium text-[#1F2937]">
                      {getLabel(
                          order.priority
                      )}
                    </p>

                  </div>

                </div>

              </div>


              {/* ==============================================
                DELIVERY
                ============================================== */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                <h2 className="text-lg font-semibold text-[#1F2937] mb-6">
                  Delivery Information
                </h2>


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  <div className="rounded-xl bg-[#F5F7F4] p-5">

                    <p className="text-xs text-gray-500 mb-2">
                      Order Date
                    </p>

                    <p className="font-medium text-[#1F2937]">
                      {formatDate(
                          order.orderDate
                      )}
                    </p>

                  </div>


                  <div className="rounded-xl bg-[#F5F7F4] p-5">

                    <p className="text-xs text-gray-500 mb-2">
                      Expected Delivery
                    </p>

                    <p className="font-medium text-[#1F2937]">
                      {formatDate(
                          order.deliveryDate
                      )}
                    </p>

                  </div>

                </div>

              </div>


              {/* ==============================================
                BILLING & PAYMENT
                ============================================== */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                <div className="flex items-start justify-between gap-4 mb-6">

                  <div>

                    <h2 className="text-lg font-semibold text-[#1F2937]">
                      Billing &amp; Payment
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Invoice, discount and payment information
                    </p>

                  </div>


                  {billingLoading && (

                      <div className="w-5 h-5 border-2 border-[#1F4D3A] border-t-transparent rounded-full animate-spin" />

                  )}

                </div>


                {!invoice ? (

                    <div className="rounded-xl border border-dashed border-gray-300 bg-[#FAFAF8] p-6 text-center">

                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-xl">
                        🧾
                      </div>

                      <h3 className="font-semibold text-[#1F2937]">
                        Invoice Not Generated Yet
                      </h3>

                      <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                        Your invoice will appear here once the Finance team generates it for this order.
                      </p>

                    </div>

                ) : (

                    <div className="space-y-5">


                      {/* INVOICE HEADER */}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-[#F5F7F4] p-5">

                        <div>

                          <p className="text-xs text-gray-500">
                            Invoice
                          </p>

                          <p className="text-lg font-semibold text-[#1F2937]">
                            {invoice.invoiceNumber}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            Issued{' '}
                            {formatDate(
                                invoice.date
                            )}
                          </p>

                        </div>


                        <span
                            className={`self-start px-3 py-1.5 rounded-full text-xs font-semibold ${getInvoiceStatusStyle(
                                invoice.status
                            )}`}
                        >
                      {getLabel(
                          invoice.status
                      )}
                    </span>

                      </div>


                      {/* BILLING BREAKDOWN */}

                      <div className="space-y-3">

                        <div className="flex items-center justify-between gap-4">

                      <span className="text-sm text-gray-500">
                        Base Amount
                      </span>

                          <span className="text-sm font-medium text-[#1F2937]">
                        {formatCurrency(
                            baseAmount
                        )}
                      </span>

                        </div>


                        {hasDiscount && (

                            <div className="rounded-xl bg-purple-50 border border-purple-100 p-4">

                              <div className="flex items-start justify-between gap-4">

                                <div>

                                  <p className="text-sm font-semibold text-purple-800">
                                    {invoice.campaignName ||
                                        'Offer Discount'}
                                  </p>

                                  <p className="text-xs text-purple-600 mt-1">
                                    Campaign discount{' '}
                                    {discountPercent}%
                                  </p>

                                </div>


                                <span className="text-sm font-semibold text-purple-700">
                            -
                                  {formatCurrency(
                                      discountAmount
                                  )}
                          </span>

                              </div>

                            </div>

                        )}


                        <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-4">

                      <span className="font-semibold text-[#1F2937]">
                        Invoice Total
                      </span>

                          <span className="text-xl font-bold text-[#1F4D3A]">
                        {formatCurrency(
                            invoice.amount
                        )}
                      </span>

                        </div>


                        <div className="flex items-center justify-between gap-4">

                      <span className="text-sm text-gray-500">
                        Amount Paid
                      </span>

                          <span className="text-sm font-semibold text-green-700">
                        {formatCurrency(
                            amountPaid
                        )}
                      </span>

                        </div>


                        <div className="flex items-center justify-between gap-4">

                      <span className="text-sm font-medium text-[#1F2937]">
                        Balance Due
                      </span>

                          <span className="text-sm font-bold text-red-600">
                        {formatCurrency(
                            balanceDue
                        )}
                      </span>

                        </div>

                      </div>


                      {/* ACTIONS */}

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">

                        <button
                            type="button"
                            onClick={() =>
                                setShowInvoiceModal(
                                    true
                                )
                            }
                            className="flex-1 px-4 py-3 rounded-xl border border-[#1F4D3A] text-[#1F4D3A] text-sm font-semibold hover:bg-[#F5F7F4] transition-colors"
                        >
                          View Invoice
                        </button>


                        {balanceDue > 0 &&
                            invoice.status !==
                            'PAID' && (

                                <button
                                    type="button"
                                    onClick={
                                      openPaymentModal
                                    }
                                    className="flex-1 px-4 py-3 rounded-xl bg-[#1F4D3A] text-white text-sm font-semibold hover:bg-[#173A2C] transition-colors"
                                >
                                  Pay Now
                                </button>

                            )}

                      </div>


                      {/* PAYMENT HISTORY */}

                      {payments.length > 0 && (

                          <div className="border-t border-gray-100 pt-5">

                            <h3 className="text-sm font-semibold text-[#1F2937] mb-4">
                              Payment History
                            </h3>


                            <div className="space-y-3">

                              {payments.map(
                                  payment => (

                                      <div
                                          key={
                                            payment.id
                                          }
                                          className="rounded-xl bg-[#FAFAF8] border border-gray-100 p-4"
                                      >

                                        <div className="flex items-start justify-between gap-4">

                                          <div>

                                            <p className="text-sm font-semibold text-[#1F2937]">
                                              {formatCurrency(
                                                  payment.amountPaid
                                              )}
                                            </p>

                                            <p className="text-xs text-gray-500 mt-1">
                                              {getLabel(
                                                  payment.paymentMethod
                                              )}

                                              {' • '}

                                              {formatDate(
                                                  payment.paymentDate
                                              )}
                                            </p>


                                            {payment.referenceNo && (

                                                <p className="text-xs text-gray-500 mt-1">
                                                  Ref:{' '}
                                                  {payment.referenceNo}
                                                </p>

                                            )}

                                          </div>


                                          <span
                                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusStyle(
                                                  payment.status
                                              )}`}
                                          >
                                  {getLabel(
                                      payment.status
                                  )}
                                </span>

                                        </div>


                                        {payment.rejectionReason && (

                                            <p className="text-xs text-red-600 mt-3">
                                              Reason:{' '}
                                              {
                                                payment.rejectionReason
                                              }
                                            </p>

                                        )}

                                      </div>

                                  )
                              )}

                            </div>

                          </div>

                      )}


                      {hasPendingPayment && (

                          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">

                            <p className="text-sm font-medium text-amber-800">
                              Payment submitted
                            </p>

                            <p className="text-xs text-amber-700 mt-1">
                              Your payment is waiting for Finance verification.
                            </p>

                          </div>

                      )}

                    </div>

                )}

              </div>

            </div>


            {/* =================================================
              RIGHT
              ================================================= */}

            <div className="space-y-6">


              {/* ==============================================
                ORDER SUMMARY
                ============================================== */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                <h2 className="text-lg font-semibold text-[#1F2937] mb-6">
                  Order Summary
                </h2>


                <div className="space-y-4">

                  <div className="flex items-center justify-between gap-4">

                  <span className="text-sm text-gray-500">
                    Unit Price
                  </span>

                    <span className="text-sm font-medium text-[#1F2937]">
                    {formatCurrency(
                        order.unitPrice
                    )}
                  </span>

                  </div>


                  <div className="flex items-center justify-between gap-4">

                  <span className="text-sm text-gray-500">
                    Quantity
                  </span>

                    <span className="text-sm font-medium text-[#1F2937]">
                    {order.quantity.toLocaleString()}
                  </span>

                  </div>


                  {hasDiscount && (

                      <div className="rounded-lg bg-purple-50 px-3 py-3">

                        <div className="flex items-center justify-between gap-3">

                      <span className="text-xs font-medium text-purple-700">
                        {invoice?.campaignName ||
                            'Offer Discount'}
                      </span>

                          <span className="text-xs font-semibold text-purple-700">
                        {discountPercent}%
                      </span>

                        </div>

                        <p className="text-xs text-purple-600 mt-1">
                          Discount:{' '}
                          {formatCurrency(
                              discountAmount
                          )}
                        </p>

                      </div>

                  )}


                  <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-4">

                  <span className="font-medium text-[#1F2937]">
                    Total
                  </span>

                    <span className="text-xl font-semibold text-[#1F4D3A]">
                    {formatCurrency(
                        order.total
                    )}
                  </span>

                  </div>

                </div>

              </div>


              {/* ==============================================
                ASSISTANCE
                ============================================== */}

              <div className="bg-[#1F4D3A] rounded-2xl p-6 text-white">

                <h2 className="font-semibold mb-2">
                  Need assistance?
                </h2>

                <p className="text-sm text-white/75 leading-6">
                  Contact the SilkRoute team if you have any questions about this order, invoice, payment or delivery.
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            'dashboard'
                        )
                    }
                    className="mt-5 px-4 py-2.5 rounded-lg bg-white text-[#1F4D3A] text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Back to Dashboard
                </button>

              </div>

            </div>

          </div>

        </div>


        {/* ====================================================
          INVOICE PREVIEW MODAL
          ==================================================== */}

        {showInvoiceModal &&
            invoice && (

                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

                  <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">

                      <div>

                        <p className="text-xs text-gray-500">
                          Invoice
                        </p>

                        <h2 className="text-2xl font-semibold text-[#1F2937]">
                          {invoice.invoiceNumber}
                        </h2>

                      </div>


                      <button
                          type="button"
                          onClick={() =>
                              setShowInvoiceModal(
                                  false
                              )
                          }
                          className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
                      >
                        ×
                      </button>

                    </div>


                    <div className="p-6 space-y-6">

                      <div className="grid grid-cols-2 gap-6">

                        <div>

                          <p className="text-xs text-gray-500">
                            Customer
                          </p>

                          <p className="font-medium text-[#1F2937] mt-1">
                            {invoice.customer}
                          </p>

                        </div>


                        <div>

                          <p className="text-xs text-gray-500">
                            Order
                          </p>

                          <p className="font-medium text-[#1F2937] mt-1">
                            {invoice.orderId}
                          </p>

                        </div>


                        <div>

                          <p className="text-xs text-gray-500">
                            Invoice Date
                          </p>

                          <p className="font-medium text-[#1F2937] mt-1">
                            {formatDate(
                                invoice.date
                            )}
                          </p>

                        </div>


                        <div>

                          <p className="text-xs text-gray-500">
                            Due Date
                          </p>

                          <p className="font-medium text-[#1F2937] mt-1">
                            {formatDate(
                                invoice.dueDate
                            )}
                          </p>

                        </div>

                      </div>


                      <div className="border border-gray-200 rounded-xl overflow-hidden">

                        <div className="p-4 flex items-center justify-between border-b border-gray-100">

                  <span className="text-sm text-gray-500">
                    Base Amount
                  </span>

                          <span className="font-medium">
                    {formatCurrency(
                        baseAmount
                    )}
                  </span>

                        </div>


                        {hasDiscount && (

                            <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-purple-50">

                              <div>

                      <span className="text-sm font-medium text-purple-800">
                        {invoice.campaignName ||
                            'Offer Discount'}
                      </span>

                                <span className="block text-xs text-purple-600 mt-1">
                        {discountPercent}% discount
                      </span>

                              </div>

                              <span className="font-semibold text-purple-700">
                      -
                                {formatCurrency(
                                    discountAmount
                                )}
                    </span>

                            </div>

                        )}


                        <div className="p-4 flex items-center justify-between border-b border-gray-100">

                  <span className="font-semibold">
                    Invoice Total
                  </span>

                          <span className="text-lg font-bold text-[#1F4D3A]">
                    {formatCurrency(
                        invoice.amount
                    )}
                  </span>

                        </div>


                        <div className="p-4 flex items-center justify-between border-b border-gray-100">

                  <span className="text-sm text-gray-500">
                    Amount Paid
                  </span>

                          <span className="font-semibold text-green-700">
                    {formatCurrency(
                        amountPaid
                    )}
                  </span>

                        </div>


                        <div className="p-4 flex items-center justify-between">

                  <span className="font-semibold">
                    Balance Due
                  </span>

                          <span className="font-bold text-red-600">
                    {formatCurrency(
                        balanceDue
                    )}
                  </span>

                        </div>

                      </div>


                      <div className="flex gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                window.print()
                            }
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Print Invoice
                        </button>


                        {balanceDue > 0 && (

                            <button
                                type="button"
                                onClick={() => {
                                  setShowInvoiceModal(
                                      false
                                  )

                                  openPaymentModal()
                                }}
                                className="flex-1 px-4 py-3 rounded-xl bg-[#1F4D3A] text-white text-sm font-semibold hover:bg-[#173A2C]"
                            >
                              Pay Now
                            </button>

                        )}

                      </div>

                    </div>

                  </div>

                </div>

            )}


        {/* ====================================================
          PAYMENT MODAL
          ==================================================== */}

        {showPaymentModal &&
            invoice && (

                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

                  <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">

                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">

                      <div>

                        <h2 className="text-xl font-semibold text-[#1F2937]">
                          Make Payment
                        </h2>

                        <p className="text-xs text-gray-500 mt-1">
                          Invoice {invoice.invoiceNumber}
                        </p>

                      </div>


                      <button
                          type="button"
                          onClick={() =>
                              setShowPaymentModal(
                                  false
                              )
                          }
                          className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
                      >
                        ×
                      </button>

                    </div>


                    <form
                        onSubmit={
                          handleSubmitPayment
                        }
                        className="p-6 space-y-5"
                    >

                      {paymentError && (

                          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                            {paymentError}
                          </div>

                      )}


                      {paymentSuccess && (

                          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                            {paymentSuccess}
                          </div>

                      )}


                      <div className="rounded-xl bg-[#F5F7F4] p-4">

                        <div className="flex items-center justify-between">

                  <span className="text-sm text-gray-500">
                    Balance Due
                  </span>

                          <span className="text-lg font-bold text-[#1F4D3A]">
                    {formatCurrency(
                        balanceDue
                    )}
                  </span>

                        </div>

                      </div>


                      <div>

                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Payment Amount *
                        </label>

                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            max={balanceDue}
                            value={paymentAmount}
                            onChange={event =>
                                setPaymentAmount(
                                    event.target.value
                                )
                            }
                            className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]/20"
                            required
                        />

                      </div>


                      <div>

                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Payment Method *
                        </label>

                        <select
                            value={
                              paymentMethod
                            }
                            onChange={event =>
                                setPaymentMethod(
                                    event.target.value as PaymentMethod
                                )
                            }
                            className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]/20 bg-white"
                        >

                          <option value="BANK_TRANSFER">
                            Bank Transfer
                          </option>

                          <option value="CARD">
                            Card
                          </option>

                          <option value="CASH">
                            Cash
                          </option>

                          <option value="CHEQUE">
                            Cheque
                          </option>

                          <option value="UPI">
                            UPI
                          </option>

                        </select>

                      </div>


                      <div>

                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Payment Reference
                        </label>

                        <input
                            type="text"
                            value={referenceNo}
                            onChange={event =>
                                setReferenceNo(
                                    event.target.value
                                )
                            }
                            placeholder="Transaction / cheque reference"
                            className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]/20"
                        />

                      </div>


                      <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">

                        <p className="text-xs text-amber-700 leading-5">

                          After submission, the payment will remain
                          <strong> Pending</strong> until a Finance Officer verifies it.

                        </p>

                      </div>


                      <div className="flex gap-3 pt-2">

                        <button
                            type="button"
                            onClick={() =>
                                setShowPaymentModal(
                                    false
                                )
                            }
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={
                              paymentSubmitting
                            }
                            className="flex-1 px-4 py-3 rounded-xl bg-[#1F4D3A] text-white text-sm font-semibold hover:bg-[#173A2C] disabled:opacity-50"
                        >

                          {paymentSubmitting
                              ? 'Submitting...'
                              : 'Submit Payment'}

                        </button>

                      </div>

                    </form>

                  </div>

                </div>

            )}

      </div>
  )
}