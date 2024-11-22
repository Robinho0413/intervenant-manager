import { db } from './db';
import { Intervenant } from './definitions/intervenant';

export async function fetchIntervenants(): Promise<Intervenant[]> {
    try {
        const client = await db.connect();
        const result = await client.query('SELECT * FROM intervenants');
        client.release();
        return result.rows as Intervenant[];
    } catch (e: any) {
        console.error("Erreur de récupération des intervenants", e);
        throw e;
    }
}