import { auth } from '@clerk/nextjs/server';
import type { Plan } from '@/types';

/**
 * Determine the current user's plan using the `has` helper returned by Clerk's
 * `auth()` call. If the user isn't signed in or does not match any paid plan,
 * they are considered to be on the free tier.
 */
export const getUserPlan = async (): Promise<Plan> => {
    const { has } = await auth();
    if (has({ plan: 'user:pro' })) return 'pro';
    if (has({ plan: 'user:standard' })) return 'standard';
    return 'free';
};

/**
 * Short helper suitable for in‑action checks when you already know the plan
 * slug you want to verify. Returns `false` for unauthenticated users.
 */
export const userHasPlan = async (plan: Plan): Promise<boolean> => {
    const { has } = await auth();
    return has({ plan: `user:${plan}` });
};
