import type { Campaign } from '../types';

import { apiFetch } from './apiClient';

const API_BASE_URL =
    'http://localhost:8080/api/campaigns';


// ============================================================
// BACKEND CAMPAIGN
// ============================================================

export interface BackendCampaign {
  id: number;

  campaignCode: string;

  name: string;

  type:
      | 'DISCOUNT'
      | 'SEASONAL'
      | 'CLEARANCE'
      | 'NEW_LAUNCH';

  discount: number;

  startDate: string;

  endDate: string;

  status:
      | 'ACTIVE'
      | 'SCHEDULED'
      | 'EXPIRED';

  ordersUsed: number;

  revenue: number;

  tag?: string;

  description?: string;

  eligibleProducts?: string;
}


// ============================================================
// MARKETING SUMMARY
// ============================================================

export interface MarketingSummary {
  activeCampaigns: number;

  scheduledCampaigns: number;

  ordersUsed: number;

  promoRevenue: number;

  totalCampaigns: number;
}


// ============================================================
// BACKEND → FRONTEND
// ============================================================

export function toFrontendCampaign(
    b: BackendCampaign
): Campaign & {
  numericId: number;
  tag?: string;
  desc?: string;
} {
  const typeMap: Record<
      BackendCampaign['type'],
      Campaign['type']
  > = {
    DISCOUNT: 'discount',
    SEASONAL: 'seasonal',
    CLEARANCE: 'clearance',
    NEW_LAUNCH: 'new_launch',
  };

  const statusMap: Record<
      BackendCampaign['status'],
      Campaign['status']
  > = {
    ACTIVE: 'active',
    SCHEDULED: 'scheduled',
    EXPIRED: 'expired',
  };

  return {
    id:
        b.campaignCode ||
        `CAM${b.id}`,

    numericId:
    b.id,

    name:
    b.name,

    type:
        typeMap[b.type],

    discount:
    b.discount,

    startDate:
    b.startDate,

    endDate:
    b.endDate,

    status:
        statusMap[b.status],

    ordersUsed:
        b.ordersUsed || 0,

    revenue:
        b.revenue || 0,

    tag:
    b.tag,

    desc:
    b.description,
  };
}


// ============================================================
// ERROR HANDLER
// ============================================================

async function handleError(
    response: Response,
    action: string
): Promise<never> {
  const error =
      await response
          .json()
          .catch(() => null);

  throw new Error(
      error?.error ||
      error?.message ||
      `${action}: HTTP ${response.status}`
  );
}


// ============================================================
// GET ALL CAMPAIGNS
// ============================================================

export async function fetchAllCampaigns(): Promise<
    Array<
        Campaign & {
      numericId: number;
      tag?: string;
      desc?: string;
    }
    >
> {
  const response =
      await apiFetch(
          API_BASE_URL
      );

  if (!response.ok) {
    await handleError(
        response,
        'Failed to fetch campaigns'
    );
  }

  const data =
      (await response.json()) as BackendCampaign[];

  return data.map(
      toFrontendCampaign
  );
}


// ============================================================
// MARKETING SUMMARY
// ============================================================

export async function fetchMarketingSummary(): Promise<MarketingSummary> {
  const response =
      await apiFetch(
          `${API_BASE_URL}/summary`
      );

  if (!response.ok) {
    await handleError(
        response,
        'Failed to fetch marketing summary'
    );
  }

  return response.json();
}


// ============================================================
// CREATE CAMPAIGN
// ============================================================

export async function createCampaign(
    campaign: {
      campaignCode?: string;

      name: string;

      type?: string;

      discount: number;

      startDate?: string;

      endDate?: string;

      status?: string;

      ordersUsed?: number;

      revenue?: number;

      tag?: string;

      description?: string;

      eligibleProducts?: string;
    }
) {
  const response =
      await apiFetch(
          API_BASE_URL,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                  'application/json',
            },

            body: JSON.stringify({
              ...campaign,

              type:
                  (
                      campaign.type ||
                      'DISCOUNT'
                  )
                      .replace(
                          '-',
                          '_'
                      )
                      .toUpperCase(),

              status:
                  (
                      campaign.status ||
                      'ACTIVE'
                  ).toUpperCase(),
            }),
          }
      );

  if (!response.ok) {
    await handleError(
        response,
        'Failed to create campaign'
    );
  }

  return toFrontendCampaign(
      await response.json()
  );
}


// ============================================================
// UPDATE CAMPAIGN STATUS
// ============================================================

export async function updateCampaignStatus(
    id: number,
    status:
        | 'ACTIVE'
        | 'SCHEDULED'
        | 'EXPIRED'
) {
  const response =
      await apiFetch(
          `${API_BASE_URL}/${id}/status`,
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                  'application/json',
            },

            body: JSON.stringify({
              status,
            }),
          }
      );

  if (!response.ok) {
    await handleError(
        response,
        'Failed to update campaign status'
    );
  }

  return toFrontendCampaign(
      await response.json()
  );
}


// ============================================================
// DELETE CAMPAIGN
// ============================================================

export async function deleteCampaign(
    id: number
): Promise<void> {
  const response =
      await apiFetch(
          `${API_BASE_URL}/${id}`,
          {
            method: 'DELETE',
          }
      );

  if (!response.ok) {
    await handleError(
        response,
        'Failed to delete campaign'
    );
  }
}