'use server';

import { StartSessionResult } from "@/types";
import { connectToDatabase } from "@/database/mongoose";
import VoiceSession from "@/database/models/voiceSession.model";
import { getCurrentBillingPeriodStart } from "../subscription-constants";
import { getUserPlan } from '@/lib/subscription';
import { getPlanLimits } from '../subscription-constants';



export const startVoiceSession = async (clerkId: string, bookId: string): Promise<StartSessionResult> => {
    try {
        await connectToDatabase();

        // enforce plan/session limits
        const plan = await getUserPlan();
        console.log(`[startVoiceSession] User plan: ${plan}`);
        const limits = getPlanLimits(plan);
        console.log(`[startVoiceSession] Plan limits:`, limits);

        if (limits.maxSessionsPerMonth !== null) {
            const periodStart = getCurrentBillingPeriodStart();
            const used = await VoiceSession.countDocuments({ clerkId, billingPeriodStart: periodStart });
            console.log(`[startVoiceSession] Sessions used this month: ${used}/${limits.maxSessionsPerMonth}`);
            if (used >= limits.maxSessionsPerMonth) {
                console.log(`[startVoiceSession] Limit reached for user ${clerkId}`);
                return {
                    success: false,
                    error: 'You have reached your monthly session limit for your subscription plan.',
                    isBillingError: true,
                };
            }
        }

        const session = await VoiceSession.create({
            clerkId, bookId, startedAt: new Date(),
            billingPeriodStart: getCurrentBillingPeriodStart(),
            durationSeconds: 0,
        });
        console.log(`[startVoiceSession] Session created successfully:`, session._id);
        return {
            success: true, sessionId: session._id.toString(),
            maxDurationMinutes: limits.maxSessionMinutes,
        };

    } catch (e) {
        console.error('[startVoiceSession] Error:', e);
        return { success: false, error: 'Failed to start voice session. Please try again later.' }
    }
}

export const endVoiceSession = async (sessionId: string, durationSeconds: number) => {
    try {
        await connectToDatabase();

        const result = await VoiceSession.findByIdAndUpdate(sessionId, {
            endedAt: new Date(),
            durationSeconds
        });
        if (!result) return { success: false, error: 'Voice Message Not Found' };

        return { success: true };
    } catch (e) {
        console.error('Error ending voice session:', e);
        return { success: false, error: 'Failed to end voice session. Please try again later.' }
    }
}

