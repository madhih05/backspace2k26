import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    registrationNumber: string;
    department: 'CSE' | 'IT' | 'AIDS';
    yearOfStudy: 2 | 3 | 4;
    fatherNumber: string;
    motherNumber: string;
    attendance: {
        date: Date;
        status: 'present' | 'absent';
    }[];
};

const StudentSchema: Schema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, 
        // Or use a default to auto-generate a random ID
        default: () => new mongoose.Types.ObjectId()
    },
    name: {
        type: String,
        required: true,
        trim: true
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
    },
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['present', 'absent'],
            required: true
        }
    }]
}, {
    timestamps: true
});

export default mongoose.model<IStudent>('Student', StudentSchema);