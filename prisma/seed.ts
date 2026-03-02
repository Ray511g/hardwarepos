import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏗️ Start Seeding Production Database...')

  // Clear existing data (For initial cleanup)
  await prisma.saleItem.deleteMany().catch(() => null)
  await prisma.sale.deleteMany().catch(() => null)
  await prisma.product.deleteMany().catch(() => null)
  await prisma.customer.deleteMany().catch(() => null)
  await prisma.user.deleteMany().catch(() => null)
  await prisma.businessSettings.deleteMany().catch(() => null)

  // 1. Create System Operators (Admin & Cashiers)
  await prisma.user.createMany({
    data: [
      { username: 'admin', password: 'password123', name: 'Nairobi Admin Store', role: 'ADMIN' },
      { username: 'cashier1', password: 'password123', name: 'Alice Kamau', role: 'CASHIER' },
      { username: 'manager', password: 'password123', name: 'James Maina', role: 'MANAGER' }
    ]
  })

  // 2. Create Core Hardware Inventory (Kenyan Specialty Items)
  await prisma.product.createMany({
    data: [
      // Cement Items with Bulk Logic
      { sku: 'CEM-BAM-50', name: 'Bamburi Tembo Cement (50kg)', category: 'Cement', unit: 'Bag', unitPrice: 950, costPrice: 880, stockLevel: 250, minStockLevel: 50, bulkThreshold: 50, bulkDiscountPrice: 920 },
      { sku: 'CEM-DV-50', name: 'Devki Limestone Cement (50kg)', category: 'Cement', unit: 'Bag', unitPrice: 820, costPrice: 750, stockLevel: 500, minStockLevel: 100, bulkThreshold: 100, bulkDiscountPrice: 800 },
      
      // Steel & Building Materials
      { sku: 'STL-D12-6M', name: 'D12 Deformed Steel Bar (6m)', category: 'Steel', unit: 'Pc', unitPrice: 1250, costPrice: 1100, stockLevel: 120, minStockLevel: 20, bulkThreshold: 20, bulkDiscountPrice: 1210 },
      { sku: 'STL-D8-6M', name: 'D8 Deformed Steel Bar (6m)', category: 'Steel', unit: 'Pc', unitPrice: 650, costPrice: 580, stockLevel: 200, minStockLevel: 50, bulkThreshold: 50, bulkDiscountPrice: 630 },
      
      // Roofing
      { sku: 'ROF-BOX-3M', name: 'Box Profile Sheet - Blue (3m)', category: 'Roofing', unit: 'Pc', unitPrice: 2400, costPrice: 2100, stockLevel: 45, minStockLevel: 10, bulkThreshold: 10, bulkDiscountPrice: 2320 },
      { sku: 'ROF-MAI-WHT-2.5', name: 'Mabati White Oxide (2.5m)', category: 'Roofing', unit: 'Pc', unitPrice: 1450, costPrice: 1250, stockLevel: 80, minStockLevel: 15 },
      
      // Paint (Premium Kenyan Brands)
      { sku: 'PNT-CRW-WHT-4', name: 'Crown Vinyl Matt White (4L)', category: 'Paint', unit: 'Tin', unitPrice: 2400, costPrice: 1950, stockLevel: 30, minStockLevel: 5 },
      { sku: 'PNT-DUR-GLOS-4', name: 'Duracoat High Gloss Cream (4L)', category: 'Paint', unit: 'Tin', unitPrice: 3200, costPrice: 2750, stockLevel: 12, minStockLevel: 3 },
      
      // Plumbing & Electrical
      { sku: 'PLM-PVC-1/2', name: 'PVC Pipe 1/2-inch (PN10)', category: 'Plumbing', unit: 'Pc', unitPrice: 450, costPrice: 380, stockLevel: 150, minStockLevel: 30 },
      { sku: 'ELE-WIR-1.5B', name: 'Electrical Wire 1.5mm Blue (100m)', category: 'Electrical', unit: 'Roll', unitPrice: 3200, costPrice: 2850, stockLevel: 10, minStockLevel: 5 }
    ]
  })

  // 3. Seed Customers with Debt Ledger simulation
  await prisma.customer.createMany({
    data: [
      { name: 'John Nairobi Construction', phone: '0711122233', debtBalance: 0, creditLimit: 250000 },
      { name: 'Alice Kamau (Contractor)', phone: '0722233344', debtBalance: 4500, creditLimit: 50000 },
      { name: 'Nairobi County Works', phone: '0733344455', debtBalance: 125000, creditLimit: 1000000 }
    ]
  })

  // 4. Global Business Profile
  await prisma.businessSettings.create({
    data: {
      id: 'singleton',
      name: 'Kenya Hardware Pro HQ',
      phone: '+254 700 123 456',
      email: 'pos.nairobi@kenyahardware.pro',
      address: 'Industrial Area, Lunga Lunga Rd, Nairobi',
      pinNumber: 'P051234567X',
      paybillNumber: '123456',
      tillNumber: '654321',
      accountSuffix: '-HARD'
    }
  })

  console.log('✅ Production Database Seeded Successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
