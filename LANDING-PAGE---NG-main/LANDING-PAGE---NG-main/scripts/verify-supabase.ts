import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parser since we are in a script
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};

envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_ANON_KEY = env['VITE_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing Supabase credentials in .env");
    console.log(`URL: ${SUPABASE_URL ? 'Found' : 'Missing'}`);
    console.log(`KEY: ${SUPABASE_ANON_KEY ? 'Found' : 'Missing'}`);
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verify() {
    console.log("Verifying Supabase connection...");

    // 1. Check if we can read from site_configs (even if empty)
    const { data, error } = await supabase
        .from('site_configs')
        .select('*')
        .limit(1);

    if (error) {
        console.error("❌ Connection Failed:", error.message);
        console.error("Details:", error);

        if (error.code === '42P01') {
            console.error("\nHint: Tabela 'site_configs' não existe. Você rodou o SQL?");
        }
        process.exit(1);
    } else {
        console.log("✅ Connection Successful! Table 'site_configs' is accessible.");
        console.log(`Rows found: ${data.length}`);
    }

    // 2. Try to insert a dummy config (if empty) to verify insert policy
    if (data.length === 0) {
        console.log("Attempting insert test...");
        const { error: insertError } = await supabase
            .from('site_configs')
            .insert([{ config: { test: true, timestamp: new Date().toISOString() } }]);

        if (insertError) {
            console.error("❌ Insert Failed:", insertError.message);
            console.log("Hint: Verifique a policy 'Authenticated Insert Access' ou 'Public Insert Access'.");
        } else {
            console.log("✅ Insert Successful!");
        }
    }
}

verify();
