/**
 * Migration script: copy MySQL (Sequelize) Menu and Message data into Firestore.
 * Usage (locally):
 * 1. Install deps: npm install
 * 2. Set environment variables in PowerShell:
 *    $env:FIREBASE_SERVICE_ACCOUNT = Get-Content .\\path\\to\\serviceAccount.json -Raw
 *    $env:USE_FIREBASE = 'true'
 *    (also set DB_* vars if your local Sequelize uses them)
 * 3. Run: node src/scripts/migrate-to-firestore.js
 */

const db = require('../../src/models');
const firebaseClient = require('../services/firebaseClient');

async function migrateMenu() {
  try {
    if (!db || !db.Menu) {
      console.error('Sequelize Menu model not available. Ensure your DB config and models are loaded.');
      return;
    }

    const items = await db.Menu.findAll();
    console.log(`Found ${items.length} menu items in MySQL.`);

    for (const it of items) {
      const data = {
        name: it.name,
        description: it.description,
        category: it.category,
        price: parseFloat(it.price) || 0,
        available: !!it.available,
        isBestseller: !!it.isBestseller,
        salesCount: it.salesCount || 0,
        rating: it.rating || null,
        createdAt: it.createdAt,
        updatedAt: it.updatedAt,
      };

      // Write directly to Firestore collection 'menu' with auto-id
      try {
        const fb = require('../services/firebaseClient');
        const dbf = require('firebase-admin').firestore();
        await dbf.collection('menu').add(data);
        console.log(`Migrated menu item: ${it.name}`);
      } catch (err) {
        console.error('Failed to write menu item to Firestore:', err && err.message ? err.message : err);
      }
    }
  } catch (err) {
    console.error('migrateMenu error:', err && err.message ? err.message : err);
  }
}

async function migrateMessages() {
  try {
    if (!db || !db.Message) {
      console.error('Sequelize Message model not available.');
      return;
    }

    const messages = await db.Message.findAll();
    console.log(`Found ${messages.length} messages in MySQL.`);

    for (const m of messages) {
      const data = {
        content: m.content,
        sender: m.sender || 'user',
        createdAt: m.createdAt,
      };
      try {
        const dbf = require('firebase-admin').firestore();
        await dbf.collection('messages').add(data);
        console.log(`Migrated message id ${m.id}`);
      } catch (err) {
        console.error('Failed to write message to Firestore:', err && err.message ? err.message : err);
      }
    }
  } catch (err) {
    console.error('migrateMessages error:', err && err.message ? err.message : err);
  }
}

async function main() {
  console.log('Starting migration to Firestore...');

  // Initialize Firebase via firebaseClient by calling a method
  try {
    const fb = require('../services/firebaseClient');
    // no-op just to ensure init
    await fb.getMenuItems();
  } catch (e) {
    console.warn('Firebase client init warning (can be ignored if FIREBASE_SERVICE_ACCOUNT not set):', e && e.message ? e.message : e);
  }

  await migrateMenu();
  await migrateMessages();

  console.log('Migration finished.');
  process.exit(0);
}

main();
