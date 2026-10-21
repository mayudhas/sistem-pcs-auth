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

    // 1. Bersihkan sisa referensi lama sistem-pcs jika ada
    await client.query(`DELETE FROM "auth_account_app" WHERE app_id = 'sistem-pcs';`);
    await client.query(`DELETE FROM "auth_app" WHERE app_id = 'sistem-pcs';`);

    // 2. Register Aplikasi Kantor Virtual
    await client.query(`
      INSERT INTO "auth_app" (app_id, app_nama, app_deskripsi, app_is_active, app_created_at, app_updated_at)
      VALUES ('kantor-virtual', 'Kantor Virtual', 'Corporate Workspace & Business Administration', true, NOW(), NOW())
      ON CONFLICT (app_id) DO UPDATE SET
        app_nama = EXCLUDED.app_nama,
        app_deskripsi = EXCLUDED.app_deskripsi,
        app_is_active = true,
        app_updated_at = NOW();
    `);
    console.log('[SEED] App registered: kantor-virtual');

    // 3. Upsert Superadmin SSO (Password default: 123123123)
    const superadminUsername = 'superadmin';
    const superadminPasswordHash = await argon2.hash('123123123');
    let superadminId;

    const existingSuperadmin = await client.query('SELECT auth_id FROM "auth_account" WHERE auth_username = $1', [superadminUsername]);
    if (existingSuperadmin.rows.length > 0) {
      superadminId = existingSuperadmin.rows[0].auth_id;
      await client.query(`
        UPDATE "auth_account" 
        SET auth_password_hash = $1, auth_is_superadmin = true, auth_is_active = true, auth_updated_at = NOW()
        WHERE auth_id = $2
      `, [superadminPasswordHash, superadminId]);
      console.log(`[SEED] Superadmin account updated: ${superadminUsername} (${superadminId})`);
    } else {
      superadminId = generateUUIDv7();
      await client.query(`
        INSERT INTO "auth_account" (auth_id, auth_username, auth_password_hash, auth_is_superadmin, auth_is_active, auth_created_at, auth_updated_at)
        VALUES ($1, $2, $3, true, true, NOW(), NOW())
      `, [superadminId, superadminUsername, superadminPasswordHash]);
      console.log(`[SEED] Superadmin account created: ${superadminUsername} (${superadminId})`);
    }

    // 4. Upsert User Pegawai Kantor Virtual (mayudhas / 123123123)
    const employeeUsername = 'mayudhas';
    const employeePasswordHash = await argon2.hash('123123123');
    let employeeId;

    const existingEmployee = await client.query('SELECT auth_id FROM "auth_account" WHERE auth_username = $1', [employeeUsername]);
    if (existingEmployee.rows.length > 0) {
      employeeId = existingEmployee.rows[0].auth_id;
      await client.query(`
        UPDATE "auth_account"
        SET auth_password_hash = $1, auth_is_active = true, auth_updated_at = NOW()
        WHERE auth_id = $2
      `, [employeePasswordHash, employeeId]);
      console.log(`[SEED] Employee account updated: ${employeeUsername} (${employeeId})`);
    } else {
      employeeId = generateUUIDv7();
      await client.query(`
        INSERT INTO "auth_account" (auth_id, auth_username, auth_password_hash, auth_is_superadmin, auth_is_active, auth_created_at, auth_updated_at)
        VALUES ($1, $2, $3, false, true, NOW(), NOW())
      `, [employeeId, employeeUsername, employeePasswordHash]);
      console.log(`[SEED] Employee account created: ${employeeUsername} (${employeeId})`);
    }

    // 5. Tetapkan Role SUPERADMIN Kantor Virtual untuk mayudhas
    const existingAssign = await client.query(
      'SELECT account_app_id FROM "auth_account_app" WHERE auth_id = $1 AND app_id = $2',
      [employeeId, 'kantor-virtual']
    );

    if (existingAssign.rows.length === 0) {
      const accountAppId = generateUUIDv7();
      await client.query(`
        INSERT INTO "auth_account_app" (account_app_id, auth_id, app_id, app_role, is_active, created_at, updated_at)
        VALUES ($1, $2, 'kantor-virtual', 'SUPERADMIN', true, NOW(), NOW())
      `, [accountAppId, employeeId]);
      console.log('[SEED] Assigned mayudhas to kantor-virtual with role SUPERADMIN');
    } else {
      await client.query(`
        UPDATE "auth_account_app"
        SET app_role = 'SUPERADMIN', is_active = true, updated_at = NOW()
        WHERE auth_id = $1 AND app_id = $2
      `, [employeeId, 'kantor-virtual']);
      console.log('[SEED] Verified mayudhas assignment to kantor-virtual');
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
