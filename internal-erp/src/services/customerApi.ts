import { apiFetch } from './apiClient';
import { type Customer } from '../data/mockData';

const API_BASE_URL =
    'http://localhost:8080/api/customers';

export interface BackendCustomer {
    id: number;

    customerCode: string;

    name: string;

    contact: string;

    email: string;

    company: string;

    country?: string;

    totalOrders?: number;

    status?: 'ACTIVE' | 'INACTIVE';

    lastOrder?: string;

    totalValue?: number;
}

/**
 * Convert backend Customer entity
 * into the frontend Customer format.
 */
export function toFrontendCustomer(
    b: BackendCustomer
): Customer & {
    numericId: number;
} {
    return {
        id:
            b.customerCode ||
            `C${b.id}`,

        numericId:
        b.id,

        name:
        b.name,

        contact:
        b.contact,

        email:
        b.email,

        company:
        b.company,

        totalOrders:
            b.totalOrders ?? 0,

        /*
         * Backend stores:
         * ACTIVE / INACTIVE
         *
         * Frontend uses:
         * active / inactive
         *
         * If the database value is missing,
         * treat the customer as active so that
         * an existing customer is not hidden
         * from the customer selection UI.
         */
        status:
            b.status === 'INACTIVE'
                ? 'inactive'
                : 'active',

        lastOrder:
            b.lastOrder || '',

        totalValue:
            b.totalValue ?? 0,
    };
}

/**
 * Get all customers from the real MySQL database.
 */
export async function fetchAllCustomers(): Promise<
    (Customer & {
        numericId: number;
    })[]
> {
    const response =
        await apiFetch(
            API_BASE_URL
        );

    if (!response.ok) {
        const error =
            await response
                .json()
                .catch(
                    () => null
                );

        throw new Error(
            error?.error ||
            error?.message ||
            `Failed to fetch customers: HTTP ${response.status}`
        );
    }

    const data =
        (await response.json()) as BackendCustomer[];

    return data.map(
        toFrontendCustomer
    );
}

/**
 * Create a new customer in the real MySQL database.
 */
export async function createCustomer(
    customer: {
        customerCode?: string;

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
): Promise<
    Customer & {
    numericId: number;
}
> {
    const payload = {
        customerCode:
        customer.customerCode,

        name:
        customer.name,

        contact:
        customer.contact,

        email:
        customer.email,

        company:
        customer.company,

        country:
        customer.country,

        totalOrders:
            customer.totalOrders ?? 0,

        status:
            customer.status
                ? customer.status.toUpperCase()
                : 'ACTIVE',

        lastOrder:
        customer.lastOrder,

        totalValue:
            customer.totalValue ?? 0,
    };

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
                        payload
                    ),
            }
        );

    if (!response.ok) {
        const error =
            await response
                .json()
                .catch(
                    () => null
                );

        throw new Error(
            error?.error ||
            error?.message ||
            `Failed to create customer: HTTP ${response.status}`
        );
    }

    const data =
        (await response.json()) as BackendCustomer;

    return toFrontendCustomer(
        data
    );
}

/**
 * Update an existing customer.
 */
export async function updateCustomer(
    numericId: number,
    customer: Partial<Customer>
): Promise<
    Customer & {
    numericId: number;
}
> {
    const payload = {
        name:
        customer.name,

        contact:
        customer.contact,

        email:
        customer.email,

        company:
        customer.company,

        totalOrders:
        customer.totalOrders,

        status:
            customer.status
                ? customer.status.toUpperCase()
                : undefined,

        lastOrder:
        customer.lastOrder,

        totalValue:
        customer.totalValue,
    };

    const response =
        await apiFetch(
            `${API_BASE_URL}/${numericId}`,
            {
                method: 'PUT',

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
        const error =
            await response
                .json()
                .catch(
                    () => null
                );

        throw new Error(
            error?.error ||
            error?.message ||
            `Failed to update customer: HTTP ${response.status}`
        );
    }

    const data =
        (await response.json()) as BackendCustomer;

    return toFrontendCustomer(
        data
    );
}

/**
 * Delete an existing customer.
 */
export async function deleteCustomer(
    numericId: number
): Promise<void> {
    const response =
        await apiFetch(
            `${API_BASE_URL}/${numericId}`,
            {
                method: 'DELETE',
            }
        );

    if (!response.ok) {
        const error =
            await response
                .json()
                .catch(
                    () => null
                );

        throw new Error(
            error?.error ||
            error?.message ||
            `Failed to delete customer: HTTP ${response.status}`
        );
    }
}