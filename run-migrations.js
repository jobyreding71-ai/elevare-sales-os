const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL || 'https://svflkvvrenwcnskthleb.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
}

async function runMigrations() {
    console.log('Connecting to Supabase PostgreSQL...');

    // Extract project ref from URL
    const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

    const client = new Client({
        host: `db.${projectRef}.supabase.co`,
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: serviceKey,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✓ Connected to PostgreSQL!');

        // Read and execute schema migration
        const schemaPath = path.join(__dirname, 'supabase', 'migrations', '001_initial_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log('\nRunning schema migration...');
        await client.query(schemaSql);
        console.log('✓ Schema migration completed!');

        // Read and execute seed data
        const seedPath = path.join(__dirname, 'supabase', 'migrations', '002_seed_data.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        console.log('\nRunning seed data...');
        await client.query(seedSql);
        console.log('✓ Seed data inserted!');

        console.log('\n========================================');
        console.log('All migrations completed successfully!');
        console.log('========================================');

        // Verify tables were created
        const tablesResult = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        console.log('\nCreated tables:');
        tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));

    } catch (err) {
        console.error('Migration error:', err.message);
        if (err.code === '42P07') {
            console.log('\nNote: Tables already exist. Skipping...');
        } else {
            process.exit(1);
        }
    } finally {
        await client.end();
    }
}

runMigrations();
