import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { getSubscriptionStatus } from './subscription-service';

/**
 * Saves a new bot for the authenticated user.
 * Enforces limits based on subscription status.
 */
export async function saveBotForUser(userId: string, botData: any) {
  if (!userId) throw new Error('User not authenticated.');

  // Check subscription status
  const subscription = await getSubscriptionStatus(userId);
  const isPaid = subscription?.status === 'active' || subscription?.plan === 'Pro';

  // Get all existing bots for the user
  const botsRef = collection(db, 'users', userId, 'bots');
  const botsSnapshot = await getDocs(botsRef);
  const botCount = botsSnapshot.size;

  // Enforce limit
  if (!isPaid && botCount >= 1) {
    throw new Error('Free users can only create one bot. Please upgrade to add more.');
  }

  // Save bot
  await addDoc(botsRef, {
    ...botData,
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}
