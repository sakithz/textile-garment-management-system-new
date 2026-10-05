package com.textile.backend.entity;

public enum QuotationStatus {

    /*
     * Customer has submitted the quotation request.
     * Sales Executive has not reviewed it yet.
     */
    PENDING,

    /*
     * Sales Executive is currently reviewing
     * the customer's quotation request.
     */
    UNDER_REVIEW,

    /*
     * Sales Executive accepted the quotation.
     *
     * An order can now be created from this quotation.
     */
    APPROVED,

    /*
     * Sales Executive rejected the quotation.
     */
    REJECTED,

    /*
     * An internal order has already been created
     * from this quotation.
     */
    CONVERTED_TO_ORDER
}