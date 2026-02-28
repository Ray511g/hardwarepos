import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clear existing data
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.user.deleteMany()
  await prisma.businessSettings.deleteMany()

  // Seed Business Profile
  await prisma.businessSettings.create({
    data: {
      id: 'singleton',
      name: 'KENYA HARDWARE PRO',
      phone: '0700123456',
      email: 'pos@kenyahardware.co.ke',
      address: 'Main Street, Nairobi',
      pinNumber: 'P051234567X',
      paybillNumber: '247247',
      tillNumber: '567890'
    }
  })

  // Seed Users
  await prisma.user.createMany({
    data: [
      { username: 'admin', password: 'password123', name: 'System Admin', role: 'ADMIN' },
      { username: 'cashier1', password: 'password123', name: 'Main Cashier', role: 'CASHIER' }
    ]
  })

  // Seed Comprehensive Hardware Inventory
  const hardwareItems = [
    // Cement & Foundation
    { sku: 'CEM-BAM-50', name: 'Bamburi Tembo Cement (50kg)', category: 'Cement', unit: 'Bag', unitPrice: 950, costPrice: 820 },
    { sku: 'CEM-SAV-50', name: 'Savannah Cement (50kg)', category: 'Cement', unit: 'Bag', unitPrice: 930, costPrice: 800 },
    { sku: 'CEM-BLU-50', name: 'Blue Triangle Cement (50kg)', category: 'Cement', unit: 'Bag', unitPrice: 940, costPrice: 810 },
    
    // Steel & Reinforcement
    { sku: 'STL-D12-6M', name: 'D12 Deformed Steel Bar (6m)', category: 'Steel', unit: 'Pc', unitPrice: 1250, costPrice: 1050 },
    { sku: 'STL-D10-6M', name: 'D10 Deformed Steel Bar (6m)', category: 'Steel', unit: 'Pc', unitPrice: 850, costPrice: 720 },
    { sku: 'STL-D8-6M', name: 'D8 Deformed Steel Bar (6m)', category: 'Steel', unit: 'Pc', unitPrice: 550, costPrice: 460 },
    { sku: 'STL-R6-6M', name: 'R6 Round Bar (6m)', category: 'Steel', unit: 'Pc', unitPrice: 350, costPrice: 280 },
    { sku: 'STL-BRC-A142', name: 'BRC Mesh A142 (Sheet)', category: 'Steel', unit: 'Pc', unitPrice: 4500, costPrice: 3800 },
    
    // Roofing
    { sku: 'ROF-BOX-3M', name: 'Box Profile Sheet - Blue (3m)', category: 'Roofing', unit: 'Pc', unitPrice: 1800, costPrice: 1550 },
    { sku: 'ROF-BOX-GRN', name: 'Box Profile Sheet - Green (3m)', category: 'Roofing', unit: 'Pc', unitPrice: 1800, costPrice: 1550 },
    { sku: 'ROF-GCI-30G', name: 'GCI Sheet 30 Gauge (2m)', category: 'Roofing', unit: 'Pc', unitPrice: 950, costPrice: 820 },
    
    // Plumbing
    { sku: 'PLM-PVC-1/2', name: 'PVC Pipe 1/2-inch (PN10)', category: 'Plumbing', unit: 'Pc', unitPrice: 450, costPrice: 350 },
    { sku: 'PLM-PVC-3/4', name: 'PVC Pipe 3/4-inch (PN10)', category: 'Plumbing', unit: 'Pc', unitPrice: 650, costPrice: 520 },
    { sku: 'PLM-ELB-1/2', name: 'PVC Elbow 1/2-inch', category: 'Plumbing', unit: 'Pc', unitPrice: 50, costPrice: 35 },
    { sku: 'PLM-TAPE-PTFE', name: 'PTFE Thread Tape', category: 'Plumbing', unit: 'Pc', unitPrice: 40, costPrice: 25 },
    
    // Electrical
    { sku: 'ELE-WIR-1.5B', name: 'Electrical Wire 1.5mm Blue (100m)', category: 'Electrical', unit: 'Roll', unitPrice: 3200, costPrice: 2800 },
    { sku: 'ELE-WIR-2.5R', name: 'Electrical Wire 2.5mm Red (100m)', category: 'Electrical', unit: 'Roll', unitPrice: 4500, costPrice: 3900 },
    { sku: 'ELE-SWT-1G', name: 'Single Gang Switch', category: 'Electrical', unit: 'Pc', unitPrice: 150, costPrice: 100 },
    { sku: 'ELE-SOC-SNG', name: 'Single Socket Outlet', category: 'Electrical', unit: 'Pc', unitPrice: 250, costPrice: 180 },
    
    // Paint & Finishes
    { sku: 'PNT-CRW-WHT-4', name: 'Crown Vinyl Matt White (4L)', category: 'Paint', unit: 'Tin', unitPrice: 2400, costPrice: 2100 },
    { sku: 'PNT-GLS-BLK-4', name: 'Crown Super Gloss Black (4L)', category: 'Paint', unit: 'Tin', unitPrice: 2800, costPrice: 2450 },
    { sku: 'PNT-THN-5L', name: 'Standard Paint Thinner (5L)', category: 'Paint', unit: 'Tin', unitPrice: 1200, costPrice: 950 },
    { sku: 'PNT-RLR-9', name: 'Paint Roller 9-inch', category: 'Paint', unit: 'Pc', unitPrice: 450, costPrice: 320 },
    
    // Tools & Hardware
    { sku: 'TOL-HAM-2LB', name: 'Claw Hammer 2lb', category: 'Tools', unit: 'Pc', unitPrice: 850, costPrice: 650 },
    { sku: 'NAL-CON-3', name: 'Concrete Nails (3-inch)', category: 'Hardware', unit: 'Kg', unitPrice: 150, costPrice: 110 },
    { sku: 'NAL-TIM-4', name: 'Timber Nails (4-inch)', category: 'Kg', unit: 'Kg', unitPrice: 120, costPrice: 95 },
    { sku: 'HNG-BUT-3', name: 'Steel Butt Hinge (3-inch)', category: 'Hardware', unit: 'Pair', unitPrice: 180, costPrice: 130 }
  ];

  for (const item of hardwareItems) {
    await prisma.product.create({
      data: {
        ...item,
        stockLevel: Math.floor(Math.random() * 100) + 10,
        minStockLevel: 10
      }
    })
  }

  console.log('Comprehensive Seeding Finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
