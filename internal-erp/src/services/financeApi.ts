import { apiFetch } from './apiClient'


const INVOICE_API =
    'http://localhost:8080/api/invoices'

const PAYMENT_API =
    'http://localhost:8080/api/payments'


/* ============================================================
   INVOICE
   ============================================================ */

export type InvoiceStatus =
    | 'PAID'
    | 'PENDING'
    | 'OVERDUE'
    | 'PARTIAL'


export interface BackendInvoice {

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


export interface CreateInvoiceRequest {

    orderId: string

    date?: string

    dueDate?: string
}


/* ============================================================
   PAYMENT
   ============================================================ */

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


export interface BackendPayment {

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


export interface CustomerPaymentRequest {

    amountPaid: number

    paymentDate?: string

    paymentMethod: PaymentMethod

    referenceNo?: string
}


/* ============================================================
   FINANCE SUMMARY
   ============================================================ */

export interface FinanceSummary {

    totalRevenue: number

    paid: number

    pending: number

    overdue: number

    invoiceCount: number
}


/* ============================================================
   ERROR
   ============================================================ */

async function handleError(
    response: Response,
    action: string
): Promise<never> {

    const data =
        await response
            .json()
            .catch(
                () => null
            )

    throw new Error(
        data?.error ||
        data?.message ||
        `${action}: HTTP ${response.status}`
    )
}


/* ============================================================
   INVOICES
   ============================================================ */

export async function fetchAllInvoices():
    Promise<BackendInvoice[]> {

    const response =
        await apiFetch(
            INVOICE_API
        )

    if (!response.ok) {

        await handleError(
            response,
            'Failed to fetch invoices'
        )
    }

    return response.json()
}


export async function fetchInvoiceById(
    id: number
): Promise<BackendInvoice> {

    const response =
        await apiFetch(
            `${INVOICE_API}/${id}`
        )

    if (!response.ok) {

        await handleError(
            response,
            'Failed to fetch invoice'
        )
    }

    return response.json()
}


export async function fetchFinanceSummary():
    Promise<FinanceSummary> {

    const response =
        await apiFetch(
            `${INVOICE_API}/summary`
        )

    if (!response.ok) {

        await handleError(
            response,
            'Failed to fetch finance summary'
        )
    }

    return response.json()
}


/* ============================================================
   CREATE INVOICE
   ============================================================ */

export async function createInvoice(
    request: CreateInvoiceRequest
): Promise<BackendInvoice> {

    const response =
        await apiFetch(
            INVOICE_API,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',
                },

                body:
                    JSON.stringify(
                        request
                    ),
            }
        )

    if (!response.ok) {

        await handleError(
            response,
            'Failed to create invoice'
        )
    }

    return response.json()
}


/* ============================================================
   UPDATE INVOICE STATUS
   ============================================================ */

export async function updateInvoiceStatus(
    id: number,
    status: InvoiceStatus
): Promise<BackendInvoice> {

    const response =
        await apiFetch(
            `${INVOICE_API}/${id}/status`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type':
                        'application/json',
                },

                body:
                    JSON.stringify({
                        status,
                    }),
            }
        )

    if (!response.ok) {

        await handleError(
            response,
            'Failed to update invoice status'
        )
    }

    return response.json()
}


/* ============================================================
   DELETE INVOICE
   ============================================================ */

export async function deleteInvoice(
    id: number
): Promise<void> {

    const response =
        await apiFetch(
            `${INVOICE_API}/${id}`,
            {
                method: 'DELETE',
            }
        )

    if (!response.ok) {

        await handleError(
            response,
            'Failed to delete invoice'
        )
    }
}


/* ============================================================
   PAYMENTS
   ============================================================ */

export async function fetchAllPayments():
    Promise<BackendPayment[]> {

    const response =
        await apiFetch(
            PAYMENT_API
        )

    if (!response.ok) {

        await handleError(
            response,
            'Failed to fetch payments'
        )
    }

    return response.json()
}


export async function fetchInvoicePayments(
    invoiceId: number
): Promise<BackendPayment[]> {

    const response =
        await apiFetch(
            `${PAYMENT_API}/invoice/${invoiceId}`
        )

    if (!response.ok) {

        await handleError(
            response,
            'Failed to fetch invoice payments'
        )
    }

    return response.json()
}


/* ============================================================
   VERIFY PAYMENT
   ============================================================ */

export async function verifyPayment(
    paymentId: number
): Promise<BackendPayment> {

    const response =
        await apiFetch(
            `${PAYMENT_API}/${paymentId}/verify`,
            {
                method: 'POST',
            }
        )

    if (!response.ok) {

        await handleError(
            response,
            'Failed to verify payment'
        )
    }

    return response.json()
}


/* ============================================================
   REJECT PAYMENT
   ============================================================ */

export async function rejectPayment(
    paymentId: number,
    reason: string
): Promise<BackendPayment> {

    const response =
        await apiFetch(
            `${PAYMENT_API}/${paymentId}/reject`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',
                },

                body:
                    JSON.stringify({
                        reason,
                    }),
            }
        )

    if (!response.ok) {

        await handleError(
            response,
            'Failed to reject payment'
        )
    }

    return response.json()
}