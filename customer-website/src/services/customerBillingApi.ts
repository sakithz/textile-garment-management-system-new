const API_BASE_URL =
    'http://localhost:8080/api'


// ============================================================
// INVOICE
// ============================================================

export type InvoiceStatus =
    | 'PAID'
    | 'PENDING'
    | 'OVERDUE'
    | 'PARTIAL'


export interface CustomerInvoice {

    id: number

    invoiceNumber: string

    orderId: string

    customer: string

    amount: number

    baseAmount: number | null

    discountPercent: number | null

    discountAmount: number | null

    campaignName: string | null

    amountPaid: number | null

    balanceDue: number

    date: string

    dueDate: string

    status: InvoiceStatus
}


// ============================================================
// PAYMENT
// ============================================================

export type PaymentMethod =
    | 'BANK_TRANSFER'
    | 'CARD'
    | 'CASH'
    | 'CHEQUE'
    | 'UPI'


export type PaymentStatus =
    | 'PENDING'
    | 'VERIFIED'
    | 'REJECTED'


export interface CustomerPayment {

    id: number

    invoiceId: number

    invoiceNumber: string | null

    orderId: string | null

    amountPaid: number

    paymentDate: string

    paymentMethod: PaymentMethod

    referenceNo: string | null

    status: PaymentStatus

    recordedByUserId: number | null

    rejectionReason: string | null
}


// ============================================================
// SUBMIT PAYMENT REQUEST
// ============================================================

export interface SubmitPaymentRequest {

    amountPaid: number

    paymentDate?: string

    paymentMethod: PaymentMethod

    referenceNo?: string
}


// ============================================================
// API ERROR
// ============================================================

interface ApiErrorResponse {

    error?: string

    message?: string
}


// ============================================================
// TOKEN
// ============================================================

function getCustomerToken():
    string | null {

    return localStorage.getItem(
        'silkroute_customer_token'
    )
}


// ============================================================
// API REQUEST
// ============================================================

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {

    const token =
        getCustomerToken()


    /*
     * IMPORTANT:
     *
     * Do not use:
     *
     * headers['Authorization']
     *
     * because HeadersInit does not support
     * direct string indexing safely.
     *
     * Headers.set() fixes TS7053.
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

        const data =
            await response
                .json()
                .catch(
                    () => null
                ) as ApiErrorResponse | null


        const error =
                new Error(
                    data?.error ||
                    data?.message ||
                    `Request failed with status ${response.status}`
                )


            /*
             * Attach HTTP status so callers can distinguish:
             *
             * 404 = invoice not generated yet
             * 401 = authentication problem
             * 403 = authorization problem
             * 500 = backend/server problem
             */

        ;(
            error as Error & {
                status?: number
            }
        ).status =
            response.status


        throw error
    }


    if (
        response.status === 204
    ) {

        return undefined as T
    }


    return response.json() as Promise<T>
}


// ============================================================
// CUSTOMER INVOICE
// ============================================================

export async function fetchCustomerInvoice(
    orderNumber: string
): Promise<CustomerInvoice | null> {

    try {

        return await request<CustomerInvoice>(
            `/invoices/customer/order/${encodeURIComponent(
                orderNumber
            )}`
        )

    } catch (error) {

        const status =
            (
                error as Error & {
                    status?: number
                }
            ).status


        /*
         * Invoice has not been created yet.
         *
         * This is NOT an error for the
         * customer portal.
         */

        if (status === 404) {

            return null
        }


        throw error
    }
}


// ============================================================
// CUSTOMER PAYMENTS
// ============================================================

export async function fetchCustomerInvoicePayments(
    invoiceId: number
): Promise<CustomerPayment[]> {

    return request<CustomerPayment[]>(
        `/payments/invoice/${invoiceId}`
    )
}


// ============================================================
// SUBMIT CUSTOMER PAYMENT
// ============================================================

export async function submitCustomerPayment(
    invoiceId: number,
    payment: SubmitPaymentRequest
): Promise<CustomerPayment> {

    return request<CustomerPayment>(
        `/payments/customer/${invoiceId}`,
        {
            method: 'POST',

            body:
                JSON.stringify(
                    payment
                ),
        }
    )
}