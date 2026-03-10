import mongoose from 'mongoose';
import AuthorizedUser, { IAuthorizedUser } from './models/authorizedUsers';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name';

mongoose.connect(MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
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
