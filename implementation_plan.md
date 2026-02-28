# Implementation Plan: Kenya Hardware Pro POS

## Project Overview
A specialized Point of Sale system tailored for Kenyan hardware stores, focusing on regulatory compliance (eTIMS), local payment methods (M-Pesa), and industry-specific inventory management (mixed units).

## Core Features
1. **Premium Dashboard**: Real-time sales analytics and low-stock alerts.
2. **Advanced Inventory**: Support for mixed units (KG, Bags, Meters), batch tracking, and supplier management.
3. **Smart POS Interface**: Barcode-ready, quick search, and multiple payment modes.
4. **M-Pesa Integration**: STK Push for instant payments and automated reconciliation.
5. **KRA eTIMS Integration**: Automated tax invoicing and real-time reporting to KRA.
6. **Credit Management**: Tracking customer debts and payment statements.

## Technical Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Prisma with SQLite (v1) / PostgreSQL (v2)
- **Styling**: Vanilla CSS (Premium Design System)
- **Icons**: Lucide React
- **Payments**: Safaricom M-Pesa Daraja API

## Implementation Phases
### Phase 1: Foundation & Design System
- [ ] Initialize Next.js project
- [ ] Setup Global CSS Variables and Design Tokens
- [ ] Implement Sidebar and Layout

### Phase 2: Inventory & Database
- [ ] Define Prisma Schema
- [ ] Build Product Management (Mixed Units support)
- [ ] Create Category and Supplier management

### Phase 3: POS & Payments
- [ ] Build the POS selling interface
- [ ] Implement Cart logic
- [ ] Mock M-Pesa STK Push flow

### Phase 4: Compliance & Reports
- [ ] Create eTIMS Invoicing simulation
- [ ] Build Daily Sales and Tax Reports
- [ ] Implement Customer Credit tracking

### Phase 5: Polish & UX
- [ ] Add micro-animations
- [ ] Mobile responsiveness
- [ ] Final UI refinements
