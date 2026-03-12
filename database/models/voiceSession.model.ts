import { models, Schema, model, Types } from "mongoose";
import { IVoiceSession } from "@/types";

interface IVoiceSessionModel extends Omit<IVoiceSession, 'bookId' | '_id'> {
    _id: Types.ObjectId;
    bookId: Types.ObjectId;
}

const VoiceSessionSchema = new Schema<IVoiceSessionModel>({
    clerkId: { type: String, required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    startedAt: { type: Date, required: true, default: Date.now },
    endedAt: { type: Date },
    durationSeconds: { type: Number, default: 0, required: true },
    billingPeriodStart: { type: Date, required: true, index: true },
}, { timestamps: true });

VoiceSessionSchema.index({ clerkId: 1, billingPeriodStart: 1 });

const VoiceSession = models.VoiceSession || model<IVoiceSessionModel>('VoiceSession', VoiceSessionSchema);
export default VoiceSession;
