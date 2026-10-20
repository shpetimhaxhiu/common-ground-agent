import { Client } from 'pg';
import { existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
const database='dev_common_ground_0de47d517752';
if(existsSync('.env')){
  process.loadEnvFile('.env');
  const url=new URL(process.env.DATABASE_URL);
  if(url.hostname!=='127.0.0.1'||url.port!=='5432'||url.pathname!==`/${database}`)throw new Error('Refusing a database target outside this project’s local database.');
  const test=new Client({connectionString:process.env.DATABASE_URL});await test.connect();await test.query('SELECT 1');await test.end();console.log('Project-local database ready.');
}else{
  const admin=new Client({host:'127.0.0.1',port:5432,user:'postgres',database:'postgres'});await admin.connect();
  const exists=await admin.query('SELECT 1 FROM pg_database WHERE datname=$1',[database]);
  const roleExists=await admin.query('SELECT 1 FROM pg_roles WHERE rolname=$1',[database]);
  if(exists.rowCount||roleExists.rowCount)throw new Error('Target already exists without project configuration; refusing to reuse unknown state.');
  const password=randomBytes(32).toString('hex');
  await admin.query(`CREATE ROLE "${database}" LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE`);
  await admin.query(`CREATE DATABASE "${database}"`);
  await admin.query(`GRANT ALL PRIVILEGES ON DATABASE "${database}" TO "${database}"`);
  const setup=new Client({host:"127.0.0.1",port:5432,user:"postgres",database});await setup.connect();await setup.query(`GRANT USAGE, CREATE ON SCHEMA public TO "${database}"`);await setup.end();
  await admin.end();
  writeFileSync('.env',`DATABASE_URL="postgresql://${database}:${password}@127.0.0.1:5432/${database}"\nBETTER_AUTH_SECRET="${randomBytes(32).toString('hex')}"\nBETTER_AUTH_URL="http://127.0.0.1:3161"\nENABLE_LIVE_QLOO="false"\n`,{mode:0o600});
  console.log('Created isolated local database and project-only non-superuser role. Credentials stored only in ignored .env.');
}
