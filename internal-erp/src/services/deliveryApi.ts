import type {
  Delivery,
  DeliveryStatus,
  Priority,
} from '../types';

import { apiFetch } from './apiClient';

const API_BASE_URL =
    'http://localhost:8080/api/deliveries';


// ============================================================
// BACKEND DELIVERY
// ============================================================

export interface BackendDelivery {
  id: number;

  deliveryCode: string;

  orderId: string;

  customer: string;

  deliveryAddress: string;

  scheduledDate: string;

  deliveredDate?: string;

  officer: string;

  method:
      | 'ROAD'
      | 'RAIL'
      | 'AIR'
      | 'COURIER'
      | 'OWN_VEHICLE';

  priority:
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH'
      | 'URGENT';

  status:
      | 'SCHEDULED'
      | 'OUT_FOR_DELIVERY'
      | 'DELIVERED'
      | 'DELAYED'
      | 'CANCELLED'
      | 'FAILED';

  specialInstructions?: string;

  garmentType: string;

  quantity: number;

  receivedBy?: string;

  deliveryNotes?: string;
}


// ============================================================
// BACKEND → FRONTEND
// ============================================================

export function toFrontendDelivery(
    b: BackendDelivery
): Delivery & {
  numericId: number;
} {
  return {
    id:
        b.deliveryCode ||
        `DEL-${b.id}`,

    numericId: b.id,

    orderId: b.orderId,

    customer: b.customer,

    deliveryAddress:
    b.deliveryAddress,

    scheduledDate:
    b.scheduledDate,

    deliveredDate:
    b.deliveredDate,

    officer:
    b.officer,

    method:
        b.method.toLowerCase() as Delivery['method'],

    priority:
        b.priority.toLowerCase() as Priority,

    status:
        b.status.toLowerCase() as DeliveryStatus,

    specialInstructions:
    b.specialInstructions,

    garmentType:
    b.garmentType,

    quantity:
    b.quantity,

    receivedBy:
    b.receivedBy,

    deliveryNotes:
    b.deliveryNotes,
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
// GET ALL DELIVERIES
// ============================================================

export async function fetchAllDeliveries(): Promise<
    Array<
        Delivery & {
      numericId: number;
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
        'Failed to fetch deliveries'
    );
  }

  const data =
      (await response.json()) as BackendDelivery[];

  return data.map(
      toFrontendDelivery
  );
}


// ============================================================
// CREATE DELIVERY
// ============================================================

export async function createDelivery(
    delivery: {
      deliveryCode?: string;

      orderId: string;

      customer: string;

      deliveryAddress: string;

      scheduledDate: string;

      officer: string;

      method: string;

      priority: string;

      status?: string;

      specialInstructions?: string;

      garmentType: string;

      quantity: number;
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
              ...delivery,

              method:
                  delivery.method.toUpperCase(),

              priority:
                  delivery.priority.toUpperCase(),

              status:
                  (
                      delivery.status ||
                      'SCHEDULED'
                  ).toUpperCase(),
            }),
          }
      );

  if (!response.ok) {
    await handleError(
        response,
        'Failed to create delivery'
    );
  }

  return toFrontendDelivery(
      await response.json()
  );
}


// ============================================================
// UPDATE DELIVERY
// ============================================================

export async function updateDelivery(
    id: number,
    delivery: Partial<Delivery>
) {
  const payload: Record<
      string,
      unknown
  > = {
    ...delivery,
  };

  if (delivery.method) {
    payload.method =
        delivery.method.toUpperCase();
  }

  if (delivery.priority) {
    payload.priority =
        delivery.priority.toUpperCase();
  }

  if (delivery.status) {
    payload.status =
        delivery.status.toUpperCase();
  }

  const response =
      await apiFetch(
          `${API_BASE_URL}/${id}`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                  'application/json',
            },

            body: JSON.stringify(
                payload
            ),
          }
      );

  if (!response.ok) {
    await handleError(
        response,
        'Failed to update delivery'
    );
  }

  return toFrontendDelivery(
      await response.json()
  );
}


// ============================================================
// UPDATE DELIVERY STATUS
// ============================================================

export async function updateDeliveryStatus(
    id: number,
    status: DeliveryStatus,
    receivedBy?: string,
    notes?: string
) {
  let url =
      `${API_BASE_URL}/${id}/status?status=${encodeURIComponent(
          status.toUpperCase()
      )}`;

  if (receivedBy) {
    url +=
        `&receivedBy=${encodeURIComponent(
            receivedBy
        )}`;
  }

  if (notes) {
    url +=
        `&notes=${encodeURIComponent(
            notes
        )}`;
  }

  const response =
      await apiFetch(
          url,
          {
            method: 'PATCH',
          }
      );

  if (!response.ok) {
    await handleError(
        response,
        'Failed to update delivery status'
    );
  }

  return toFrontendDelivery(
      await response.json()
  );
}


// ============================================================
// DELETE DELIVERY
// ============================================================

export async function deleteDelivery(
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
        'Failed to delete delivery'
    );
  }
}