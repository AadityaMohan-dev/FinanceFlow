import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from './prisma'

export async function getOrCreateUser() {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    throw new Error('User not found')
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        imageUrl: clerkUser.imageUrl,
      }
    })
  }

  return user
}

export async function getCurrentUser() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  return prisma.user.findUnique({
    where: { clerkId: userId }
  })
}