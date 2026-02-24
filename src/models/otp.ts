import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
    email: string;
    otp: string;
    createdAt: Date;
}

const OtpSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // The document will be automatically deleted after 300 seconds (5 minutes)
    }
});


export default mongoose.model<IOtp>('Otp', OtpSchema);