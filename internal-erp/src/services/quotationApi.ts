import { apiFetch } from './apiClient';

const API_BASE_URL =
    'http://localhost:8080/api/quotations';


export type QuotationStatus =
    | 'PENDING'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'CONVERTED_TO_ORDER';


export type Priority =
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH';


export interface QuotationCustomer {

    id: number;

    customerCode: string;

    name: string;

    contact: string;

    email: string;

    company: string;

    country?: string | null;
}


export interface Quotation {

    id: number;

    quotationNumber: string;

    customer: QuotationCustomer;

    garmentType: string;

    quantity: number;

    fabric?: string | null;

    color?: string | null;

    size?: string | null;

    requestedDeliveryDate?: string | null;

    customerMessage?: string | null;

    unitPrice?: number | null;

    totalPrice?: number | null;

    confirmedDeliveryDate?: string | null;

    priority?: Priority | null;

    status: QuotationStatus;

    createdAt: string;

    reviewedAt?: string | null;

    rejectionReason?: string | null;
}


async function handleError(
    response: Response,
    message: string
): Promise<never> {

    const data =
        await response
            .json()
            .catch(() => null);


    throw new Error(
        data?.error ||
        data?.message ||
        `${message}: HTTP ${response.status}`
    );
}


/*
 * ------------------------------------------------------------
 * GET ALL QUOTATIONS
 * ------------------------------------------------------------
 */
export async function fetchAllQuotations():
    Promise<Quotation[]> {

    const response =
        await apiFetch(
            API_BASE_URL
        );


    if (!response.ok) {

        await handleError(
            response,
            'Failed to fetch quotations'
        );
    }


    return response.json();
}


/*
 * ------------------------------------------------------------
 * GET QUOTATION BY ID
 * ------------------------------------------------------------
 */
export async function fetchQuotationById(
    quotationId: number
): Promise<Quotation> {

    const response =
        await apiFetch(
            `${API_BASE_URL}/${quotationId}`
        );


    if (!response.ok) {

        await handleError(
            response,
            'Failed to fetch quotation'
        );
    }


    return response.json();
}


/*
 * ------------------------------------------------------------
 * GET QUOTATION BY NUMBER
 * ------------------------------------------------------------
 */
export async function fetchQuotationByNumber(
    quotationNumber: string
): Promise<Quotation> {

    const response =
        await apiFetch(
            `${API_BASE_URL}/number/${encodeURIComponent(
                quotationNumber
            )}`
        );


    if (!response.ok) {

        await handleError(
            response,
            'Failed to fetch quotation'
        );
    }


    return response.json();
}


/*
 * ------------------------------------------------------------
 * GET CUSTOMER QUOTATIONS
 * ------------------------------------------------------------
 */
export async function fetchQuotationsByCustomer(
    customerId: number
): Promise<Quotation[]> {

    const response =
        await apiFetch(
            `${API_BASE_URL}/customer/${customerId}`
        );


    if (!response.ok) {

        await handleError(
            response,
            'Failed to fetch customer quotations'
        );
    }


    return response.json();
}


/*
 * ------------------------------------------------------------
 * GET QUOTATIONS BY STATUS
 * ------------------------------------------------------------
 */
export async function fetchQuotationsByStatus(
    status: QuotationStatus
): Promise<Quotation[]> {

    const response =
        await apiFetch(
            `${API_BASE_URL}/status/${status}`
        );


    if (!response.ok) {

        await handleError(
            response,
            'Failed to fetch quotations by status'
        );
    }


    return response.json();
}


/*
 * ------------------------------------------------------------
 * SEARCH QUOTATIONS
 * ------------------------------------------------------------
 */
export async function searchQuotations(
    query: string
): Promise<Quotation[]> {

    const response =
        await apiFetch(
            `${API_BASE_URL}/search?query=${encodeURIComponent(
                query
            )}`
        );


    if (!response.ok) {

        await handleError(
            response,
            'Failed to search quotations'
        );
    }


    return response.json();
}


/*
 * ------------------------------------------------------------
 * START REVIEW
 *
 * Backend:
 *
 * POST /api/quotations/{id}/review
 * ------------------------------------------------------------
 */
export async function startQuotationReview(
    quotationId: number
): Promise<Quotation> {

    const response =
        await apiFetch(
            `${API_BASE_URL}/${quotationId}/review`,
            {
                method: 'POST',
            }
        );


    if (!response.ok) {

        await handleError(
            response,
            'Failed to start quotation review'
        );
    }


    return response.json();
}


/*
 * ------------------------------------------------------------
 * APPROVE QUOTATION
 *
 * Backend:
 *
 * POST /api/quotations/{id}/approve
 * ------------------------------------------------------------
 */
export interface ApproveQuotationRequest {

    unitPrice: number;

    confirmedDeliveryDate: string;

    priority: Priority;
}


export async function approveQuotation(
    quotationId: number,
    data: ApproveQuotationRequest
): Promise<Quotation> {

    const response =
        await apiFetch(
            `${API_BASE_URL}/${quotationId}/approve`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',
                },

                body:
                    JSON.stringify({
                        unitPrice:
                        data.unitPrice,

                        confirmedDeliveryDate:
                        data.confirmedDeliveryDate,

                        priority:
                        data.priority,
                    }),
            }
        );


    if (!response.ok) {

        await handleError(
            response,
            'Failed to approve quotation'
        );
    }


    return response.json();
}


/*
 * ------------------------------------------------------------
 * REJECT QUOTATION
 *
 * Backend:
 *
 * POST /api/quotations/{id}/reject
 * ------------------------------------------------------------
 */
export interface RejectQuotationRequest {

    reason: string;
}


export async function rejectQuotation(
    quotationId: number,
    data: RejectQuotationRequest
): Promise<Quotation> {

    const response =
        await apiFetch(
            `${API_BASE_URL}/${quotationId}/reject`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',
                },

                body:
                    JSON.stringify({
                        reason:
                        data.reason,
                    }),
            }
        );


    if (!response.ok) {

        await handleError(
            response,
            'Failed to reject quotation'
        );
    }


    return response.json();
}


/*
 * ------------------------------------------------------------
 * CONVERT APPROVED QUOTATION TO ORDER
 *
 * Backend:
 *
 * POST /api/orders/from-quotation/{quotationId}
 * ------------------------------------------------------------
 */
export async function convertQuotationToOrder(
    quotationId: number
) {

    const response =
        await apiFetch(
            `http://localhost:8080/api/orders/from-quotation/${quotationId}`,
            {
                method: 'POST',
            }
        );


    if (!response.ok) {

        await handleError(
            response,
            'Failed to convert quotation to order'
        );
    }


    return response.json();
}