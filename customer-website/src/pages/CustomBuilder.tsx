import {
  useEffect,
  useState,
} from 'react'

import { useApp } from '../App'

import {
  createQuotation,
} from '../services/customerApi'

interface CustomerCampaign {
  id: number
  campaignCode: string
  name: string
  discount: number
  description?: string | null
}

const GARMENTS = [
  'T-Shirt',
  'Polo Shirt',
  'Hoodie',
  'Jacket',
]


const FABRICS = [
  '100% Cotton',
  'Polyester',
  'Cotton Blend',
  'Pique Cotton',
]


const COLORS = [
  'Charcoal',
  'White',
  'Navy',
  'Forest',
  'Burgundy',
  'Bronze',
  'Slate',
  'Camel',
]


const SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
]


const PRINTS = [
  'None',
  'Embroidery',
  'Screen Print',
  'Heat Transfer',
]


export default function CustomBuilder() {

  const {
    navigate,
    customer,
  } = useApp()


  const [
    garment,
    setGarment,
  ] =
      useState('T-Shirt')


  const [
    fabric,
    setFabric,
  ] =
      useState('100% Cotton')


  const [
    color,
    setColor,
  ] =
      useState('Navy')


  const [
    sizes,
    setSizes,
  ] =
      useState<string[]>([
        'M',
        'L',
      ])


  const [
    quantity,
    setQuantity,
  ] =
      useState(100)


  const [
    printType,
    setPrintType,
  ] =
      useState('None')


  const [
    targetDeliveryDate,
    setTargetDeliveryDate,
  ] =
      useState('')


  const [
    notes,
    setNotes,
  ] =
      useState('')


  const [
    selectedCampaign,
    setSelectedCampaign,
  ] =
      useState<CustomerCampaign | null>(
          null
      )


  const [
    loading,
    setLoading,
  ] =
      useState(false)


  const [
    submitted,
    setSubmitted,
  ] =
      useState(false)


  const [
    quotationNumber,
    setQuotationNumber,
  ] =
      useState('')


  const [
    error,
    setError,
  ] =
      useState('')


  /*
   * Load selected campaign.
   */
  useEffect(() => {

    const storedCampaign =
        sessionStorage.getItem(
            'silkroute_selected_campaign'
        )


    if (!storedCampaign) {

      setSelectedCampaign(
          null
      )

      return
    }


    try {

      setSelectedCampaign(
          JSON.parse(
              storedCampaign
          ) as CustomerCampaign
      )

    } catch {

      sessionStorage.removeItem(
          'silkroute_selected_campaign'
      )

      setSelectedCampaign(
          null
      )
    }

  }, [])


  /*
   * Customer must be logged in.
   */
  if (!customer) {

    return (

        <div className="min-h-screen bg-ivory flex items-center justify-center p-6">

          <div className="text-center">

            <h2 className="font-display text-2xl font-bold text-charcoal mb-3">
              Sign in required
            </h2>


            <p className="text-sm text-charcoal-muted mb-6">
              Please sign in to request a quotation.
            </p>


            <button
                onClick={() =>
                    navigate('login')
                }
                className="btn-primary"
            >
              Sign in to request a quote
            </button>

          </div>

        </div>
    )
  }


  const toggleSize =
      (
          size: string
      ) => {

        setSizes(
            (previous) =>
                previous.includes(size)
                    ? previous.filter(
                        (item) =>
                            item !== size
                    )
                    : [
                      ...previous,
                      size,
                    ]
        )
      }


  const submit =
      async () => {

        setError('')


        if (!sizes.length) {

          setError(
              'Please select at least one size.'
          )

          return
        }


        if (quantity < 1) {

          setError(
              'Quantity must be at least 1.'
          )

          return
        }


        if (!targetDeliveryDate) {

          setError(
              'Please select a target delivery date.'
          )

          return
        }


        try {

          setLoading(true)


          const customerMessage = [

            `Branding: ${printType}`,

            notes.trim()
                ? `Additional requirements: ${notes.trim()}`
                : '',

          ]
              .filter(Boolean)
              .join('\n')


          const quotation =
              await createQuotation({

                customerId:
                customer.id,

                campaignId:
                selectedCampaign?.id,

                garmentType:
                garment,

                quantity:
                quantity,

                fabric:
                fabric,

                color:
                color,

                size:
                    sizes.join(', '),

                requestedDeliveryDate:
                targetDeliveryDate,

                customerMessage:
                    customerMessage ||
                    undefined,
              })


          sessionStorage.removeItem(
              'silkroute_selected_campaign'
          )


          setQuotationNumber(
              quotation.quotationNumber
          )


          setSubmitted(true)

        } catch (err) {

          setError(
              err instanceof Error
                  ? err.message
                  : 'Unable to submit quotation request.'
          )

        } finally {

          setLoading(false)
        }
      }


  if (submitted) {

    return (

        <div className="min-h-screen bg-ivory flex items-center justify-center p-6">

          <div className="max-w-lg bg-white border border-border p-8 text-center">

            <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-5 text-2xl">
              ✓
            </div>


            <div className="section-label text-success mb-2">
              Request Submitted
            </div>


            <h2 className="font-display text-3xl font-bold text-charcoal mb-3">
              Quotation request received.
            </h2>


            <p className="text-sm text-charcoal-muted mb-4">
              Your quotation request has been saved to the database.
            </p>


            {quotationNumber && (

                <div className="bg-muted border border-border p-4 mb-6">

                  <p className="text-xs text-charcoal-muted uppercase tracking-wider">
                    Quotation Number
                  </p>


                  <p className="font-display text-xl font-bold text-charcoal mt-1">
                    {quotationNumber}
                  </p>

                </div>
            )}


            <p className="text-sm text-charcoal-muted mb-6">
              A Sales Executive will review your quotation before
              an internal order is created.
            </p>


            <button
                onClick={() =>
                    navigate('dashboard')
                }
                className="btn-primary"
            >
              Go to Dashboard
            </button>

          </div>

        </div>
    )
  }


  return (

      <div className="bg-ivory min-h-screen">

        <div className="py-12 border-b border-border">

          <div className="max-w-[1100px] mx-auto px-6">

            <div className="section-label mb-3">
              Quotation Request
            </div>


            <h1 className="font-display text-4xl font-bold text-charcoal">
              Configure Your Garment.
            </h1>


            <p className="text-sm text-charcoal-muted mt-2">
              This creates a quotation request, not an internal order.
            </p>

          </div>

        </div>


        <div className="max-w-[1100px] mx-auto px-6 py-10">

          {error && (

              <div className="bg-error/10 border border-error/20 text-error p-3 mb-6 text-sm">
                {error}
              </div>

          )}


          {/* =================================================
              SELECTED OFFER
          ================================================= */}

          {selectedCampaign && (

              <div className="mb-8 border border-bronze/30 bg-bronze-pale p-6">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>

                    <div className="section-label text-bronze mb-2">
                      Selected Offer
                    </div>


                    <h2 className="font-display text-2xl font-bold text-charcoal">
                      {selectedCampaign.name}
                    </h2>


                    <p className="text-sm text-charcoal-muted mt-1">
                      Campaign:
                      {' '}
                      {selectedCampaign.campaignCode}
                    </p>

                  </div>


                  <div className="text-left md:text-right">

                    <div className="font-display text-3xl font-bold text-bronze">
                      {selectedCampaign.discount}
                    </div>


                    <p className="text-xs text-charcoal-muted mt-1">
                      Applied to the price approved by Sales
                    </p>

                  </div>

                </div>


                {selectedCampaign.description && (

                    <p className="text-sm text-charcoal-muted mt-4">
                      {selectedCampaign.description}
                    </p>

                )}

              </div>
          )}


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* =================================================
                FORM
            ================================================= */}

            <div className="bg-white border border-border p-6 space-y-7">

              <section>

                <h2 className="font-display text-xl font-bold mb-4">
                  Garment Type
                </h2>


                <div className="grid grid-cols-2 gap-3">

                  {GARMENTS.map(
                      (item) => (

                          <button
                              key={item}
                              type="button"
                              onClick={() =>
                                  setGarment(
                                      item
                                  )
                              }
                              className={`p-4 border-2 text-left ${
                                  garment === item
                                      ? 'border-charcoal bg-charcoal text-ivory'
                                      : 'border-border'
                              }`}
                          >
                            {item}
                          </button>

                      )
                  )}

                </div>

              </section>


              <section>

                <h2 className="font-display text-xl font-bold mb-4">
                  Fabric
                </h2>


                <select
                    value={fabric}
                    onChange={(event) =>
                        setFabric(
                            event.target.value
                        )
                    }
                    className="form-input"
                >

                  {FABRICS.map(
                      (item) => (

                          <option
                              key={item}
                              value={item}
                          >
                            {item}
                          </option>

                      )
                  )}

                </select>

              </section>


              <section>

                <h2 className="font-display text-xl font-bold mb-4">
                  Colour
                </h2>


                <div className="grid grid-cols-4 gap-2">

                  {COLORS.map(
                      (item) => (

                          <button
                              key={item}
                              type="button"
                              onClick={() =>
                                  setColor(
                                      item
                                  )
                              }
                              className={`p-3 border text-xs ${
                                  color === item
                                      ? 'border-charcoal font-bold'
                                      : 'border-border'
                              }`}
                          >
                            {item}
                          </button>

                      )
                  )}

                </div>

              </section>


              <section>

                <h2 className="font-display text-xl font-bold mb-4">
                  Sizes
                </h2>


                <div className="flex flex-wrap gap-2">

                  {SIZES.map(
                      (item) => (

                          <button
                              key={item}
                              type="button"
                              onClick={() =>
                                  toggleSize(
                                      item
                                  )
                              }
                              className={`w-14 h-12 border ${
                                  sizes.includes(item)
                                      ? 'bg-charcoal text-ivory border-charcoal'
                                      : 'border-border'
                              }`}
                          >
                            {item}
                          </button>

                      )
                  )}

                </div>

              </section>


              <section>

                <h2 className="font-display text-xl font-bold mb-4">
                  Quantity
                </h2>


                <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) => {

                      const value =
                          Number(
                              event.target.value
                          )


                      setQuantity(
                          Number.isFinite(value) &&
                          value > 0
                              ? value
                              : 1
                      )
                    }}
                    className="form-input"
                />

              </section>


              <section>

                <h2 className="font-display text-xl font-bold mb-4">
                  Branding
                </h2>


                <select
                    value={printType}
                    onChange={(event) =>
                        setPrintType(
                            event.target.value
                        )
                    }
                    className="form-input"
                >

                  {PRINTS.map(
                      (item) => (

                          <option
                              key={item}
                              value={item}
                          >
                            {item}
                          </option>

                      )
                  )}

                </select>

              </section>


              <section>

                <h2 className="font-display text-xl font-bold mb-4">
                  Delivery &amp; Notes
                </h2>


                <div className="space-y-4">

                  <div>

                    <label className="form-label">
                      Target Delivery Date
                    </label>


                    <input
                        type="date"
                        value={targetDeliveryDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(event) =>
                            setTargetDeliveryDate(
                                event.target.value
                            )
                        }
                        className="form-input"
                    />

                  </div>


                  <div>

                    <label className="form-label">
                      Additional Requirements
                    </label>


                    <textarea
                        rows={4}
                        value={notes}
                        onChange={(event) =>
                            setNotes(
                                event.target.value
                            )
                        }
                        className="form-input resize-none"
                        placeholder="Add any additional requirements..."
                    />

                  </div>

                </div>

              </section>


              <button
                  type="button"
                  onClick={() =>
                      void submit()
                  }
                  disabled={loading}
                  className="btn-primary w-full justify-center disabled:opacity-50"
              >
                {loading
                    ? 'Submitting...'
                    : 'Submit Quotation Request'}
              </button>

            </div>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="bg-charcoal text-ivory p-7 h-fit lg:sticky lg:top-28">

              <div className="section-label text-bronze mb-5">
                Request Summary
              </div>


              <div className="space-y-4 text-sm">

                <Row
                    label="Customer"
                    value={customer.name}
                />


                <Row
                    label="Company"
                    value={customer.company}
                />


                <Row
                    label="Email"
                    value={customer.email}
                />


                <Row
                    label="Offer"
                    value={
                      selectedCampaign
                          ? `${selectedCampaign.name} (${selectedCampaign.discount}% off)`
                          : 'No offer selected'
                    }
                />


                <Row
                    label="Garment"
                    value={garment}
                />


                <Row
                    label="Fabric"
                    value={fabric}
                />


                <Row
                    label="Colour"
                    value={color}
                />


                <Row
                    label="Sizes"
                    value={
                        sizes.join(', ') ||
                        '—'
                    }
                />


                <Row
                    label="Quantity"
                    value={
                      `${quantity.toLocaleString()} units`
                    }
                />


                <Row
                    label="Branding"
                    value={printType}
                />


                <Row
                    label="Target Delivery"
                    value={
                        targetDeliveryDate ||
                        'Not selected'
                    }
                />

              </div>


              {/* =================================================
                  PRICING
              ================================================= */}

              <div className="border-t border-ivory/10 mt-6 pt-5">

                <p className="text-xs text-bronze mb-2">
                  Offer pricing
                </p>


                <p className="text-sm text-ivory/70 leading-6">

                  {selectedCampaign

                      ? `Your ${selectedCampaign.discount} discount will be applied to the unit price confirmed by our Sales Executive.`

                      : 'If an offer is selected, its discount will be applied to the unit price confirmed by our Sales Executive.'}

                </p>

              </div>


              {/* =================================================
                  NEXT STEP
              ================================================= */}

              <div className="border-t border-ivory/10 mt-6 pt-5">

                <p className="text-xs text-ivory/50 mb-2">
                  What happens next?
                </p>


                <p className="text-sm text-ivory/80 leading-6">
                  Your request will be stored as a quotation.
                  The internal Sales Executive will review it and,
                  if approved, convert it into an order.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
  )
}


function Row({
               label,
               value,
             }: {
  label: string
  value: string
}) {

  return (

      <div className="flex justify-between gap-5 border-b border-ivory/10 pb-3">

        <span className="text-ivory/50">
          {label}
        </span>


        <span className="font-medium text-right">
          {value}
        </span>

      </div>
  )
}