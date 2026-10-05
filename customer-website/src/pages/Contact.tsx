import {
  useEffect,
  useState,
} from 'react'

import {
  useApp,
} from '../App'

import {
  createQuotation,
  getCustomerSession,
  type Customer,
  type CustomerQuotation,
} from '../services/customerApi'


interface SelectedCampaign {

  id: number

  campaignCode: string

  name: string

  discount: string

  products: string

  startDate: string

  endDate: string
}


interface ContactForm {

  garmentType: string

  quantity: string

  fabric: string

  color: string

  size: string

  requestedDeliveryDate: string

  customerMessage: string
}


/* ============================================================
   INITIAL FORM
   ============================================================ */

const INITIAL_FORM: ContactForm = {

  garmentType: '',

  quantity: '100',

  fabric: '',

  color: '',

  size: '',

  requestedDeliveryDate: '',

  customerMessage: '',
}


/* ============================================================
   DATE FORMATTER
   ============================================================ */

function formatDate(
    value: string | null | undefined
): string {

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
        month: 'short',
        day: 'numeric',
      }
  )
}


/* ============================================================
   DISCOUNT DISPLAY
   ============================================================ */

function getDiscountText(
    value: string
): string {

  if (!value) {

    return ''
  }


  return value
}


/* ============================================================
   PAGE
   ============================================================ */

export default function Contact() {

  const {
    navigate,
    customer,
  } = useApp()


  /* ========================================================
     CUSTOMER
     ======================================================== */

  const [
    loggedInCustomer,
    setLoggedInCustomer,
  ] =
      useState<Customer | null>(
          customer
      )


  /* ========================================================
     SELECTED CAMPAIGN
     ======================================================== */

  const [
    selectedCampaign,
    setSelectedCampaign,
  ] =
      useState<SelectedCampaign | null>(
          null
      )


  /* ========================================================
     FORM
     ======================================================== */

  const [
    form,
    setForm,
  ] =
      useState<ContactForm>(
          INITIAL_FORM
      )


  /* ========================================================
     UI STATES
     ======================================================== */

  const [
    submitting,
    setSubmitting,
  ] =
      useState(false)


  const [
    success,
    setSuccess,
  ] =
      useState<CustomerQuotation | null>(
          null
      )


  const [
    error,
    setError,
  ] =
      useState('')


  /* ========================================================
     LOAD CUSTOMER
     ======================================================== */

  useEffect(() => {

    const sessionCustomer =
        customer ||
        getCustomerSession()


    if (
        sessionCustomer
    ) {

      setLoggedInCustomer(
          sessionCustomer
      )

      return
    }


    setLoggedInCustomer(
        null
    )

  }, [
    customer,
  ])


  /* ========================================================
     LOAD SELECTED CAMPAIGN
     ======================================================== */

  useEffect(() => {

    const stored =
        sessionStorage.getItem(
            'silkroute_selected_campaign'
        )


    if (!stored) {

      setSelectedCampaign(
          null
      )

      return
    }


    try {

      const campaign =
          JSON.parse(
              stored
          ) as SelectedCampaign


      if (
          campaign &&
          typeof campaign.id ===
          'number'
      ) {

        setSelectedCampaign(
            campaign
        )

      } else {

        setSelectedCampaign(
            null
        )
      }

    } catch {

      sessionStorage.removeItem(
          'silkroute_selected_campaign'
      )

      setSelectedCampaign(
          null
      )
    }

  }, [])


  /* ========================================================
     UPDATE FORM
     ======================================================== */

  const updateForm = (
      field: keyof ContactForm,
      value: string
  ) => {

    setForm(
        previous => ({
          ...previous,

          [field]:
          value,
        })
    )


    /*
     * Clear old messages whenever
     * the user changes the form.
     */

    if (error) {

      setError('')
    }

    if (success) {

      setSuccess(null)
    }
  }


  /* ========================================================
     SUBMIT
     ======================================================== */

  const handleSubmit = async (
      event: React.FormEvent
  ) => {

    event.preventDefault()


    setError('')

    setSuccess(null)


    /* ----------------------------------------------------
       CUSTOMER LOGIN CHECK
       ---------------------------------------------------- */

    const activeCustomer =
        loggedInCustomer ||
        getCustomerSession()


    if (!activeCustomer) {

      navigate(
          'login'
      )

      return
    }


    setLoggedInCustomer(
        activeCustomer
    )


    /* ----------------------------------------------------
       VALIDATE GARMENT
       ---------------------------------------------------- */

    if (
        !form.garmentType.trim()
    ) {

      setError(
          'Please enter the garment type.'
      )

      return
    }


    /* ----------------------------------------------------
       VALIDATE QUANTITY
       ---------------------------------------------------- */

    const quantity =
        Number(
            form.quantity
        )


    if (
        !Number.isFinite(
            quantity
        ) ||
        quantity <= 0
    ) {

      setError(
          'Quantity must be greater than zero.'
      )

      return
    }


    /* ----------------------------------------------------
       VALIDATE INTEGER QUANTITY
       ---------------------------------------------------- */

    if (
        !Number.isInteger(
            quantity
        )
    ) {

      setError(
          'Quantity must be a whole number.'
      )

      return
    }


    /* ----------------------------------------------------
       SUBMIT
       ---------------------------------------------------- */

    setSubmitting(
        true
    )


    try {

      const quotation =
          await createQuotation({

            customerId:
            activeCustomer.id,

            /*
             * IMPORTANT:
             *
             * If this request came from
             * the Offers page, this contains
             * the selected campaign ID.
             *
             * Otherwise it remains undefined.
             */

            campaignId:
            selectedCampaign?.id,

            garmentType:
                form.garmentType
                    .trim(),

            quantity:
            quantity,

            fabric:
                form.fabric
                    .trim() ||
                undefined,

            color:
                form.color
                    .trim() ||
                undefined,

            size:
                form.size
                    .trim() ||
                undefined,

            requestedDeliveryDate:
                form.requestedDeliveryDate ||
                undefined,

            customerMessage:
                form.customerMessage
                    .trim() ||
                undefined,
          })


      /* ------------------------------------------------
         SUCCESS
         ------------------------------------------------ */

      setSuccess(
          quotation
      )


      /* ------------------------------------------------
         RESET FORM
         ------------------------------------------------ */

      setForm(
          INITIAL_FORM
      )


      /*
       * The campaign has now been consumed
       * by this quotation request.
       *
       * Remove it from session storage so that
       * a future normal quotation does not
       * accidentally use the same campaign.
       */

      sessionStorage.removeItem(
          'silkroute_selected_campaign'
      )


      setSelectedCampaign(
          null
      )

    } catch (submissionError) {

      setError(

          submissionError
          instanceof Error

              ? submissionError.message

              : 'Failed to submit your quotation request.'
      )

    } finally {

      setSubmitting(
          false
      )
    }
  }


  /* ========================================================
     LOGIN VIEW
     ======================================================== */

  if (!loggedInCustomer) {

    return (

        <div className="bg-ivory min-h-screen">

          {/* HERO */}

          <div className="bg-charcoal text-ivory py-16">

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

              <div className="section-label text-bronze mb-4">
                Request a Quote
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold">
                Let's Discuss Your Requirements.
              </h1>

              <p className="text-ivory/60 mt-4 max-w-xl leading-relaxed">
                Sign in to your customer account
                before submitting a quotation request.
              </p>

            </div>

          </div>


          {/* LOGIN CARD */}

          <div className="max-w-xl mx-auto px-6 py-16">

            <div className="bg-white border border-border p-8 text-center">

              <div className="w-12 h-12 bg-bronze/10 text-bronze flex items-center justify-center mx-auto mb-5">

                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >

                  <path
                      d="M20 21a8 8 0 0 0-16 0"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                  />

                  <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                  />

                </svg>

              </div>


              <h2 className="font-display text-2xl font-bold text-charcoal mb-3">
                Sign In Required
              </h2>


              <p className="text-sm text-charcoal-muted leading-relaxed mb-7">

                Please sign in to your
                customer account before
                requesting a quotation.

                Your quotation will be
                saved against your customer
                profile.

              </p>


              <div className="flex flex-col sm:flex-row gap-3 justify-center">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            'login'
                        )
                    }
                    className="btn-primary justify-center"
                >
                  Sign In
                </button>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            'register'
                        )
                    }
                    className="btn-secondary justify-center"
                >
                  Create Account
                </button>

              </div>

            </div>

          </div>

        </div>
    )
  }


  /* ========================================================
     MAIN CONTACT / QUOTATION PAGE
     ======================================================== */

  return (

      <div className="bg-ivory min-h-screen">

        {/* =================================================
                HERO
            ================================================= */}

        <div className="bg-charcoal text-ivory py-16 md:py-20">

          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

            <div className="section-label text-bronze mb-4">
              Custom Manufacturing
            </div>


            <h1 className="font-display text-4xl md:text-5xl font-bold">
              Request a Quotation.
            </h1>


            <p className="text-ivory/60 max-w-2xl mt-4 leading-relaxed">

              Tell us about your garment
              requirements and our Sales team
              will review your request before
              creating an order.

            </p>

          </div>

        </div>


        {/* =================================================
                MAIN CONTENT
            ================================================= */}

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">


            {/* =================================================
                        LEFT — FORM
                    ================================================= */}

            <div>

              {/* SUCCESS */}

              {success && (

                  <div className="bg-green-50 border border-green-200 p-6 mb-6">

                    <div className="flex items-start gap-4">

                      <div className="w-10 h-10 shrink-0 bg-green-100 text-green-700 flex items-center justify-center rounded-full">

                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >

                          <path
                              d="m5 12 4 4L19 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                          />

                        </svg>

                      </div>


                      <div>

                        <h2 className="font-display text-xl font-bold text-green-800">

                          Quotation Request Submitted

                        </h2>


                        <p className="text-sm text-green-700 mt-2 leading-relaxed">

                          Your quotation request has
                          been submitted successfully.
                          A Sales Executive will review
                          your requirements and prepare
                          the quotation.

                        </p>


                        <div className="mt-4 bg-white border border-green-200 p-4">

                          <div className="text-xs uppercase tracking-wider text-green-600 font-semibold">
                            Quotation Number
                          </div>

                          <div className="font-mono font-bold text-green-900 mt-1">
                            {success.quotationNumber}
                          </div>

                        </div>


                        <div className="flex flex-col sm:flex-row gap-3 mt-5">

                          <button
                              type="button"
                              onClick={() =>
                                  navigate(
                                      'dashboard'
                                  )
                              }
                              className="btn-primary justify-center"
                          >
                            Go to Dashboard
                          </button>


                          <button
                              type="button"
                              onClick={() =>
                                  navigate(
                                      'home'
                                  )
                              }
                              className="btn-secondary justify-center"
                          >
                            Back to Website
                          </button>

                        </div>

                      </div>

                    </div>

                  </div>
              )}


              {/* ERROR */}

              {error && (

                  <div className="bg-error/10 border border-error/20 text-error p-4 mb-6">

                    <div className="flex items-start gap-3">

                      <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="shrink-0 mt-0.5"
                          aria-hidden="true"
                      >

                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        />

                        <path
                            d="M12 8v5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />

                        <circle
                            cx="12"
                            cy="16.5"
                            r=".7"
                            fill="currentColor"
                        />

                      </svg>


                      <div>

                        <div className="font-semibold text-sm">
                          Unable to Submit
                        </div>

                        <div className="text-sm mt-1">
                          {error}
                        </div>

                      </div>

                    </div>

                  </div>
              )}


              {/* FORM */}

              {!success && (

                  <form
                      onSubmit={
                        handleSubmit
                      }
                      className="bg-white border border-border"
                  >

                    {/* FORM HEADER */}

                    <div className="p-6 lg:p-8 border-b border-border">

                      <div className="section-label mb-2">
                        Quote Details
                      </div>

                      <h2 className="font-display text-2xl font-bold text-charcoal">
                        Tell Us What You Need
                      </h2>

                      <p className="text-sm text-charcoal-muted mt-2">
                        Provide as much detail as possible
                        so our Sales team can prepare an
                        accurate quotation.
                      </p>

                    </div>


                    {/* FORM BODY */}

                    <div className="p-6 lg:p-8 space-y-6">


                      {/* GARMENT + QUANTITY */}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>

                          <label
                              htmlFor="garmentType"
                              className="form-label"
                          >
                            Garment Type
                            <span className="text-error ml-1">
                                                    *
                                                </span>
                          </label>


                          <input
                              id="garmentType"
                              type="text"
                              value={
                                form.garmentType
                              }
                              onChange={event =>
                                  updateForm(
                                      'garmentType',
                                      event.target.value
                                  )
                              }
                              className="form-input"
                              placeholder="T-Shirt, Polo Shirt, Hoodie..."
                              required
                          />

                        </div>


                        <div>

                          <label
                              htmlFor="quantity"
                              className="form-label"
                          >
                            Quantity
                            <span className="text-error ml-1">
                                                    *
                                                </span>
                          </label>


                          <input
                              id="quantity"
                              type="number"
                              min="1"
                              step="1"
                              value={
                                form.quantity
                              }
                              onChange={event =>
                                  updateForm(
                                      'quantity',
                                      event.target.value
                                  )
                              }
                              className="form-input"
                              required
                          />

                        </div>

                      </div>


                      {/* FABRIC + COLOR */}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>

                          <label
                              htmlFor="fabric"
                              className="form-label"
                          >
                            Fabric
                          </label>


                          <input
                              id="fabric"
                              type="text"
                              value={
                                form.fabric
                              }
                              onChange={event =>
                                  updateForm(
                                      'fabric',
                                      event.target.value
                                  )
                              }
                              className="form-input"
                              placeholder="100% Cotton, Polyester..."
                          />

                        </div>


                        <div>

                          <label
                              htmlFor="color"
                              className="form-label"
                          >
                            Color
                          </label>


                          <input
                              id="color"
                              type="text"
                              value={
                                form.color
                              }
                              onChange={event =>
                                  updateForm(
                                      'color',
                                      event.target.value
                                  )
                              }
                              className="form-input"
                              placeholder="Navy, White, Black..."
                          />

                        </div>

                      </div>


                      {/* SIZE + DATE */}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>

                          <label
                              htmlFor="size"
                              className="form-label"
                          >
                            Size
                          </label>


                          <input
                              id="size"
                              type="text"
                              value={
                                form.size
                              }
                              onChange={event =>
                                  updateForm(
                                      'size',
                                      event.target.value
                                  )
                              }
                              className="form-input"
                              placeholder="S - XXL / Custom"
                          />

                        </div>


                        <div>

                          <label
                              htmlFor="requestedDeliveryDate"
                              className="form-label"
                          >
                            Required Delivery Date
                          </label>


                          <input
                              id="requestedDeliveryDate"
                              type="date"
                              value={
                                form.requestedDeliveryDate
                              }
                              onChange={event =>
                                  updateForm(
                                      'requestedDeliveryDate',
                                      event.target.value
                                  )
                              }
                              className="form-input"
                          />

                        </div>

                      </div>


                      {/* MESSAGE */}

                      <div>

                        <label
                            htmlFor="customerMessage"
                            className="form-label"
                        >
                          Additional Requirements
                        </label>


                        <textarea
                            id="customerMessage"
                            rows={6}
                            value={
                              form.customerMessage
                            }
                            onChange={event =>
                                updateForm(
                                    'customerMessage',
                                    event.target.value
                                )
                            }
                            className="form-input resize-none"
                            placeholder="Packaging, labels, measurements, printing, embroidery, special instructions..."
                        />

                      </div>


                      {/* CUSTOMER INFO */}

                      <div className="bg-muted border border-border p-5">

                        <div className="section-label mb-3">
                          Customer Account
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

                          <div>

                            <div className="text-xs text-charcoal-muted mb-1">
                              Name
                            </div>

                            <div className="font-medium text-charcoal">
                              {loggedInCustomer.name}
                            </div>

                          </div>


                          <div>

                            <div className="text-xs text-charcoal-muted mb-1">
                              Email
                            </div>

                            <div className="font-medium text-charcoal">
                              {loggedInCustomer.email}
                            </div>

                          </div>


                          <div>

                            <div className="text-xs text-charcoal-muted mb-1">
                              Company
                            </div>

                            <div className="font-medium text-charcoal">
                              {loggedInCustomer.company}
                            </div>

                          </div>


                          <div>

                            <div className="text-xs text-charcoal-muted mb-1">
                              Contact
                            </div>

                            <div className="font-medium text-charcoal">
                              {loggedInCustomer.contact}
                            </div>

                          </div>

                        </div>

                      </div>


                      {/* SUBMIT */}

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">

                        <button
                            type="submit"
                            disabled={
                              submitting
                            }
                            className="btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >

                          {submitting
                              ? 'Submitting...'
                              : 'Submit Quotation Request'
                          }


                          {!submitting && (

                              <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  aria-hidden="true"
                              >

                                <path
                                    d="M5 12h14M12 5l7 7-7 7"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                              </svg>
                          )}

                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    'home'
                                )
                            }
                            disabled={
                              submitting
                            }
                            className="btn-secondary justify-center disabled:opacity-50"
                        >
                          Cancel
                        </button>

                      </div>


                      <p className="text-xs text-charcoal-muted leading-relaxed">

                        Submitting this form creates a
                        quotation request only. An order
                        will not be created automatically.
                        Our Sales Executive will review
                        your request first.

                      </p>

                    </div>

                  </form>
              )}

            </div>


            {/* =================================================
                        RIGHT SIDEBAR
                    ================================================= */}

            <aside className="space-y-5">


              {/* =================================================
                            SELECTED CAMPAIGN
                        ================================================= */}

              {selectedCampaign && (

                  <div className="bg-charcoal text-ivory p-6">

                    <div className="flex items-center justify-between gap-3 mb-5">

                      <div className="section-label text-bronze">
                        Selected Offer
                      </div>


                      <span className="text-[10px] uppercase tracking-widest text-ivory/40">
                                        {selectedCampaign.campaignCode}
                                    </span>

                    </div>


                    <h2 className="font-display text-2xl font-bold mb-3">
                      {selectedCampaign.name}
                    </h2>


                    <div className="text-bronze font-display text-3xl font-bold mb-4">
                      {getDiscountText(
                          selectedCampaign.discount
                      )}
                    </div>


                    <div className="space-y-3 text-sm">

                      <div>

                        <div className="text-ivory/40 text-xs mb-1">
                          Eligible Products
                        </div>

                        <div className="text-ivory/80">
                          {selectedCampaign.products}
                        </div>

                      </div>


                      <div>

                        <div className="text-ivory/40 text-xs mb-1">
                          Campaign Period
                        </div>

                        <div className="text-ivory/80">
                          {formatDate(
                              selectedCampaign.startDate
                          )}

                          {' — '}

                          {formatDate(
                              selectedCampaign.endDate
                          )}
                        </div>

                      </div>

                    </div>


                    <div className="border-t border-ivory/10 mt-5 pt-5">

                      <p className="text-xs text-ivory/50 leading-relaxed">

                        This offer will be attached
                        to your quotation request.
                        The Sales Executive will
                        apply the campaign discount
                        when preparing your final
                        quotation.

                      </p>

                    </div>

                  </div>
              )}


              {/* =================================================
                            NORMAL QUOTATION
                        ================================================= */}

              {!selectedCampaign && (

                  <div className="bg-white border border-border p-6">

                    <div className="section-label mb-3">
                      Custom Request
                    </div>


                    <h2 className="font-display text-xl font-bold text-charcoal mb-3">
                      No Offer Selected
                    </h2>


                    <p className="text-sm text-charcoal-muted leading-relaxed">

                      You can still submit a normal
                      quotation request. Our Sales
                      Executive will review your
                      requirements and provide pricing.

                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                'offers'
                            )
                        }
                        className="text-sm text-bronze font-medium mt-5"
                    >
                      View Current Offers →
                    </button>

                  </div>
              )}


              {/* =================================================
                            HOW IT WORKS
                        ================================================= */}

              <div className="bg-white border border-border p-6">

                <div className="section-label mb-5">
                  How It Works
                </div>


                <div className="space-y-5">


                  <div className="flex gap-4">

                    <div className="w-7 h-7 shrink-0 bg-charcoal text-ivory rounded-full flex items-center justify-center text-xs font-semibold">
                      1
                    </div>


                    <div>

                      <div className="font-medium text-charcoal text-sm">
                        Submit Request
                      </div>

                      <div className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                        Tell us your garment,
                        quantity and requirements.
                      </div>

                    </div>

                  </div>


                  <div className="flex gap-4">

                    <div className="w-7 h-7 shrink-0 bg-charcoal text-ivory rounded-full flex items-center justify-center text-xs font-semibold">
                      2
                    </div>


                    <div>

                      <div className="font-medium text-charcoal text-sm">
                        Sales Review
                      </div>

                      <div className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                        A Sales Executive reviews
                        your request and prepares
                        the pricing.
                      </div>

                    </div>

                  </div>


                  <div className="flex gap-4">

                    <div className="w-7 h-7 shrink-0 bg-charcoal text-ivory rounded-full flex items-center justify-center text-xs font-semibold">
                      3
                    </div>


                    <div>

                      <div className="font-medium text-charcoal text-sm">
                        Quotation Approval
                      </div>

                      <div className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                        Campaign discounts are
                        applied where applicable.
                      </div>

                    </div>

                  </div>


                  <div className="flex gap-4">

                    <div className="w-7 h-7 shrink-0 bg-bronze text-white rounded-full flex items-center justify-center text-xs font-semibold">
                      4
                    </div>


                    <div>

                      <div className="font-medium text-charcoal text-sm">
                        Order Creation
                      </div>

                      <div className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                        An approved quotation can
                        then be converted into an
                        internal order.
                      </div>

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                            CUSTOMER PORTAL
                        ================================================= */}

              <div className="bg-bronze-pale border border-border p-6">

                <div className="section-label mb-3">
                  Customer Portal
                </div>


                <h2 className="font-display text-xl font-bold text-charcoal mb-2">
                  Track Your Requests
                </h2>


                <p className="text-sm text-charcoal-muted leading-relaxed mb-5">

                  After submitting your quotation,
                  you can view its status from your
                  customer dashboard.

                </p>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            'dashboard'
                        )
                    }
                    className="btn-secondary justify-center w-full"
                >
                  Open My Dashboard
                </button>

              </div>

            </aside>

          </div>

        </div>


        {/* =================================================
                BOTTOM INFORMATION
            ================================================= */}

        <div className="border-t border-border bg-white">

          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">


              <div>

                <div className="text-bronze mb-3">

                  <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                  >

                    <path
                        d="M4 5h16v14H4z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />

                    <path
                        d="M4 8h16M8 5v3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />

                  </svg>

                </div>


                <h3 className="font-display font-bold text-charcoal mb-2">
                  Real-Time Request
                </h3>


                <p className="text-sm text-charcoal-muted leading-relaxed">
                  Your request is stored directly
                  in our quotation database.
                </p>

              </div>


              <div>

                <div className="text-bronze mb-3">

                  <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                  >

                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />

                    <path
                        d="M12 7v5l3 2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />

                  </svg>

                </div>


                <h3 className="font-display font-bold text-charcoal mb-2">
                  Sales Review
                </h3>


                <p className="text-sm text-charcoal-muted leading-relaxed">
                  Our Sales team reviews every
                  quotation before an order is created.
                </p>

              </div>


              <div>

                <div className="text-bronze mb-3">

                  <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                  >

                    <path
                        d="M12 3v18M3 12h18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />

                  </svg>

                </div>


                <h3 className="font-display font-bold text-charcoal mb-2">
                  Transparent Pricing
                </h3>


                <p className="text-sm text-charcoal-muted leading-relaxed">
                  Active campaign discounts are
                  preserved with your quotation.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
  )
}