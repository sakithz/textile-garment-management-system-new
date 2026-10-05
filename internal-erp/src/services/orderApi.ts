import { apiFetch } from './apiClient';

import type {
    Order,
    OrderStatus,
    Priority,
} from '../types';

const API_BASE_URL =
    'http://localhost:8080/api/orders';

export interface BackendCustomer {
    id: number;
    customerCode: string;
    name: string;
    contact: string;
    email: string;
    company: string;
    country?: string;
    totalOrders?: number;
    status?: string;
    lastOrder?: string;
    totalValue?: number;
}

export interface BackendOrder {
    id: number;

    orderNumber: string;

    customer:
        | BackendCustomer
        | string;

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

export interface FrontendOrder
    extends Order {
    numericId: number;
    customerId: number;
}

function getCustomerName(
    customer:
        | BackendCustomer
        | string
): string {
    if (
        typeof customer ===
        'string'
    ) {
        return customer;
    }

    return (
        customer.name ||
        customer.company ||
        customer.email ||
        `Customer #${customer.id}`
    );
}

function getCustomerId(
    customer:
        | BackendCustomer
        | string
): number {
    if (
        typeof customer ===
        'string'
    ) {
        return 0;
    }

    return customer.id;
}

export function toFrontendOrder(
    b: BackendOrder
): FrontendOrder {
    const priorityMap: Record<
        string,
        Priority
    > = {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
    };

    const statusMap: Record<
        string,
        OrderStatus
    > = {
        PENDING: 'pending',
        APPROVED: 'approved',
        IN_PRODUCTION:
            'in_production',
        QUALITY_CHECK:
            'quality_check',
        READY: 'ready',
        DELIVERED: 'delivered',
        CANCELLED: 'cancelled',
    };

    return {
        id: b.orderNumber,

        numericId: b.id,

        customerId:
            getCustomerId(
                b.customer
            ),

        customer:
            getCustomerName(
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
            priorityMap[
                b.priority
                ] || 'medium',

        status:
            statusMap[
                b.status
                ] || 'pending',

        progress:
            b.progress ?? 0,

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

export interface OrderPayload {
    customerId: number;

    quotationId?: number;

    garmentType: string;

    quantity: number;

    orderDate?: string;

    deliveryDate?: string;

    priority?: string;

    status?: string;

    progress?: number;

    unitPrice?: number;

    total?: number;

    fabric?: string;

    color?: string;

    size?: string;
}

function toBackendPayload(
    order: OrderPayload
) {
    return {
        customerId:
        order.customerId,

        quotationId:
        order.quotationId,

        garmentType:
        order.garmentType,

        quantity:
        order.quantity,

        orderDate:
        order.orderDate,

        deliveryDate:
        order.deliveryDate,

        priority:
            order.priority
                ? order.priority.toUpperCase()
                : undefined,

        status:
            order.status
                ? order.status.toUpperCase()
                : undefined,

        progress:
            order.progress ?? 0,

        unitPrice:
        order.unitPrice,

        total:
        order.total,

        fabric:
        order.fabric,

        color:
        order.color,

        size:
        order.size,
    };
}

async function handleError(
    response: Response,
    action: string
): Promise<never> {
    const error =
        await response
            .json()
            .catch(
                () => null
            );

    throw new Error(
        error?.error ||
        error?.message ||
        `${action}: HTTP ${response.status}`
    );
}

export async function fetchAllOrders():
    Promise<FrontendOrder[]> {
    const response =
        await apiFetch(
            API_BASE_URL
        );

    if (!response.ok) {
        await handleError(
            response,
            'Failed to fetch orders'
        );
    }

    const data =
        (await response.json()) as BackendOrder[];

    return data.map(
        toFrontendOrder
    );
}

export async function fetchOrderById(
    id: number
): Promise<FrontendOrder> {
    const response =
        await apiFetch(
            `${API_BASE_URL}/${id}`
        );

    if (!response.ok) {
        await handleError(
            response,
            'Order not found'
        );
    }

    return toFrontendOrder(
        await response.json()
    );
}

export async function fetchOrderByNumber(
    orderNumber: string
): Promise<FrontendOrder> {
    const response =
        await apiFetch(
            `${API_BASE_URL}/number/${encodeURIComponent(
                orderNumber
            )}`
        );

    if (!response.ok) {
        await handleError(
            response,
            `Order ${orderNumber} not found`
        );
    }

    return toFrontendOrder(
        await response.json()
    );
}

export async function fetchOrdersByCustomer(
    customerId: number
): Promise<FrontendOrder[]> {
    const response =
        await apiFetch(
            `${API_BASE_URL}/customer/${customerId}`
        );

    if (!response.ok) {
        await handleError(
            response,
            'Failed to fetch customer orders'
        );
    }

    const data =
        (await response.json()) as BackendOrder[];

    return data.map(
        toFrontendOrder
    );
}

export async function fetchOrdersByStatus(
    status: OrderStatus
): Promise<FrontendOrder[]> {
    const response =
        await apiFetch(
            `${API_BASE_URL}/status/${status.toUpperCase()}`
        );

    if (!response.ok) {
        await handleError(
            response,
            'Failed to fetch orders by status'
        );
    }

    const data =
        (await response.json()) as BackendOrder[];

    return data.map(
        toFrontendOrder
    );
}

export async function searchOrders(
    query: string
): Promise<FrontendOrder[]> {
    const response =
        await apiFetch(
            `${API_BASE_URL}/search?query=${encodeURIComponent(
                query
            )}`
        );

    if (!response.ok) {
        await handleError(
            response,
            'Failed to search orders'
        );
    }

    const data =
        (await response.json()) as BackendOrder[];

    return data.map(
        toFrontendOrder
    );
}

export async function createOrder(
    order: OrderPayload
): Promise<FrontendOrder> {
    if (
        !order.customerId ||
        order.customerId <= 0
    ) {
        throw new Error(
            'Please select a valid customer.'
        );
    }

    const response =
        await apiFetch(
            API_BASE_URL,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',
                },

                body:
                    JSON.stringify(
                        toBackendPayload(
                            order
                        )
                    ),
            }
        );

    if (!response.ok) {
        await handleError(
            response,
            'Failed to create order'
        );
    }

    return toFrontendOrder(
        await response.json()
    );
}

export async function createOrderFromQuotation(
    quotationId: number,
    priority?: Priority
): Promise<FrontendOrder> {
    const response =
        await apiFetch(
            `${API_BASE_URL}/from-quotation/${quotationId}`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',
                },

                body: JSON.stringify({
                    priority:
                        priority
                            ? priority.toUpperCase()
                            : undefined,
                }),
            }
        );

    if (!response.ok) {
        await handleError(
            response,
            'Failed to create order from quotation'
        );
    }

    return toFrontendOrder(
        await response.json()
    );
}

export async function updateOrder(
    id: number,
    order: OrderPayload
): Promise<FrontendOrder> {
    if (
        !order.customerId ||
        order.customerId <= 0
    ) {
        throw new Error(
            'A valid customer is required.'
        );
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

                body:
                    JSON.stringify(
                        toBackendPayload(
                            order
                        )
                    ),
            }
        );

    if (!response.ok) {
        await handleError(
            response,
            'Failed to update order'
        );
    }

    return toFrontendOrder(
        await response.json()
    );
}

export async function updateOrderStatus(
    id: number,
    status: OrderStatus
): Promise<FrontendOrder> {
    /*
     * The backend does not expose a separate PATCH
     * status endpoint. Therefore we first load the
     * existing order and then update it through the
     * normal PUT endpoint.
     */

    const existing =
        await fetchOrderById(id);

    const updated =
        await updateOrder(
            id,
            {
                customerId:
                existing.customerId,

                garmentType:
                existing.garmentType,

                quantity:
                existing.quantity,

                orderDate:
                existing.orderDate,

                deliveryDate:
                existing.deliveryDate,

                priority:
                existing.priority,

                status:
                status,

                progress:
                existing.progress,

                unitPrice:
                existing.unitPrice,

                total:
                existing.total,

                fabric:
                existing.fabric,

                color:
                existing.color,

                size:
                existing.size,
            }
        );

    return updated;
}

export async function deleteOrder(
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
            'Failed to delete order'
        );
    }
}