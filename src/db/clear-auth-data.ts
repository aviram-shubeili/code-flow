import { db } from './index';
import { users, accounts, sessions } from './schema';

async function clearAuthData() {
  try {
    console.log('🧹 Clearing Auth.js database data...');

    // Clear sessions first (foreign key dependency)
    await db.delete(sessions);
    console.log('✅ Sessions cleared');

    // Clear accounts (foreign key dependency)
    await db.delete(accounts);
    console.log('✅ Accounts cleared');

    // Clear users
    await db.delete(users);
    console.log('✅ Users cleared');

    console.log(
      '🎉 Database cleared successfully! Ready for fresh authentication.',
    );
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  clearAuthData();
}
