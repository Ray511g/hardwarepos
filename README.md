# Kenya Hardware Pro POS

## Overview
Kenya Hardware Pro is a premium, high-performance Point of Sale system specifically designed for the unique needs of hardware businesses in Kenya. It combines modern technology with local requirements like **KRA eTIMS compliance** and **M-Pesa integration**.

## Key Features
- **Modern Dashboard**: Real-time sales insights, transaction tracking, and low-stock alerts.
- **eTIMS Integration**: Automated tax invoicing and real-time reporting to KRA.
- **M-Pesa Support**: Instant STK-Push payments and automated reconciliation.
- **Mixed Unit Inventory**: Handle sales in Bags, Pieces, Kilograms, and Metres with precision.
- **Customer Ledgers**: Track credit sales and manage debtor balances efficiently.
- **Supplier Management**: Keep track of procurement from top manufacturers.

## Tech Stack
- **Frontend**: Next.js 15 (App Router)
- **Styling**: Premium Vanilla CSS (Glassmorphism & Industrial Orange Aesthetic)
- **Database**: Prisma with SQLite
- **Icons**: Lucide React
- **Payments**: Daraja API (Safaricom)

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Initialize database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Folder Structure
- `/src/app`: Application routes and main pages.
- `/src/components`: Reusable UI components (including Receipts).
- `/src/lib`: Logic for M-Pesa, eTIMS, and Database access.
- `/prisma`: Database schema and migrations.

## License
Proprietary for Kenyan Hardware Businesses.
