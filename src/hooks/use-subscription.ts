
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';

const STORAGE_KEY_PREFIX = 'campus-ai-pro-subscription';

export type Plan = 'Free' | 'Pro';

export function useSubscription() {
  const [plan, setPlan] = useState<Plan>('Free');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const getStorageKey = useCallback(() => {
    if (!user) return null;
    return `${STORAGE_KEY_PREFIX}-${user.uid}`;
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    
    const storageKey = getStorageKey();
    if (!storageKey) {
        setLoading(false);
        return;
    }

    setLoading(true);
    try {
      const storedPlan = localStorage.getItem(storageKey);
      if (storedPlan && (storedPlan === 'Free' || storedPlan === 'Pro')) {
        setPlan(storedPlan);
      } else {
        setPlan('Free');
      }
    } catch (error) {
      console.error('Failed to load subscription plan from localStorage', error);
      toast({
        title: 'Error',
        description: 'Could not load your subscription details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, authLoading, getStorageKey]);

  const updatePlan = useCallback((newPlan: Plan) => {
    const storageKey = getStorageKey();
    if (!storageKey) {
        toast({
            title: 'Error',
            description: 'You must be logged in to change your plan.',
            variant: 'destructive',
          });
        return;
    };

    try {
      localStorage.setItem(storageKey, newPlan);
      setPlan(newPlan);
    } catch (error) {
      console.error('Failed to save subscription plan to localStorage', error);
      toast({
        title: 'Error',
        description: 'Could not update your subscription plan.',
        variant: 'destructive',
      });
    }
  }, [toast, getStorageKey]);

  return { plan, setPlan: updatePlan, loading: loading || authLoading };
}
