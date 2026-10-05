import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useApp } from '../App'


interface Campaign {

  id: number

  campaignCode: string

  name: string

  type: string

  discount: number

  startDate: string

  endDate: string

  status: string

  tag: string | null

  description: string | null

  eligibleProducts: string | null
}


interface OfferItem {

  id: number

  campaignCode: string

  tag: string

  title: string

  desc: string

  discount: string

  products: string

  startDate: string

  endDate: string

  color: string

  textColor: string
}


const API_BASE_URL =
    'http://localhost:8080/api'


const OFFER_THEMES = [

  {
    color: 'bg-charcoal',
    textColor: 'text-ivory',
  },

  {
    color: 'bg-bronze-pale',
    textColor: 'text-charcoal',
  },

  {
    color: 'bg-muted',
    textColor: 'text-charcoal',
  },

  {
    color: 'bg-ivory-dark',
    textColor: 'text-charcoal',
  },

]


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


function getDefaultTag(
    type: string
): string {

  switch (type) {

    case 'DISCOUNT':
      return 'Campaign'

    case 'SEASONAL':
      return 'Seasonal'

    case 'CLEARANCE':
      return 'Clearance'

    case 'NEW_LAUNCH':
      return 'New Launch'

    default:
      return 'Promotion'
  }
}


function mapCampaignToOffer(
    campaign: Campaign,
    index: number
): OfferItem {

  const theme =
      OFFER_THEMES[
      index %
      OFFER_THEMES.length
          ]


  const tag =
      campaign.tag?.trim() ||
      getDefaultTag(
          campaign.type
      )


  return {

    id:
    campaign.id,

    campaignCode:
    campaign.campaignCode,

    tag,

    title:
    campaign.name,

    desc:
        campaign.description?.trim() ||
        'Special promotional offer available for eligible garments.',

    discount:
        campaign.discount > 0
            ? `${campaign.discount}% off`
            : 'Special Offer',

    products:
        campaign.eligibleProducts?.trim() ||
        'All Garments',

    startDate:
    campaign.startDate,

    endDate:
    campaign.endDate,

    color:
    theme.color,

    textColor:
    theme.textColor,
  }
}


export default function Offers() {

  const {
    navigate,
  } = useApp()


  const [
    campaigns,
    setCampaigns,
  ] =
      useState<Campaign[]>([])


  const [
    filter,
    setFilter,
  ] =
      useState('All')


  const [
    loading,
    setLoading,
  ] =
      useState(true)


  const [
    error,
    setError,
  ] =
      useState('')


  // =========================================================
  // LOAD ACTIVE CAMPAIGNS
  // =========================================================

  useEffect(() => {

    let cancelled =
        false


    const loadCampaigns =
        async () => {

          setLoading(true)

          setError('')


          try {

            const response =
                await fetch(
                    `${API_BASE_URL}/campaigns/active`
                )


            if (!response.ok) {

              throw new Error(
                  `Failed to load offers. Server returned ${response.status}.`
              )
            }


            const data =
                (
                    await response.json()
                ) as Campaign[]


            if (!cancelled) {

              setCampaigns(
                  Array.isArray(data)
                      ? data
                      : []
              )
            }

          } catch (err) {

            if (!cancelled) {

              setError(
                  err instanceof Error
                      ? err.message
                      : 'Failed to load current offers.'
              )

              setCampaigns([])
            }

          } finally {

            if (!cancelled) {

              setLoading(false)
            }
          }
        }


    void loadCampaigns()


    return () => {

      cancelled =
          true
    }

  }, [])


  // =========================================================
  // MAP CAMPAIGNS
  // =========================================================

  const offers =
      useMemo<OfferItem[]>(
          () =>
              campaigns.map(
                  mapCampaignToOffer
              ),
          [campaigns]
      )


  // =========================================================
  // FILTER CATEGORIES
  // =========================================================

  const categories =
      useMemo(
          () => {

            const tags =
                offers
                    .map(
                        offer =>
                            offer.tag.trim()
                    )
                    .filter(Boolean)


            return [

              'All',

              ...Array.from(
                  new Set(tags)
              ),

            ]
          },
          [offers]
      )


  // =========================================================
  // FILTER OFFERS
  // =========================================================

  const filteredOffers =
      useMemo(
          () => {

            if (
                filter === 'All'
            ) {

              return offers
            }


            return offers.filter(
                offer =>
                    offer.tag
                        .toLowerCase() ===
                    filter
                        .toLowerCase()
            )
          },
          [
            filter,
            offers,
          ]
      )


  // =========================================================
  // EXPLORE OFFER
  // =========================================================

  const handleExploreOffer =
      (
          offer: OfferItem
      ) => {

        /*
         * Store the actual campaign selected
         * by the customer.
         *
         * Contact.tsx will read this value and
         * send campaignId to the backend.
         */

        const selectedCampaign = {

          id:
          offer.id,

          campaignCode:
          offer.campaignCode,

          name:
          offer.title,

          discount:
          offer.discount,

          products:
          offer.products,

          startDate:
          offer.startDate,

          endDate:
          offer.endDate,
        }


        sessionStorage.setItem(
            'silkroute_selected_campaign',
            JSON.stringify(
                selectedCampaign
            )
        )


        navigate(
            'contact'
        )
      }


  return (

      <div className="bg-ivory min-h-screen">

        {/* =================================================
                HERO
            ================================================= */}

        <div className="py-16 md:py-24 bg-charcoal text-ivory">

          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

            <div className="section-label text-bronze mb-4">
              Promotions
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-bold text-ivory mb-4">
              Current Offers.
            </h1>

            <p className="text-ivory/60 max-w-lg">
              Active promotions, seasonal deals
              and special discounts for our
              customers.
            </p>

          </div>

        </div>


        {/* =================================================
                FILTER
            ================================================= */}

        {!loading &&
            !error &&
            offers.length > 0 && (

                <div className="border-b border-border sticky top-20 bg-ivory z-30">

                  <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4">

                    <div className="flex gap-2 overflow-x-auto">

                      {categories.map(
                          category => (

                              <button
                                  key={category}
                                  type="button"
                                  onClick={() =>
                                      setFilter(
                                          category
                                      )
                                  }
                                  className={`shrink-0 px-4 py-1.5 text-xs font-medium uppercase tracking-widest transition-all ${
                                      filter ===
                                      category
                                          ? 'bg-charcoal text-ivory'
                                          : 'text-charcoal-muted hover:text-charcoal'
                                  }`}
                              >

                                {category}

                              </button>
                          )
                      )}

                    </div>

                  </div>

                </div>
            )}


        {/* =================================================
                OFFERS CONTENT
            ================================================= */}

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">

          {/* LOADING */}

          {loading && (

              <div className="flex flex-col items-center justify-center py-20">

                <div className="w-9 h-9 border-2 border-charcoal border-t-transparent rounded-full animate-spin mb-5" />

                <p className="text-sm text-charcoal-muted">
                  Loading current offers...
                </p>

              </div>
          )}


          {/* ERROR */}

          {!loading &&
              error && (

                  <div className="max-w-xl mx-auto text-center py-16">

                    <h2 className="font-display text-2xl font-bold text-charcoal mb-3">
                      Unable to Load Offers
                    </h2>

                    <p className="text-sm text-charcoal-muted leading-relaxed">
                      {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            window.location.reload()
                        }
                        className="btn-primary mt-6 text-xs justify-center"
                    >
                      Try Again
                    </button>

                  </div>
              )}


          {/* NO OFFERS */}

          {!loading &&
              !error &&
              filteredOffers.length === 0 && (

                  <div className="max-w-xl mx-auto text-center py-16">

                    <h2 className="font-display text-2xl font-bold text-charcoal mb-3">
                      No Active Offers
                    </h2>

                    <p className="text-sm text-charcoal-muted leading-relaxed">
                      There are currently no
                      active campaigns available.
                      Please check again later.
                    </p>

                  </div>
              )}


          {/* =================================================
                    OFFER CARDS
                ================================================= */}

          {!loading &&
              !error &&
              filteredOffers.length > 0 && (

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {filteredOffers.map(
                        (
                            offer,
                            index
                        ) => (

                            <div
                                key={
                                  offer.id
                                }
                                className={`card-hover border border-border p-8 flex flex-col ${offer.color} animate-fade-up`}
                                style={{
                                  animationDelay:
                                      `${index * 0.07}s`,
                                }}
                            >

                              {/* TAG */}

                              <div className="flex items-center justify-between gap-4 mb-6">

                                            <span className="status-badge bg-bronze/20 text-bronze text-[10px]">
                                                {offer.tag}
                                            </span>

                                <span
                                    className={`text-xs ${
                                        offer.textColor ===
                                        'text-ivory'
                                            ? 'text-ivory/50'
                                            : 'text-charcoal-muted'
                                    }`}
                                >
                                                Until{' '}
                                  {formatDate(
                                      offer.endDate
                                  )}
                                            </span>

                              </div>


                              {/* DISCOUNT */}

                              <div className="font-display text-4xl font-bold text-bronze mb-2">
                                {offer.discount}
                              </div>


                              {/* TITLE */}

                              <h3
                                  className={`font-display text-xl font-bold mb-3 ${offer.textColor}`}
                              >
                                {offer.title}
                              </h3>


                              {/* DESCRIPTION */}

                              <p
                                  className={`text-sm leading-relaxed flex-1 mb-5 ${
                                      offer.textColor ===
                                      'text-ivory'
                                          ? 'text-ivory/60'
                                          : 'text-charcoal-muted'
                                  }`}
                              >
                                {offer.desc}
                              </p>


                              {/* ELIGIBLE */}

                              <div
                                  className={`text-xs mb-3 ${
                                      offer.textColor ===
                                      'text-ivory'
                                          ? 'text-ivory/40'
                                          : 'text-charcoal-muted'
                                  }`}
                              >
                                Eligible:{' '}
                                {offer.products}
                              </div>


                              {/* CAMPAIGN CODE */}

                              <div
                                  className={`text-xs mb-6 ${
                                      offer.textColor ===
                                      'text-ivory'
                                          ? 'text-ivory/40'
                                          : 'text-charcoal-muted'
                                  }`}
                              >
                                Campaign:{' '}
                                {offer.campaignCode}
                              </div>


                              {/* EXPLORE */}

                              <button
                                  type="button"
                                  onClick={() =>
                                      handleExploreOffer(
                                          offer
                                      )
                                  }
                                  className={`${
                                      offer.textColor ===
                                      'text-ivory'
                                          ? 'btn-bronze'
                                          : 'btn-primary'
                                  } text-xs justify-center`}
                              >

                                Request Quote

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

                              </button>

                            </div>
                        )
                    )}

                  </div>
              )}

        </div>


        {/* =================================================
                CUSTOM OFFER
            ================================================= */}

        <div className="bg-bronze-pale py-16 border-t border-border">

          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">

            <div className="section-label mb-3">
              Need a Custom Offer?
            </div>

            <h2 className="font-display text-3xl font-bold text-charcoal mb-5">
              Discuss Your Requirements.
            </h2>

            <p className="text-charcoal-muted mb-6 max-w-xl mx-auto">
              Contact our team to discuss bulk
              orders, custom garments,
              private-label requirements,
              or other promotional opportunities.
            </p>

            <button
                type="button"
                onClick={() =>
                    navigate(
                        'contact'
                    )
                }
                className="btn-primary text-xs justify-center"
            >
              Contact Our Team
            </button>

          </div>

        </div>

      </div>
  )
}