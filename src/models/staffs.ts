import mongoose, { Document, Schema } from 'mongoose';

export interface IStaff extends Document {
    userId: mongoose.Types.ObjectId;
    username: string;
    name: string;
    email: string;
    phoneNumber: string;
    passwordHash: string;
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
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 15
    },
    passwordHash: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model<IStaff>('Staff', StaffSchema);
