
'use client';
import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Check if user has completed onboarding
        const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
        if (onboardingComplete) {
          redirect('/chat/general/knowledge');
        } else {
          // This case handles users who signed up but didn't finish onboarding
          redirect('/onboarding');
        }
      } else {
        redirect('/login');
      }
    }
  }, [user, loading]);

  // Return null or a loading spinner while checking auth state
  return null;
}
