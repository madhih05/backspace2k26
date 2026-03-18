import 'dotenv/config'; // ✅ FIRST LINE - loads .env
import mongoose from 'mongoose';
import AuthorizedUser, { IAuthorizedUser } from './models/authorizedUsers';

// ✅ Remove the fallback so it forces .env value
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env!');
    process.exit(1);
}

mongoose.connect(MONGODB_URI).then(() => {
    console.log('Connected to MongoDB:', MONGODB_URI); // ✅ shows which DB
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

export async function addStaff(email: string): Promise<void> {
    try {
        const existingUser: IAuthorizedUser | null = await AuthorizedUser.findOne({ email });
        if (existingUser) {
            console.log(`User with email ${email} already exists with role ${existingUser.role}.`);
            return;
        }
        const newStaff: IAuthorizedUser = new AuthorizedUser({ email, role: 'staff' });
        await newStaff.save();
        console.log(`Staff member with email ${email} added successfully.`);
    } catch (error) {
        console.error('Error adding staff member:', error);
    }
}

export async function addAdmin(email: string): Promise<void> {
    try {
        const existingUser: IAuthorizedUser | null = await AuthorizedUser.findOne({ email });
        if (existingUser) {
            console.log(`User with email ${email} already exists with role ${existingUser.role}.`);
            return;
        }
        const newAdmin: IAuthorizedUser = new AuthorizedUser({ email, role: 'admin' });
        await newAdmin.save();
        console.log(`Admin member with email ${email} added successfully.`);
    } catch (error) {
        console.error('Error adding admin member:', error);
    }
}
