const API_BASE_URL =
    'http://localhost:8080/api'


// ============================================================
// CUSTOMER
// ============================================================

export interface Customer {

    id: number

    customerCode: string

    name: string

    contact: string

    email: string

    company: string

    country: string | null

    totalOrders: number

    status: string

    lastOrder: string | null

    totalValue: number
}


// ============================================================
// ORDER
// ============================================================

export type OrderStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'IN_PRODUCTION'
    | 'QUALITY_CHECK'
    | 'READY'
    | 'DELIVERED'
    | 'CANCELLED'


export type Priority =
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'


export interface CustomerOrder {

    id: number

    orderNumber: string

    customer?: Customer | null

    garmentType: string

    quantity: number

    orderDate: string

    deliveryDate: string

    priority: Priority

    status: OrderStatus

    progress: number

    unitPrice: number

    total: number

    fabric: string | null

    color: string | null

    size: string | null
}


// ============================================================
// QUOTATION
// ============================================================

export type QuotationStatus =
    | 'PENDING'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'CONVERTED_TO_ORDER'


export interface CustomerQuotation {

    id: number

    quotationNumber: string

    customer?: Customer | null

    campaignId: number | null

    campaignName: string | null

    discountPercent: number | null

    garmentType: string

    quantity: number

    fabric: string | null

    color: string | null

    size: string | null

    requestedDeliveryDate: string | null

    customerMessage: string | null

    baseUnitPrice: number | null

    unitPrice: number | null

    totalPrice: number | null

    confirmedDeliveryDate: string | null

    priority: Priority | null

    status: QuotationStatus

    createdAt: string

    reviewedAt: string | null

    rejectionReason: string | null
}


// ============================================================
// CUSTOMER REGISTER
// ============================================================

export interface CustomerRegisterRequest {

    name: string

    contact: string

    email: string

    company: string

    country?: string

    password: string
}


// ============================================================
// CUSTOMER LOGIN
// ============================================================

export interface CustomerLoginRequest {

    email: string

    password: string
}


// ============================================================
// CREATE QUOTATION
// ============================================================

export interface CreateQuotationRequest {

    customerId: number

    campaignId?: number

    garmentType: string

    quantity: number

    fabric?: string

    color?: string

    size?: string

    requestedDeliveryDate?: string

    customerMessage?: string
}


// ============================================================
// CUSTOMER PROFILE UPDATE
// ============================================================

export interface UpdateCustomerRequest {

    name: string

    contact: string

    email: string

    company: string

    country?: string

    password?: string
}


// ============================================================
// API ERROR
// ============================================================

interface ApiErrorResponse {

    error?: string

    message?: string
}


// ============================================================
// SESSION / TOKEN
// ============================================================

const CUSTOMER_SESSION_KEY =
    'silkroute_customer'

const CUSTOMER_TOKEN_KEY =
    'silkroute_customer_token'


// ============================================================
// TOKEN HELPERS
// ============================================================

export function saveCustomerToken(
    token: string
): void {

    localStorage.setItem(
        CUSTOMER_TOKEN_KEY,
        token
    )
}


export function getCustomerToken():
    string | null {

    return localStorage.getItem(
        CUSTOMER_TOKEN_KEY
    )
}


export function clearCustomerToken():
    void {

    localStorage.removeItem(
        CUSTOMER_TOKEN_KEY
    )
}


// ============================================================
// GENERIC API REQUEST
// ============================================================

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {

    const token =
        getCustomerToken()


    /*
     * Use the Headers class instead of indexing HeadersInit
     * directly.
     *
     * This fixes:
     * TS7053 - Element implicitly has an 'any' type...
     */
    const headers =
        new Headers(options.headers)


    if (!headers.has('Content-Type')) {

        headers.set(
            'Content-Type',
            'application/json'
        )
    }


    if (token) {

        headers.set(
            'Authorization',
            `Bearer ${token}`
        )
    }


    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers,
            }
        )


    if (!response.ok) {

        let errorMessage =
            `Request failed with status ${response.status}`


        try {

            const errorData =
                (
                    await response.json()
                ) as ApiErrorResponse


            if (errorData.error) {

                errorMessage =
                    errorData.error

            } else if (
                errorData.message
            ) {

                errorMessage =
                    errorData.message
            }

        } catch {

            // Response was not JSON.
        }


        throw new Error(
            errorMessage
        )
    }


    if (
        response.status === 204
    ) {

        return undefined as T
    }


    return response.json() as Promise<T>
}


// ============================================================
// CUSTOMER REGISTRATION
// ============================================================

interface CustomerAuthResponse
    extends Customer {

    token?: string

    message?: string
}


export async function registerCustomer(
    request: CustomerRegisterRequest
): Promise<Customer> {

    const payload = {

        name:
            request.name.trim(),

        contact:
            request.contact.trim(),

        email:
            request.email
                .trim()
                .toLowerCase(),

        company:
            request.company.trim(),

        country:
            request.country?.trim() ||
            null,

        password:
        request.password,
    }


    const response =
        await apiRequest<CustomerAuthResponse>(
            '/customer-auth/register',
            {
                method: 'POST',

                body:
                    JSON.stringify(
                        payload
                    ),
            }
        )


    if (response.token) {

        saveCustomerToken(
            response.token
        )
    }


    return response
}


// ============================================================
// CUSTOMER LOGIN
// ============================================================

export async function loginCustomer(
    request: CustomerLoginRequest
): Promise<Customer> {

    const payload = {

        email:
            request.email
                .trim()
                .toLowerCase(),

        password:
        request.password,
    }


    const response =
        await apiRequest<CustomerAuthResponse>(
            '/customer-auth/login',
            {
                method: 'POST',

                body:
                    JSON.stringify(
                        payload
                    ),
            }
        )


    if (!response.token) {

        throw new Error(
            'Login succeeded but no customer authentication token was returned.'
        )
    }


    saveCustomerToken(
        response.token
    )


    return response
}


// ============================================================
// CUSTOMER PROFILE
// ============================================================

export async function fetchCustomerProfile(
    customerId: number
): Promise<Customer> {

    return apiRequest<Customer>(
        `/customer-auth/profile/${customerId}`
    )
}


// ============================================================
// ALL CUSTOMERS
// ============================================================

export async function fetchAllCustomers():
    Promise<Customer[]> {

    return apiRequest<Customer[]>(
        '/customers'
    )
}


// ============================================================
// CUSTOMER BY ID
// ============================================================

export async function fetchCustomerById(
    customerId: number
): Promise<Customer> {

    return apiRequest<Customer>(
        `/customers/${customerId}`
    )
}


// ============================================================
// UPDATE CUSTOMER
// ============================================================

export async function updateCustomer(
    customerId: number,
    request: UpdateCustomerRequest
): Promise<Customer> {

    const payload = {

        name:
            request.name.trim(),

        contact:
            request.contact.trim(),

        email:
            request.email
                .trim()
                .toLowerCase(),

        company:
            request.company.trim(),

        country:
            request.country?.trim() ||
            null,

        password:
            request.password?.trim() ||
            null,
    }


    return apiRequest<Customer>(
        `/customers/${customerId}`,
        {
            method: 'PUT',

            body:
                JSON.stringify(
                    payload
                ),
        }
    )
}


// ============================================================
// CUSTOMER ORDERS
// ============================================================

export async function fetchCustomerOrders(
    customerId: number
): Promise<CustomerOrder[]> {

    return apiRequest<CustomerOrder[]>(
        `/orders/customer/${customerId}`
    )
}


// ============================================================
// ORDER BY NUMBER
// ============================================================

export async function fetchOrderByNumber(
    orderNumber: string
): Promise<CustomerOrder> {

    return apiRequest<CustomerOrder>(
        `/orders/number/${encodeURIComponent(orderNumber)}`
    )
}


// ============================================================
// CUSTOMER QUOTATIONS
// ============================================================

export async function fetchCustomerQuotations(
    customerId: number
): Promise<CustomerQuotation[]> {

    return apiRequest<CustomerQuotation[]>(
        `/quotations/customer/${customerId}`
    )
}


// ============================================================
// CREATE QUOTATION
// ============================================================

export async function createQuotation(
    request: CreateQuotationRequest
): Promise<CustomerQuotation> {

    const payload = {

        customerId:
        request.customerId,

        campaignId:
            request.campaignId ??
            null,

        garmentType:
            request.garmentType.trim(),

        quantity:
        request.quantity,

        fabric:
            request.fabric?.trim() ||
            null,

        color:
            request.color?.trim() ||
            null,

        size:
            request.size?.trim() ||
            null,

        requestedDeliveryDate:
            request.requestedDeliveryDate ||
            null,

        customerMessage:
            request.customerMessage?.trim() ||
            null,
    }


    return apiRequest<CustomerQuotation>(
        '/quotations',
        {
            method: 'POST',

            body:
                JSON.stringify(
                    payload
                ),
        }
    )
}


// ============================================================
// CUSTOMER SESSION
// ============================================================

export function saveCustomerSession(
    customer: Customer
): void {

    localStorage.setItem(
        CUSTOMER_SESSION_KEY,
        JSON.stringify(customer)
    )
}


export function getCustomerSession():
    Customer | null {

    const stored =
        localStorage.getItem(
            CUSTOMER_SESSION_KEY
        )


    if (!stored) {

        return null
    }


    try {

        return JSON.parse(
            stored
        ) as Customer

    } catch {

        localStorage.removeItem(
            CUSTOMER_SESSION_KEY
        )

        return null
    }
}


export function clearCustomerSession():
    void {

    localStorage.removeItem(
        CUSTOMER_SESSION_KEY
    )

    clearCustomerToken()
}


export function getLoggedInCustomerId():
    number | null {

    const customer =
        getCustomerSession()


    if (!customer) {

        return null
    }


    return customer.id
}


export async function refreshCustomerSession():
    Promise<Customer | null> {

    const currentCustomer =
        getCustomerSession()


    if (!currentCustomer) {

        return null
    }


    try {

        const latestCustomer =
            await fetchCustomerProfile(
                currentCustomer.id
            )


        saveCustomerSession(
            latestCustomer
        )


        return latestCustomer

    } catch {

        return currentCustomer
    }
}