import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL missing')

const pool = new Pool({ connectionString: url })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const defaultCategories = [
  { name: 'Food & Dining', icon: '🍔', color: '#EF4444' },
  { name: 'Transportation', icon: '🚗', color: '#F59E0B' },
  { name: 'Shopping', icon: '🛍️', color: '#10B981' },
  { name: 'Entertainment', icon: '🎬', color: '#6366F1' },
  { name: 'Bills & Utilities', icon: '💡', color: '#8B5CF6' },
  { name: 'Healthcare', icon: '🏥', color: '#EC4899' },
  { name: 'Education', icon: '📚', color: '#14B8A6' },
  { name: 'Other', icon: '📦', color: '#6B7280' },
] as const

async function main() {
  console.log('🌱 Seeding default categories...')

  for (const category of defaultCategories) {
    // Find existing default category by name (where userId is null)
    const existing = await prisma.category.findFirst({
      where: {
        name: category.name,
        userId: null,
        isDefault: true,
      },
    })

    if (existing) {
      // Update existing
      await prisma.category.update({
        where: { id: existing.id },
        data: {
          icon: category.icon,
          color: category.color,
        },
      })
      console.log(`  ↻ Updated: ${category.icon} ${category.name}`)
    } else {
      // Create new
      await prisma.category.create({
        data: {
          ...category,
          isDefault: true,
          userId: null,
        },
      })
      console.log(`  ✓ Created: ${category.icon} ${category.name}`)
    }
  }

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })