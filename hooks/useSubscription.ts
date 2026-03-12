'use client';

import { useAuth } from '@clerk/nextjs';
import type { Plan } from '@/types';

/**
 * Returns the current user's plan slug. Falls back to `free` when the user is
 * unsigned or has no active subscription.
 */
export const useUserPlan = (): Plan => {
    const { has } = useAuth();

    if (has({ plan: 'user:pro' })) return 'pro';
    if (has({ plan: 'user:standard' })) return 'standard';
    return 'free';
};

/**
 * Convenience boolean check for a specific plan. Useful when enforcing limits on
 * the client or controlling UI elements.
 */
export const useHasPlan = (plan: Plan): boolean => {
    const { has } = useAuth();
    return has({ plan: `user:${plan}` });
};
