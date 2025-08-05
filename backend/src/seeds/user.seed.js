import { config } from "dotenv";
import sequelize from "../lib/db.js";
import { User } from "../models/index.js";
import bcrypt from "bcryptjs";

config();

// Check if force flag is passed
const isForceMode = process.argv.includes('--force');

const seedUsers = [
  // Female Users
  {
    email: "emma.thompson@example.com",
    fullname: "Emma Thompson",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    email: "olivia.miller@example.com",
    fullname: "Olivia Miller",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    email: "sophia.davis@example.com",
    fullname: "Sophia Davis",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    email: "ava.wilson@example.com",
    fullname: "Ava Wilson",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    email: "isabella.brown@example.com",
    fullname: "Isabella Brown",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/women/5.jpg",
  },
  {
    email: "mia.johnson@example.com",
    fullname: "Mia Johnson",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/women/6.jpg",
  },
  {
    email: "charlotte.williams@example.com",
    fullname: "Charlotte Williams",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/women/7.jpg",
  },
  {
    email: "amelia.garcia@example.com",
    fullname: "Amelia Garcia",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/women/8.jpg",
  },
  {
    email: "2005chhengbunheang@gmail.com",
    fullname: "Chheng Bunheang",
    password: "1234567890",
    profilepic: "https://res.cloudinary.com/dimrsuslq/image/upload/v1752597811/kbeaqmvcced5n56lsn6s.jpg",
  },
  {
    email: "james.anderson@example.com",
    fullname: "James Anderson",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    email: "william.clark@example.com",
    fullname: "William Clark",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    email: "benjamin.taylor@example.com",
    fullname: "Benjamin Taylor",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    email: "lucas.moore@example.com",
    fullname: "Lucas Moore",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    email: "henry.jackson@example.com",
    fullname: "Henry Jackson",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    email: "alexander.martin@example.com",
    fullname: "Alexander Martin",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/men/6.jpg",
  },
  {
    email: "daniel.rodriguez@example.com",
    fullname: "Daniel Rodriguez",
    password: "123456",
    profilepic: "https://randomuser.me/api/portraits/men/7.jpg",
  },
];

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL database');

    // Check if users already exist
    const existingUsers = await User.count();
    console.log(`Found ${existingUsers} existing users`);

    if (existingUsers > 0 && !isForceMode) {
      console.log('Users already exist in database!');
      console.log('Skipping seed to preserve existing data.');
      console.log('To force reseed, run: npm run seed:force');
      process.exit(0);
    }

    if (isForceMode && existingUsers > 0) {
      console.log('Force mode: Clearing existing users...');
      await User.destroy({ where: {}, force: true });
      console.log('Cleared existing users');
    }

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      seedUsers.map(async (userData) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        return {
          ...userData,
          password: hashedPassword,
        };
      })
    );

    await User.bulkCreate(hashedUsers);
    console.log("Database seeded successfully");
    console.log(`Created ${hashedUsers.length} test users`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Call the function
seedDatabase();