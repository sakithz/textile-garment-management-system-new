// ============================================================
// SHARED FRONTEND TYPES
// ============================================================

export type Role =
    | 'admin'
    | 'sales'
    | 'operations'
    | 'inventory'
    | 'production'
    | 'finance'
    | 'marketing'
    | 'delivery'


// ============================================================
// USER
// ============================================================

export interface User {

    id: string

    name: string

    role: Role

    email: string

    avatar: string

    department: string
}


// ============================================================
// ORDER
// ============================================================

export type OrderStatus =
    | 'pending'
    | 'approved'
    | 'in_production'
    | 'quality_check'
    | 'ready'
    | 'delivered'
    | 'cancelled'


export type Priority =
    | 'low'
    | 'medium'
    | 'high'
    | 'urgent'


export interface Order {

    id: string

    customer: string

    garmentType: string

    quantity: number

    orderDate: string

    deliveryDate: string

    priority: Priority

    status: OrderStatus

    progress: number

    unitPrice: number

    total: number

    fabric: string

    color: string

    size: string
}


// ============================================================
// CUSTOMER
// ============================================================

export interface Customer {

    id: string

    name: string

    contact: string

    email: string

    company: string

    totalOrders: number

    status:
        | 'active'
        | 'inactive'

    lastOrder: string

    totalValue: number
}


// ============================================================
// MATERIAL / INVENTORY
// ============================================================

export interface Material {

    id: string

    name: string

    category: string

    currentStock: number

    unit: string

    minStock: number

    supplier: string

    lastUpdated: string

    status:
        | 'in_stock'
        | 'low_stock'
        | 'out_of_stock'

    unitCost: number
}


// ============================================================
// PRODUCTION
// ============================================================

export interface ProductionTask {

    id: string

    orderId: string

    orderRef: string

    customer: string

    garmentType: string

    quantity: number

    stage:
        | 'cutting'
        | 'stitching'
        | 'finishing'
        | 'quality_check'

    assignedTo: string

    startDate: string

    dueDate: string

    progress: number

    priority: Priority
}


// ============================================================
// FINANCE / INVOICE
// ============================================================

export interface Invoice {

    id: string

    numericId?: number

    orderId: string

    customer: string

    amount: number

    baseAmount: number

    discountPercent: number

    discountAmount: number

    campaignName?: string | null

    amountPaid: number

    balanceDue: number

    date: string

    dueDate: string

    status:
        | 'paid'
        | 'pending'
        | 'overdue'
        | 'partial'
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


export interface Payment {

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
// MARKETING / CAMPAIGN
// ============================================================

export interface Campaign {

    id: string

    name: string

    type:
        | 'discount'
        | 'seasonal'
        | 'clearance'
        | 'new_launch'

    discount: number

    startDate: string

    endDate: string

    status:
        | 'active'
        | 'scheduled'
        | 'expired'

    ordersUsed: number

    revenue: number

    tag?: string

    desc?: string
}


// ============================================================
// EMPLOYEE
// ============================================================

export interface Employee {

    id: string

    name: string

    role: string

    department: string

    email: string

    phone: string

    status:
        | 'active'
        | 'on_leave'
        | 'inactive'

    joinDate: string

    salary: number
}


// ============================================================
// DELIVERY
// ============================================================

export type DeliveryStatus =
    | 'scheduled'
    | 'out_for_delivery'
    | 'delivered'
    | 'delayed'
    | 'cancelled'
    | 'failed'


export type DeliveryMethod =
    | 'road'
    | 'rail'
    | 'air'
    | 'courier'
    | 'own_vehicle'


export interface Delivery {

    id: string

    orderId: string

    customer: string

    deliveryAddress: string

    scheduledDate: string

    deliveredDate?: string

    officer: string

    method: DeliveryMethod

    priority: Priority

    status: DeliveryStatus

    specialInstructions?: string

    garmentType: string

    quantity: number

    receivedBy?: string

    deliveryNotes?: string
}


// ============================================================
// DATE FORMATTER
// ============================================================

export function formatDate(
    dateStr?: string | null
): string {

    if (!dateStr) {

        return '-'
    }

    const date =
        new Date(dateStr)

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateStr
    }

    return date.toLocaleDateString(
        'en-IN',
        {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }
    )
}