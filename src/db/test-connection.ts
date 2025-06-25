import { db, schema } from "./index";

async function testConnection() {
  try {
    console.log("Testing database connection...");

    // Try to query users table (should be empty)
    const result = await db.select().from(schema.users).limit(1);
    console.log("✅ Database connection successful!");
    console.log("Users table query result:", result);

    // Count users using Drizzle
    const allUsers = await db.select().from(schema.users);
    console.log(`📊 Users table contains ${allUsers.length} records`);

  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

// Run the test
testConnection().then(() => {
  console.log("Test completed");
  process.exit(0);
}).catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
