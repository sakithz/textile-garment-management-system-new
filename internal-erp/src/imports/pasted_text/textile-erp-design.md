Design a complete, modern, advanced, creative and highly user-friendly UI/UX design for a Web-Based Textile & Garment Management System.

IMPORTANT:
This design is ONLY for the INTERNAL COMPANY MANAGEMENT SYSTEM.
Do NOT design the customer-facing public website in this prompt.
The customer-facing website/portal will be designed separately with a different visual identity.

The system is a centralized ERP-style web application for a textile and garment manufacturing company.

The application must use Role-Based Access Control (RBAC). Different users must see different dashboards, navigation items, data and actions according to their roles and permissions.

The UI should feel like a modern professional SaaS/ERP product rather than a basic university CRUD application.

==================================================
1. DESIGN GOAL
==================================================

Create a premium enterprise dashboard experience that is:

- Modern
- Professional
- Creative
- Minimal but visually rich
- Highly intuitive
- Easy to learn
- Responsive
- Consistent
- Accessible
- Scalable
- Suitable for a real textile and garment manufacturing company

Avoid making it look like a generic admin template.

Use strong visual hierarchy, clean spacing, meaningful data visualization, modern cards, tables, status indicators, charts, timelines and interactive components.

The design should be realistic enough to implement later using React + Tailwind CSS.

==================================================
2. VISUAL STYLE
==================================================

Create a sophisticated industrial/fashion-tech visual identity.

Use a clean neutral base with one strong brand accent color.

Suggested visual direction:

- Off-white / light neutral backgrounds
- Dark charcoal text
- Deep navy / dark slate for navigation
- One sophisticated textile-inspired accent color
- Subtle gradients where appropriate
- Soft shadows
- Rounded cards
- Thin borders
- Clean typography
- Modern iconography

Do NOT overuse gradients, glassmorphism or excessive animations.

The interface should feel premium and professional.

Use a consistent 8px spacing system.

Use modern typography such as Inter, Manrope or another clean professional sans-serif.

==================================================
3. APPLICATION STRUCTURE
==================================================

Create the following main areas:

A. Authentication
B. Role-based Dashboards
C. Customer Management
D. Order Management
E. Inventory Management
F. Production Management
G. Finance & Billing Management
H. Marketing Management
I. Employee Management
J. User/Profile Management
K. Reports & Analytics
L. Notifications
M. Settings

Employee Management, Customer Management and the Admin Dashboard are shared/system-wide features and should not visually belong to only one individual module.

==================================================
4. GLOBAL LAYOUT
==================================================

Create a reusable application shell.

Desktop layout:

LEFT:
Collapsible sidebar navigation.

TOP:
Top navigation bar containing:

- Global search
- Notifications
- Help
- Current date/time if appropriate
- User avatar
- User name
- User role
- Profile menu

MAIN:
Scrollable content area.

The sidebar must change according to the logged-in user's role.

Include:

- Logo
- Dashboard
- Orders
- Customers
- Inventory
- Production
- Finance
- Marketing
- Employees
- Reports
- Notifications
- Settings

Only show modules that the current role is authorized to access.

==================================================
5. AUTHENTICATION
==================================================

Design:

- Login page
- Forgot password
- Reset password
- Change password
- Profile page
- Session timeout state
- Unauthorized / 403 page
- Not found / 404 page

Login screen should be professional and branded.

Do not make it look like a basic form.

Use a split-screen or elegant centered layout with textile/manufacturing-inspired imagery or abstract textile patterns.

==================================================
6. ADMIN DASHBOARD
==================================================

Create a comprehensive Admin Dashboard.

The Admin should get a high-level overview of the entire company.

Dashboard cards:

- Total Orders
- Pending Orders
- Orders in Production
- Completed Orders
- Total Revenue
- Pending Payments
- Low Stock Items
- Active Promotions

Charts:

- Orders over time
- Revenue trend
- Production progress
- Order status distribution
- Top garment categories
- Inventory alerts

Additional sections:

- Recent Orders
- Recent Activities
- Low Stock Alerts
- Pending Approvals
- Recent Payments
- Active Marketing Campaigns

Use meaningful charts rather than decorative charts.

==================================================
7. SALES EXECUTIVE DASHBOARD
==================================================

Create a dedicated dashboard for Sales Executives.

Show:

- Today's Orders
- Pending Orders
- Approved Orders
- Orders Requiring Attention
- Recent Customers
- Upcoming Deliveries

Main actions:

- Create Order
- Search Order
- View Customer
- Update Pending Order

Charts:

- Orders by status
- Orders by garment type
- Weekly order volume

==================================================
8. OPERATIONS MANAGER DASHBOARD
==================================================

Create a management-focused dashboard.

Show:

- Total Orders
- Pending Approvals
- Urgent Orders
- Delayed Orders
- Orders in Production
- Ready for Delivery

Include:

- Order approval queue
- Production overview
- Delayed orders
- High-priority orders
- Performance indicators

Provide approve/reject actions.

==================================================
9. INVENTORY DASHBOARD
==================================================

Create an Inventory Officer dashboard.

Show:

- Total Materials
- Low Stock
- Out of Stock
- Pending Material Requests
- Supplier Count

Include:

- Inventory level chart
- Low stock table
- Recent stock movements
- Material consumption trends
- Supplier overview

Use clear warning and status indicators.

==================================================
10. PRODUCTION DASHBOARD
==================================================

Create a Production Supervisor dashboard.

Show:

- Orders in Production
- Today's Production
- Pending Production Tasks
- Completed Production
- Delayed Production

Include:

- Production progress chart
- Production queue
- Worker/task assignments
- Production timeline
- Quality check status

Use progress bars and visual production stages.

==================================================
11. FINANCE & BILLING DASHBOARD
==================================================

Create a Finance Officer dashboard.

Show:

- Total Revenue
- Paid Invoices
- Pending Payments
- Outstanding Amount
- Monthly Revenue

Include:

- Revenue trend
- Payment status chart
- Recent invoices
- Outstanding payments
- Billing activity

==================================================
12. MARKETING DASHBOARD
==================================================

Create a Marketing Management dashboard.

Show:

- Active Offers
- Scheduled Campaigns
- Expiring Offers
- Discount Campaigns
- Orders Using Promotions

Include:

- Campaign performance
- Offer usage
- Promotion status
- Recent campaigns

==================================================
13. CUSTOMER MANAGEMENT
==================================================

Create professional CRUD screens.

Screens:

- Customer List
- Add Customer
- Edit Customer
- View Customer
- Customer Profile
- Customer Order History

Customer table should contain:

- Customer ID
- Name
- Contact
- Email
- Company
- Total Orders
- Status
- Last Order
- Actions

Actions:

- View
- Edit
- Delete/Deactivate

Include:

- Search
- Filters
- Sorting
- Pagination
- Bulk actions where appropriate

==================================================
14. ORDER MANAGEMENT
==================================================

This is one of the core modules.

Create a highly polished Order Management experience.

Screens:

1. Order Dashboard
2. Order List
3. Create Order
4. Edit Order
5. Order Details
6. Order Timeline
7. Order History

Order Dashboard cards:

- Total Orders
- Pending
- Approved
- In Production
- Quality Check
- Ready for Delivery
- Delivered
- Cancelled

Order table:

- Order ID
- Customer
- Garment Type
- Quantity
- Order Date
- Delivery Date
- Priority
- Status
- Progress
- Actions

Add:

- Search
- Advanced filters
- Status filter
- Priority filter
- Date range filter
- Customer filter
- Sorting
- Pagination

==================================================
15. ORDER CREATION
==================================================

Create a clean multi-section order form.

Sections:

Customer Information

- Customer
- Contact

Garment Details

- Garment type
- Size
- Color
- Quantity
- Fabric
- Customization details

Order Details

- Order date
- Expected delivery date
- Priority
- Notes

Pricing Summary

- Unit price
- Quantity
- Discount
- Subtotal
- Tax if applicable
- Total

Buttons:

Save Draft
Create Order
Cancel

Show validation clearly.

==================================================
16. ORDER DETAILS PAGE
==================================================

Create a premium order details screen.

Top:

Order ID
Customer
Priority
Current Status

Show:

Order summary
Customer information
Garment information
Pricing
Delivery information

Most importantly create a visual order timeline:

Order Created
↓
Approved
↓
Materials Allocated
↓
Production Started
↓
Quality Check
↓
Ready for Delivery
↓
Delivered

Show date/time for completed stages.

Also show:

- Progress percentage
- Estimated completion
- Order history
- Activity log

==================================================
17. ORDER INNOVATION FEATURES
==================================================

Add UI concepts for innovative features:

A. Order Priority

Low
Medium
High
Urgent

B. Order Progress

Show percentage completion visually.

C. Order Timeline

Show complete lifecycle.

D. Smart Alerts

Examples:

"Delivery date approaching"

"Order delayed"

"Material shortage may affect this order"

E. Duplicate Order Warning

If a similar order exists, display a warning.

F. Order History / Audit Trail

Show every important change with:

- User
- Action
- Date/time
- Previous value
- New value

==================================================
18. PRODUCTION INTEGRATION
==================================================

Order Management should visually connect to Production Management.

When an order is approved:

Show:

"Ready for Production"

Production Supervisor can receive the order in the Production module.

Production updates should reflect back into the Order Timeline.

Do not duplicate the entire Production Management UI inside Order Management.

==================================================
19. INVENTORY INTEGRATION
==================================================

When creating or approving an order:

Show material availability.

Example:

Fabric:
Available

Buttons / status:

Materials Available
Low Stock
Insufficient Stock

If insufficient:

Show a warning:

"This order may be delayed due to insufficient material stock."

==================================================
20. FINANCE INTEGRATION
==================================================

Order details should show:

- Subtotal
- Discount
- Total
- Payment Status
- Invoice Status

Provide a clear link/button to view the related invoice.

Do not duplicate the full Finance module.

==================================================
21. MARKETING INTEGRATION
==================================================

When creating an order:

Allow eligible promotions to be applied.

Show:

Available Offers
Applied Discount
Discount Amount
Final Total

Marketing-created offers should automatically appear where applicable.

==================================================
22. EMPLOYEE & USER MANAGEMENT
==================================================

Create shared system-wide screens for:

- Employee List
- Employee Profile
- Add Employee
- Edit Employee
- Employee Status
- Department
- Role

User Management:

- Users
- Roles
- Permissions
- Account status
- Profile management

These should be accessible according to RBAC.

==================================================
23. REPORTS & ANALYTICS
==================================================

Create a professional Reports section.

Reports:

- Sales / Orders Report
- Production Report
- Inventory Report
- Revenue Report
- Customer Report
- Marketing Report

Provide:

- Date filters
- Export
- PDF
- Excel
- Charts
- Tables

==================================================
24. NOTIFICATIONS
==================================================

Create a notification center.

Examples:

"Order ORD-1024 has been approved."

"Order ORD-1024 is delayed."

"Material stock is low."

"Invoice INV-1024 is overdue."

"New promotion is active."

Use notification categories and read/unread states.

==================================================
25. UI COMPONENT SYSTEM
==================================================

Create reusable components:

- Buttons
- Inputs
- Selects
- Dropdowns
- Date Pickers
- Tables
- Cards
- Badges
- Status indicators
- Progress bars
- Modals
- Confirmation dialogs
- Toast notifications
- Tabs
- Breadcrumbs
- Pagination
- Charts
- Timeline
- Empty states
- Loading states
- Error states

All components must have consistent styling.

==================================================
26. RESPONSIVE DESIGN
==================================================

Design for:

Desktop
1440px
1280px

Tablet
768px

Mobile
390px

Desktop is the primary target because this is an internal company ERP system.

The sidebar should collapse on smaller screens.

Tables should become responsive cards where necessary.

==================================================
27. ACCESSIBILITY
==================================================

Use:

- High contrast
- Clear typography
- Proper form labels
- Keyboard-friendly controls
- Meaningful status indicators
- Do not rely only on color to communicate information

==================================================
28. IMPORTANT UX RULES
==================================================

Do not overload dashboards.

Prioritize information based on user role.

Use progressive disclosure.

Keep important actions visible.

Use confirmation dialogs for destructive actions.

Use clear success/error feedback.

Use skeleton loading states.

Use empty states with useful actions.

Make every table easy to search and filter.

==================================================
29. DESIGN SYSTEM
==================================================

Create a reusable design system page containing:

- Color tokens
- Typography
- Spacing
- Border radius
- Shadows
- Icons
- Buttons
- Form controls
- Cards
- Tables
- Badges
- Charts
- Navigation components

Create component variants for:

- Default
- Hover
- Active
- Disabled
- Loading
- Error
- Success

==================================================
30. REQUIRED FINAL SCREENS
==================================================

Generate polished screens for:

1. Login
2. Admin Dashboard
3. Sales Executive Dashboard
4. Operations Manager Dashboard
5. Inventory Dashboard
6. Production Dashboard
7. Finance Dashboard
8. Marketing Dashboard
9. Customer Management
10. Order Dashboard
11. Order List
12. Create Order
13. Edit Order
14. Order Details
15. Order Timeline
16. Inventory Management
17. Production Management
18. Finance & Billing
19. Marketing Management
20. Employee Management
21. User Management
22. Profile
23. Notifications
24. Reports
25. Settings
26. Empty States
27. Error States
28. Confirmation Modals

The final result should feel like a cohesive enterprise SaaS/ERP product.

Do not create the public customer-facing website in this design.
The customer-facing website will be designed as a separate project with a more marketing-oriented and brand-focused experience.