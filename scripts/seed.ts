import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { merchants } from '../shared/schema';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

async function seedData() {
  console.log('Starting database seeding...');
  
  const defaultMerchants = [
    { name: 'BURGERSHOT', category: 'food', description: 'Premium burgers and fries', isActive: true },
  ];

  try {
    for (const merchant of defaultMerchants) {
      await db.insert(merchants).values(merchant).onConflictDoNothing();
    }
    
    console.log('Database seeded with default merchants successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seedData();