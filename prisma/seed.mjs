import 'dotenv/config';
import pg from 'pg';
import * as argon2 from 'argon2';

const { Client } = pg;

function generateUUIDv7() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const now = BigInt(Date.now());
  bytes[0] = Number((now >> 40n) & 0xffn);
  bytes[1] = Number((now >> 32n) & 0xffn);
  bytes[2] = Number((now >> 24n) & 0xffn);
  bytes[3] = Number((now >> 16n) & 0xffn);
  bytes[4] = Number((now >> 8n) & 0xffn);
  bytes[5] = Number(now & 0xffn);
  bytes[6] = 0x70 | (bytes[6] & 0x0f);
  bytes[8] = 0x80 | (bytes[8] & 0x3f);
  return [...bytes].map((b, i) => ([4, 6, 8, 10].includes(i) ? '-' : '') + b.toString(16).padStart(2, '0')).join('');
}

async function seed() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://pcs_user:pcs_secret@localhost:5432/pcs_auth?schema=public';
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('[SEED] Seeding SSO Auth Service...');

    // 1. Upsert App 'sistem-pcs'
    await client.query(`
      INSERT INTO "auth_app" (app_id, app_nama, app_deskripsi, app_is_active, app_created_at, app_updated_at)
      VALUES ('sistem-pcs', 'Sistem PCS (Struktur Organisasi & Kepegawaian)', 'Master Data Organisasi & Posisi', true, NOW(), NOW())
      ON CONFLICT (app_id) DO NOTHING;
    `);
    console.log('[SEED] App registered: sistem-pcs');

    // 2. Upsert Superadmin
    const username = 'superadmin';
    const passwordHash = await argon2.hash('123123123');
    let authId;

    const existing = await client.query('SELECT auth_id FROM "auth_account" WHERE auth_username = $1', [username]);
    if (existing.rows.length > 0) {
      authId = existing.rows[0].auth_id;
      await client.query('UPDATE "auth_account" SET auth_password_hash = $1 WHERE auth_id = $2', [passwordHash, authId]);
      console.log(`[SEED] Superadmin account updated: ${username} (${authId})`);
    } else {
      authId = generateUUIDv7();
      await client.query(`
        INSERT INTO "auth_account" (auth_id, auth_username, auth_password_hash, auth_is_active, auth_created_at, auth_updated_at)
        VALUES ($1, $2, $3, true, NOW(), NOW())
      `, [authId, username, passwordHash]);
      console.log(`[SEED] Superadmin account created: ${username} (${authId})`);
    }

    // 3. Upsert Role Superadmin di sistem-pcs
    const existingAssign = await client.query(
      'SELECT account_app_id FROM "auth_account_app" WHERE auth_id = $1 AND app_id = $2',
      [authId, 'sistem-pcs']
    );

    if (existingAssign.rows.length === 0) {
      const accountAppId = generateUUIDv7();
      await client.query(`
        INSERT INTO "auth_account_app" (account_app_id, auth_id, app_id, app_role, is_active, created_at, updated_at)
        VALUES ($1, $2, 'sistem-pcs', 'SUPERADMIN', true, NOW(), NOW())
      `, [accountAppId, authId]);
      console.log('[SEED] Assigned superadmin to sistem-pcs with role SUPERADMIN');
    }

    console.log('[SEED] SSO Auth Seeding selesai!');
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error('[SEED ERROR]', err);
  process.exit(1);
});
