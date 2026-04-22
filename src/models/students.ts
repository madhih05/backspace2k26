import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
    username: string;
    name: string;
    email: string;
    phoneNumber: string;
    passwordHash: string;
    registrationNumber: string;
    department: 'CSE' | 'IT' | 'AIDS';
    yearOfStudy: 2 | 3 | 4;
    fatherNumber: string;
    motherNumber: string;
};

const StudentSchema: Schema = new Schema({
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

export default mongoose.model<IStudent>('Student', StudentSchema);