import { apiFetch } from './apiClient';

import {
  type Order,
  type ProductionTask,
  type Priority,
} from '../types';


const API_BASE_URL =
    'http://localhost:8080/api/production/tasks';


/*
 * ============================================================
 * BACKEND CUSTOMER
 * ============================================================
 *
 * The Spring Boot backend returns the Customer entity as an
 * object through the Order -> Customer relationship.
 *
 * Example:
 *
 * {
 *   id: 7,
 *   customerCode: "C109",
 *   name: "Sadun",
 *   company: "sadun pvt",
 *   ...
 * }
 *
 * The frontend Order / ProductionTask types expect customer
 * to be a string, so we normalize it below.
 * ============================================================
 */
export interface BackendCustomer {

  id?: number;

  customerCode?: string;

  name?: string;

  contact?: string;

  email?: string;

  company?: string;

  country?: string | null;

  status?: string;

  totalOrders?: number;

  lastOrder?: string | null;

  totalValue?: number;
}


/*
 * Backend may return either:
 *
 * customer: "Sadun"
 *
 * OR:
 *
 * customer: {
 *     name: "Sadun",
 *     company: "sadun pvt",
 *     ...
 * }
 */
export type BackendCustomerValue =
    | string
    | BackendCustomer
    | null
    | undefined;


/*
 * Convert the backend customer value into a safe
 * frontend display string.
 */
function getCustomerDisplayName(
    customer: BackendCustomerValue
): string {

  if (!customer) {

    return 'Unknown Customer';
  }


  if (typeof customer === 'string') {

    return customer;
  }


  return (
      customer.name ||
      customer.company ||
      customer.customerCode ||
      'Unknown Customer'
  );
}


/*
 * ============================================================
 * BACKEND PRODUCTION TASK
 * ============================================================
 */
export interface BackendProductionTask {

  id: number;

  taskCode: string;

  orderRef: string;

  customer: BackendCustomerValue;

  garmentType: string;

  quantity: number;

  stage:
      | 'CUTTING'
      | 'STITCHING'
      | 'FINISHING'
      | 'QUALITY_CHECK';

  assignedTo: string;

  startDate: string;

  dueDate: string;

  progress: number;

  priority:
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH'
      | 'URGENT';
}


/*
 * ============================================================
 * BACKEND APPROVED ORDER
 * ============================================================
 */
export interface BackendApprovedOrder {

  id: number;

  orderNumber: string;

  customer: BackendCustomerValue;

  garmentType: string;

  quantity: number;

  orderDate: string;

  deliveryDate: string;

  priority: string;

  status: string;

  progress: number;

  unitPrice: number;

  total: number;

  fabric?: string;

  color?: string;

  size?: string;
}


/*
 * ============================================================
 * PRIORITY MAPPING
 * ============================================================
 */
const priorityMap:
    Record<string, Priority> = {

  LOW:
      'low',

  MEDIUM:
      'medium',

  HIGH:
      'high',

  URGENT:
      'urgent',
};


/*
 * ============================================================
 * CONVERT BACKEND PRODUCTION TASK
 * ============================================================
 */
export function toFrontendProductionTask(
    b: BackendProductionTask
):
    ProductionTask & {
  numericId: number
} {

  const stageMap:
      Record<
          string,
          ProductionTask['stage']
      > = {

    CUTTING:
        'cutting',

    STITCHING:
        'stitching',

    FINISHING:
        'finishing',

    QUALITY_CHECK:
        'quality_check',
  };


  return {

    id:
        b.taskCode ||
        `PT-${b.id}`,

    numericId:
    b.id,

    orderId:
    b.orderRef,

    orderRef:
    b.orderRef,

    /*
     * IMPORTANT:
     *
     * Backend may return a Customer object.
     *
     * Convert it to a string before it reaches
     * Production.tsx.
     */
    customer:
        getCustomerDisplayName(
            b.customer
        ),

    garmentType:
    b.garmentType,

    quantity:
    b.quantity,

    stage:
        stageMap[b.stage] ||
        'cutting',

    assignedTo:
    b.assignedTo,

    startDate:
    b.startDate,

    dueDate:
    b.dueDate,

    progress:
        b.progress ?? 0,

    priority:
        priorityMap[b.priority] ||
        'medium',
  };
}


/*
 * ============================================================
 * CONVERT BACKEND APPROVED ORDER
 * ============================================================
 */
export function toFrontendApprovedOrder(
    b: BackendApprovedOrder
):
    Order & {
  numericId: number
} {

  return {

    id:
    b.orderNumber,

    numericId:
    b.id,

    /*
     * IMPORTANT FIX:
     *
     * Backend Order.customer is a Customer object.
     *
     * Frontend Order.customer is a string.
     *
     * Never pass the object directly to React.
     */
    customer:
        getCustomerDisplayName(
            b.customer
        ),

    garmentType:
    b.garmentType,

    quantity:
    b.quantity,

    orderDate:
    b.orderDate,

    deliveryDate:
    b.deliveryDate,

    priority:
        priorityMap[b.priority] ||
        'medium',

    /*
     * Approved orders are shown in the
     * Operations Manager Production page.
     */
    status:
        'approved',

    progress:
        b.progress ?? 15,

    unitPrice:
        b.unitPrice ?? 0,

    total:
        b.total ?? 0,

    fabric:
        b.fabric || '',

    color:
        b.color || '',

    size:
        b.size || '',
  };
}


/*
 * ============================================================
 * FETCH ALL PRODUCTION TASKS
 * ============================================================
 */
export async function
fetchAllProductionTasks():
    Promise<
        (ProductionTask & {
          numericId: number
        })[]
    > {

  const response =
      await apiFetch(
          API_BASE_URL
      );


  if (!response.ok) {

    throw new Error(
        `Failed to fetch production tasks: HTTP ${response.status}`
    );
  }


  const data:
      BackendProductionTask[] =
      await response.json();


  return data.map(
      toFrontendProductionTask
  );
}


/*
 * ============================================================
 * FETCH APPROVED ORDERS
 * ============================================================
 */
export async function
fetchApprovedOrders():
    Promise<
        (Order & {
          numericId: number
        })[]
    > {

  const response =
      await apiFetch(
          `${API_BASE_URL}/approved-orders`
      );


  if (!response.ok) {

    throw new Error(
        `Failed to fetch approved orders: HTTP ${response.status}`
    );
  }


  const data:
      BackendApprovedOrder[] =
      await response.json();


  return data.map(
      toFrontendApprovedOrder
  );
}


/*
 * ============================================================
 * CREATE PRODUCTION TASK
 * ============================================================
 */
export async function
createProductionTask(task: {

  orderRef: string;

  customer: string;

  garmentType: string;

  quantity: number;

  stage: string;

  assignedTo: string;

  startDate: string;

  dueDate: string;

  progress?: number;

  priority: string;

}):
    Promise<
        ProductionTask & {
      numericId: number
    }
    > {

  const payload = {

    orderRef:
    task.orderRef,

    customer:
    task.customer,

    garmentType:
    task.garmentType,

    quantity:
    task.quantity,

    stage:
        task.stage.toUpperCase(),

    assignedTo:
    task.assignedTo,

    startDate:
    task.startDate,

    dueDate:
    task.dueDate,

    progress:
        task.progress ?? 0,

    priority:
        task.priority.toUpperCase(),
  };


  const response =
      await apiFetch(
          API_BASE_URL,
          {
            method:
                'POST',

            headers: {
              'Content-Type':
                  'application/json',
            },

            body:
                JSON.stringify(
                    payload
                ),
          }
      );


  if (!response.ok) {

    const errorData =
        await response
            .json()
            .catch(
                () => null
            );


    throw new Error(
        errorData?.error ||
        errorData?.message ||
        `Failed to create production task: HTTP ${response.status}`
    );
  }


  const data:
      BackendProductionTask =
      await response.json();


  return toFrontendProductionTask(
      data
  );
}


/*
 * ============================================================
 * UPDATE PRODUCTION PROGRESS
 * ============================================================
 */
export async function
updateProductionProgress(
    id: number,
    progress: number,
    stage: ProductionTask['stage']
):
    Promise<
        ProductionTask & {
      numericId: number
    }
    > {

  const response =
      await apiFetch(
          `${API_BASE_URL}/${id}/progress` +
          `?progress=${encodeURIComponent(progress)}` +
          `&stage=${encodeURIComponent(stage.toUpperCase())}`,
          {
            method:
                'PATCH',
          }
      );


  if (!response.ok) {

    const errorData =
        await response
            .json()
            .catch(
                () => null
            );


    throw new Error(
        errorData?.error ||
        errorData?.message ||
        `Failed to update production progress: HTTP ${response.status}`
    );
  }


  const data:
      BackendProductionTask =
      await response.json();


  return toFrontendProductionTask(
      data
  );
}


/*
 * ============================================================
 * UPDATE PRODUCTION TASK
 * ============================================================
 */
export async function
updateProductionTask(
    id: number,
    task: Partial<ProductionTask>
):
    Promise<
        ProductionTask & {
      numericId: number
    }
    > {

  const payload = {

    orderRef:
    task.orderRef,

    stage:
        task.stage?.toUpperCase(),

    assignedTo:
    task.assignedTo,

    startDate:
    task.startDate,

    dueDate:
    task.dueDate,

    progress:
    task.progress,

    priority:
        task.priority?.toUpperCase(),
  };


  const response =
      await apiFetch(
          `${API_BASE_URL}/${id}`,
          {
            method:
                'PUT',

            headers: {
              'Content-Type':
                  'application/json',
            },

            body:
                JSON.stringify(
                    payload
                ),
          }
      );


  if (!response.ok) {

    const errorData =
        await response
            .json()
            .catch(
                () => null
            );


    throw new Error(
        errorData?.error ||
        errorData?.message ||
        `Failed to update production task: HTTP ${response.status}`
    );
  }


  const data:
      BackendProductionTask =
      await response.json();


  return toFrontendProductionTask(
      data
  );
}


/*
 * ============================================================
 * DELETE PRODUCTION TASK
 * ============================================================
 */
export async function
deleteProductionTask(
    id: number
): Promise<void> {

  const response =
      await apiFetch(
          `${API_BASE_URL}/${id}`,
          {
            method:
                'DELETE',
          }
      );


  if (!response.ok) {

    const errorData =
        await response
            .json()
            .catch(
                () => null
            );


    throw new Error(
        errorData?.error ||
        errorData?.message ||
        `Failed to delete production task: HTTP ${response.status}`
    );
  }
}