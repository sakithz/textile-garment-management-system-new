/*
 * This file is kept only for backward-compatible imports
 * from older UI files.
 *
 * IMPORTANT:
 *
 * There are NO hard-coded business records here.
 *
 * All real business data must come from:
 *
 * React
 *   ↓
 * API Service
 *   ↓
 * Spring Boot
 *   ↓
 * MySQL
 */

import type {
  Role,
  User,
  OrderStatus,
  Priority,
  Order,
  Customer,
  Material,
  ProductionTask,
  Invoice,
  Campaign,
  Employee,
  DeliveryStatus,
  DeliveryMethod,
  Delivery,
} from '../types';

export type {
  Role,
  User,
  OrderStatus,
  Priority,
  Order,
  Customer,
  Material,
  ProductionTask,
  Invoice,
  Campaign,
  Employee,
  DeliveryStatus,
  DeliveryMethod,
  Delivery,
} from '../types';

/*
 * Empty compatibility arrays.
 *
 * These are NOT fallback business data.
 *
 * They are intentionally empty.
 */

export const USERS: User[] = [];

export const ORDERS: Order[] = [];

export const CUSTOMERS: Customer[] = [];

export const MATERIALS: Material[] = [];

export const PRODUCTION_TASKS: ProductionTask[] = [];

export const INVOICES: Invoice[] = [];

export const CAMPAIGNS: Campaign[] = [];

export const EMPLOYEES: Employee[] = [];

export const DELIVERIES: Delivery[] = [];

export const REVENUE_DATA: Array<{
  month: string;
  revenue: number;
  orders?: number;
}> = [];

export const ORDER_STATUS_DATA: Array<{
  name: string;
  value: number;
  color: string;
}> = [];

export const GARMENT_DATA: Array<{
  type: string;
  count: number;
}> = [];

export const NOTIFICATIONS: Array<{
  id: string;
  type: string;
  message: string;
  time: string;
  read: boolean;
}> = [];

export const DELIVERY_TIMELINE_DATA: Array<{
  date: string;
  delivered: number;
  delayed: number;
}> = [];

export const DELIVERY_OFFICERS: string[] = [];

export const PRODUCTION_STAGES = [
  'cutting',
  'stitching',
  'finishing',
  'quality_check',
] as const;

export const DELIVERY_STATUS_LABELS: Record<
    DeliveryStatus,
    string
> = {
  scheduled: 'Scheduled',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  delayed: 'Delayed',
  cancelled: 'Cancelled',
  failed: 'Failed',
};


/* ============================================================
   CURRENCY
   ============================================================ */

export function formatCurrency(
    amount: number
): string {

  if (!Number.isFinite(amount)) {
    return 'LKR 0';
  }

  if (amount >= 100000) {
    return `LKR ${(
        amount / 100000
    ).toFixed(1)}L`;
  }

  return `LKR ${amount.toLocaleString(
      'en-LK'
  )}`;
}


/* ============================================================
   DATE
   ============================================================ */

export function formatDate(
    dateStr?: string | null
): string {

  if (!dateStr) {
    return '-';
  }

  const date =
      new Date(dateStr);

  if (Number.isNaN(
      date.getTime()
  )) {
    return dateStr;
  }

  return date.toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
  );
}