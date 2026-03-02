import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏗️ Seeding Enterprise Hardware POS Data...')

  // Cleanup
  await prisma.expense.deleteMany().catch(() => null)
  await prisma.stockAudit.deleteMany().catch(() => null)
  await prisma.purchaseItem.deleteMany().catch(() => null)
  await prisma.purchaseOrder.deleteMany().catch(() => null)
  await prisma.payment.deleteMany().catch(() => null)
  await prisma.saleItem.deleteMany().catch(() => null)
  await prisma.sale.deleteMany().catch(() => null)
  await prisma.product.deleteMany().catch(() => null)
  await prisma.customer.deleteMany().catch(() => null)
  await prisma.supplier.deleteMany().catch(() => null)
  await prisma.user.deleteMany().catch(() => null)
  await prisma.businessSettings.deleteMany().catch(() => null)

  // 1. Users & Staff
  await prisma.user.createMany({
    data: [
      { username: 'admin', password: 'password123', name: 'Nairobi HQ Admin', role: 'ADMIN' },
      { username: 'cashier1', password: 'password123', name: 'Alice Kamau', role: 'CASHIER' }
    ]
  })

  // 2. Suppliers
  const s1 = await prisma.supplier.create({ data: { name: 'Bamburi Cement Ltd', contactPerson: 'John Doe', phone: '0700111222' } })
  const s2 = await prisma.supplier.create({ data: { name: 'Devki Steel Mills', contactPerson: 'Jane Smith', phone: '0700222333' } })

  // 3. Products
  const p1 = await prisma.product.create({
    data: { sku: 'CEM-BAM-50', name: 'Bamburi Tembo Cement (50kg)', category: 'Cement', unit: 'Bag', unitPrice: 950, costPrice: 880, stockLevel: 250, minStockLevel: 50, bulkThreshold: 50, bulkDiscountPrice: 920 }
  })
  const p2 = await prisma.product.create({
    data: { sku: 'STL-D12-6M', name: 'D12 Deformed Steel Bar (6m)', category: 'Steel', unit: 'Pc', unitPrice: 1250, costPrice: 1100, stockLevel: 120, minStockLevel: 20, bulkThreshold: 20, bulkDiscountPrice: 1210 }
  })

  // 4. Customers with Debt
  const c1 = await prisma.customer.create({
    data: { name: 'John Construction Ltd', phone: '0711122233', debtBalance: 75000, creditLimit: 250000 }
  })

  // 5. Initial Expenses
  await prisma.expense.createMany({
    data: [
      { category: 'RENT', description: 'Feb Shop Rent', amount: 45000 },
      { category: 'ELECTRICITY', description: 'KPLC Feb Token', amount: 3500 }
    ]
  })

  // 6. Initial Business Settings
  await prisma.businessSettings.create({
    data: {
      id: 'singleton',
      name: 'Kenya Hardware Pro HQ',
      pinNumber: 'P051234567X',
      address: 'Lunga Lunga Rd, Industrial Area, Nairobi'
    }
  })

  console.log('✅ Enterprise Seed Complete!')
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); })
