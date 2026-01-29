import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
    userId: mongoose.Types.ObjectId;
    registrationNumber: string;
    department: 'CSE' | 'IT' | 'AIDS';
    yearOfStudy: 2 | 3 | 4;
    fatherNumber: string;
    motherNumber: string;
};

const StudentSchema: Schema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    department: {
        type: String,
        enum: ['CSE', 'IT', 'AIDS'],
        required: true
    },
    yearOfStudy: {
        type: Number,
        enum: [2, 3, 4],
        required: true
    },
    fatherNumber: {
        type: String,
        required: false
    },
    motherNumber: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

export default mongoose.model<IStudent>('Student', StudentSchema);