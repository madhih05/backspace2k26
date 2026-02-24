import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    name: string;
    email: string;
    phoneNumber: string;
    passwordHash: string;
    role: 'student' | 'staff' | 'admin';
};

const UserSchema: Schema = new Schema({
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
    },
    role: {
        type: String,
        enum: ['user', 'staff', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);