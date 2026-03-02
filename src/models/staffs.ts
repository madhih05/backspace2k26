import mongoose, { Document, Schema } from 'mongoose';

export interface IStaff extends Document {
    userId: mongoose.Types.ObjectId;
    tutorOf?: 'CSE' | 'IT' | 'AIDS';
    year?: 2 | 3 | 4;
    subjects?: string[];
};

const StaffSchema: Schema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    tutorOf: {
        type: String,
        enum: ['CSE', 'IT', 'AIDS'],
        required: false
    },
    year: {
        type: Number,
        enum: [2, 3, 4],
        required: false
    },
    subjects: {
        type: [String],
        required: false
    }
}, {
    timestamps: true
});

export default mongoose.model<IStaff>('Staff', StaffSchema);
