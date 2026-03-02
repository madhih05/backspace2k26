import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthorizedUser extends Document {
    email: string;
    role: 'staff' | 'admin';
}

const AuthorizedUserSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    role: {
        type: String,
        enum: ['staff', 'admin'],
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model<IAuthorizedUser>('AuthorizedUser', AuthorizedUserSchema);