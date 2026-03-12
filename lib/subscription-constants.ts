export const getCurrentBillingPeriodStart = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

// subscription plan limits shared throughout the app
import type { Plan, PlanLimits } from '@/types';

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
    free: {
        maxBooks: 1,
        maxSessionsPerMonth: 5,
        maxSessionMinutes: 5,
        hasSessionHistory: false,
    },
    standard: {
        maxBooks: 10,
        maxSessionsPerMonth: 100,
        maxSessionMinutes: 15,
        hasSessionHistory: true,
    },
    pro: {
        maxBooks: 100,
        maxSessionsPerMonth: null, // unlimited
        maxSessionMinutes: 60,
        hasSessionHistory: true,
    },
};

export const getPlanLimits = (plan: Plan): PlanLimits => {
    return PLAN_LIMITS[plan];
};
