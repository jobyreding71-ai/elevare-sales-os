#!/bin/bash
# Supabase Setup Script for Elevare Sales OS
# Usage: ./supabase-setup.sh <SUPABASE_URL> <SUPABASE_SERVICE_KEY>

set -e

SUPABASE_URL="${1}"
SUPABASE_SERVICE_KEY="${2}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "Usage: ./supabase-setup.sh <SUPABASE_URL> <SUPABASE_SERVICE_KEY>"
    echo "Example: ./supabase-setup.sh https://xxxxx.supabase.co eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    exit 1
fi

echo "Connecting to Supabase project: $SUPABASE_URL"

# Install dependencies
npm install pg

# Create a Node.js script to run migrations
cat > /tmp/run_migrations.js << 'SCRIPT'
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.argv[2];
const serviceKey = process.argv[3];

// Extract host from URL
const url = new URL(supabaseUrl);
const host = url.hostname;

async function runMigrations() {
    const client = new Client({
        host: host,
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: serviceKey,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL!');

        // Read and execute schema migration
        const schemaPath = path.join(__dirname, 'supabase', 'migrations', '001_initial_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log('Running schema migration...');
        await client.query(schemaSql);
        console.log('Schema migration completed!');

        // Read and execute seed data
        const seedPath = path.join(__dirname, 'supabase', 'migrations', '002_seed_data.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        console.log('Running seed data...');
        await client.query(seedSql);
        console.log('Seed data inserted!');

        console.log('All migrations completed successfully!');
    } catch (err) {
        console.error('Migration error:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigrations();
SCRIPT

# Run the migration script
node /tmp/run_migrations.js "$SUPABASE_URL" "$SUPABASE_SERVICE_KEY"
