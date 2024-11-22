import { Pool } from 'pg';

const db = new Pool({
    user: process.env.POSTGRES_USER,
    host: 'db',
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
});

export { db };