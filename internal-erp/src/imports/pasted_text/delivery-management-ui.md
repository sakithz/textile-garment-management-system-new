Update the existing INTERNAL TEXTILE & GARMENT MANAGEMENT ERP UI.

IMPORTANT:
Do NOT redesign the existing UI.
Do NOT change the existing color palette, typography, spacing system, sidebar style, navbar, cards, buttons, tables, icons, dashboard style, or overall visual language.

Keep the EXACT SAME DESIGN SYSTEM and visual theme that has already been created.

We need to ADD a new major module:

DELIVERY MANAGEMENT

Also update only the existing screens that need to be connected with Delivery Management.

==================================================
1. ADD DELIVERY MANAGEMENT TO SIDEBAR
==================================================

Add a new navigation item:

Delivery Management

Place it logically after Production and before Finance, because the workflow is:

Customer Order
→ Production
→ Delivery
→ Finance / Completed Order

Use the exact same sidebar icon style and component style as the existing navigation.

==================================================
2. DELIVERY DASHBOARD
==================================================

Create a Delivery Management Dashboard using the EXISTING dashboard design system.

Dashboard cards:

- Total Deliveries
- Scheduled
- Out for Delivery
- Delivered
- Delayed

Add:

Today's Deliveries
Upcoming Deliveries
Delayed Deliveries
Recent Delivery Activity

Charts:

- Delivery Status Distribution
- Deliveries by Date
- On-Time vs Delayed Deliveries

Use the same chart style already used throughout the ERP.

==================================================
3. DELIVERY LIST
==================================================

Create:

Delivery Management → Delivery List

Use the existing table design.

Columns:

- Delivery ID
- Order ID
- Customer
- Delivery Date
- Delivery Officer
- Delivery Method
- Priority
- Status
- Actions

Actions:

View
Edit
Cancel

Add:

- Search
- Status filter
- Date filter
- Customer filter
- Delivery Officer filter
- Priority filter
- Sorting
- Pagination

==================================================
4. CREATE / SCHEDULE DELIVERY
==================================================

Create a "Schedule Delivery" form using the existing form components.

Fields:

Delivery ID
Order ID
Customer
Delivery Address
Delivery Date
Delivery Officer
Delivery Method
Priority
Special Instructions

When selecting an Order:

Automatically display:

- Customer
- Order details
- Quantity
- Production status
- Delivery address

Only orders that are ready for delivery should normally be selectable.

Buttons:

Schedule Delivery
Cancel

==================================================
5. DELIVERY DETAILS
==================================================

Create a Delivery Details page matching the existing Order Details page style.

Show:

Delivery ID
Order ID
Customer
Delivery Address
Delivery Officer
Delivery Date
Delivery Method
Priority
Current Status

Also show:

Order Summary
Garment Type
Quantity
Production Completion
Special Instructions

==================================================
6. DELIVERY TRACKING TIMELINE
==================================================

Create a visual delivery timeline using the SAME timeline style as the existing Order Management timeline.

Stages:

✓ Order Ready for Delivery
✓ Delivery Scheduled
✓ Delivery Officer Assigned
✓ Out for Delivery
● Delivered

Possible statuses:

Scheduled
Out for Delivery
Delivered
Delayed
Cancelled
Delivery Failed

Show timestamps for completed stages.

==================================================
7. UPDATE DELIVERY
==================================================

Create an Edit Delivery screen.

Allow authorized users to update:

- Delivery Date
- Delivery Officer
- Delivery Method
- Priority
- Delivery Address
- Special Instructions
- Delivery Status

Do not allow unauthorized users to edit restricted information.

==================================================
8. DELIVERY COMPLETION / PROOF OF DELIVERY
==================================================

When a Delivery Officer marks a delivery as Delivered, show a completion modal/form.

Fields:

Delivered Date & Time
Received By
Delivery Notes
Customer Confirmation
Optional Signature / Proof of Delivery

After confirmation:

Delivery Status → Delivered

==================================================
9. ORDER MANAGEMENT INTEGRATION
==================================================

IMPORTANT:
Update the EXISTING Order Management UI to visually connect with Delivery Management.

Do NOT redesign Order Management.

Modify only where necessary.

In the Order Details page, add:

Delivery Information

Delivery Status
Delivery Date
Delivery Officer

Add button:

"View Delivery"

Order status flow should visually support:

Pending
→ Approved
→ In Production
→ Quality Check
→ Ready for Delivery
→ Delivered

When an order becomes:

Ready for Delivery

show:

"Schedule Delivery"

When delivery is completed:

Delivery Status = Delivered

and the Order Status should display:

Delivered

Make the relationship visually clear.

==================================================
10. PRODUCTION MANAGEMENT INTEGRATION
==================================================

Update the EXISTING Production Management UI only where necessary.

When production is completed:

Production Status:
Completed

show a clear next action:

"Ready for Delivery"

The completed production order should become available in Delivery Management.

Add a small delivery-related status section to the Production Order Details page:

Delivery Status:
Not Scheduled / Scheduled / Out for Delivery / Delivered

Do NOT duplicate the Delivery Management module here.

==================================================
11. CUSTOMER INFORMATION INTEGRATION
==================================================

Update the existing Customer Details / Customer Order History UI.

For each customer's orders, show:

Order ID
Order Status
Delivery Status
Expected Delivery Date

Add:

"Track Delivery"

button where applicable.

The customer information should come from the existing Customer Management data.

Do NOT create duplicate customer information structures.

==================================================
12. OPERATIONS MANAGER DASHBOARD INTEGRATION
==================================================

Update the existing Operations Manager Dashboard.

Do NOT redesign the dashboard.

Add a Delivery Overview section:

Scheduled Deliveries
Out for Delivery
Delayed Deliveries
Delivered Today

Add a small:

"Delivery Alerts"

section.

Examples:

⚠ Delivery delayed
⚠ Delivery scheduled for today
✓ Delivery completed

Add:

"View Deliveries"

button.

==================================================
13. ORDER DASHBOARD INTEGRATION
==================================================

Update the existing Order Dashboard minimally.

Add:

Ready for Delivery
Delivered
Delayed Delivery

to the relevant order statistics.

In the recent orders table, include:

Delivery Status

Add quick action:

Track Delivery

==================================================
14. DELIVERY STATUS CONSISTENCY
==================================================

Use the same status badge design already used in the ERP.

Delivery statuses:

Scheduled
Out for Delivery
Delivered
Delayed
Cancelled
Delivery Failed

Use the existing badge/color conventions rather than creating a new visual style.

==================================================
15. ROLE-BASED ACCESS
==================================================

Follow the existing RBAC design.

Delivery Officer:

- View deliveries
- Schedule deliveries
- Update delivery details
- Update delivery status
- Mark delivery as completed
- View delivery history

Operations Manager:

- View all deliveries
- Monitor delivery progress
- View delayed deliveries
- Reassign delivery officers where authorized
- View delivery reports

Customer:

Do NOT give the customer access to the internal Delivery Management module.

Customers should only see delivery information through the Customer Portal.

==================================================
16. CUSTOMER PORTAL CONNECTION
==================================================

Where the existing Customer Portal / customer-facing area already contains order tracking, add delivery information there.

Show:

Order Status
Delivery Status
Expected Delivery Date
Delivery Address
Delivery Timeline

Example:

Order:
ORD-1024

Delivery:
DEL-0056

Status:
Out for Delivery

Expected:
20 August 2026

Use the same customer-facing design language already established.

==================================================
17. FINANCE CONNECTION
==================================================

Do NOT redesign Finance.

Only add relevant delivery information to Order / Invoice details where useful.

For completed deliveries:

Order Status:
Delivered

Finance can see:

Delivery Completed
Delivery Date

Do not duplicate delivery functionality inside Finance.

==================================================
18. GLOBAL WORKFLOW
==================================================

Make sure the UI communicates this complete business workflow:

Customer Order
        ↓
Order Management
        ↓
Order Approved
        ↓
Production Management
        ↓
Production Completed
        ↓
Ready for Delivery
        ↓
Delivery Management
        ↓
Delivery Scheduled
        ↓
Out for Delivery
        ↓
Delivered

The UI should make this relationship clear without duplicating modules.

==================================================
19. FINAL REQUIREMENT
==================================================

Keep the existing ERP UI EXACTLY CONSISTENT.

Only:

1. Add Delivery Management
2. Add Delivery Dashboard
3. Add Delivery List
4. Add Schedule Delivery
5. Add Delivery Details
6. Add Edit Delivery
7. Add Delivery Timeline
8. Add Proof of Delivery
9. Update Order Management where Delivery information is required
10. Update Production Management where Delivery handoff is required
11. Update Customer views where Delivery tracking is required
12. Update Operations Dashboard with Delivery overview
13. Update Finance/Order information only where delivery completion needs to be shown

Do NOT redesign unrelated pages.

The final result should look as if Delivery Management was part of the original ERP design from the beginning.