const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        const adminExists = await User.findOne({ username: adminUsername });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            await User.create({
                username: adminUsername,
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin account created successfully during auto-seed.');
        } else {
            console.log('Admin account already exists.');
        }
    } catch (error) {
        console.error('Error auto-seeding admin:', error.message);
    }
};

module.exports = seedAdmin;
