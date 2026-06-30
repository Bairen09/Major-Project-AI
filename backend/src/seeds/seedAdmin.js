require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        console.log('🌱 Starting Admin Seed Script...');
        // Match the backend db connection approach
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'localboost'
        });
        console.log('✅ Connected to MongoDB (localboost)');

        const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@localboost.ai';
        const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`⚠️ Super Admin with email ${adminEmail} already exists.`);
            if (existingAdmin.platformRole !== 'SUPER_ADMIN') {
                console.log(`🔄 Upgrading ${adminEmail} to SUPER_ADMIN role...`);
                existingAdmin.platformRole = 'SUPER_ADMIN';
                await existingAdmin.save();
                console.log(`✅ Successfully upgraded ${adminEmail} to SUPER_ADMIN.`);
            }
        } else {
            console.log(`👤 Creating Super Admin: ${adminEmail}`);
            await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'owner', // Default role required by schema
                platformRole: 'SUPER_ADMIN',
                status: 'ACTIVE'
            });
            console.log(`✅ Super Admin created successfully.`);
        }

        console.log('=============================');
        console.log('Admin Seeding Complete');
        console.log('=============================');

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};

seedAdmin();
