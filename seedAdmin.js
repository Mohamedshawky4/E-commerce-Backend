import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ MongoDB connected');

        // Admin user details
        const adminEmail = 'mohamedshawky4@example.com';
        const adminPassword = 'password123';
        const adminName = 'Mohamed Shawky';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`⚠️  Admin user already exists: ${adminEmail}`);
            console.log(`   Role: ${existingAdmin.role}`);

            // Update to admin if not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✓ Updated existing user to admin role');
            }
        } else {
            // Hash password
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            // Create admin user
            const admin = await User.create({
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isEmailVerified: true
            });

            console.log('✓ Admin user created successfully!');
            console.log(`   Email: ${admin.email}`);
            console.log(`   Role: ${admin.role}`);
            console.log(`   Password: ${adminPassword}`);
        }

        console.log('\n✅ Admin seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
};

// Run the seeder
seedAdmin();
