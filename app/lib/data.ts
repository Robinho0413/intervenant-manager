"use server";

import { db } from '@/app/lib/db';
import { Intervenant } from './definitions/intervenant';

const ITEMS_PER_PAGE = 5;

export async function fetchIntervenants(): Promise<Intervenant[]> {
  try {
    const client = await db.connect();
    const result = await client.query(`
      SELECT intervenants.id,
        intervenants.email,
        intervenants.firstname,
        intervenants.lastname,
        intervenants.key,
        intervenants.creationdate,
        intervenants.enddate,
        intervenants.availability 
      FROM intervenants`);
    client.release();
    return result.rows as Intervenant[];
  } catch (error) {
    throw new Error(`Failed to fetch intervenants: ${error}`);
  }
}

export async function fetchIntervenantsPages(query: string): Promise<number> {
  try {
    const client = await db.connect();
    const result = await client.query('SELECT COUNT(*) FROM "intervenants"');
    client.release();
    return Math.ceil(Number(result.rows[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    throw new Error(`Failed to fetch intervenants pages: ${error}`);
  }
}

export async function fetchFilteredIntervenants(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const client = await db.connect();
    const queryText = `
      SELECT
        intervenants.id,
        intervenants.email,
        intervenants.firstname,
        intervenants.lastname,
        intervenants.key,
        intervenants.creationdate,
        intervenants.enddate,
        intervenants.availability
      FROM intervenants
      WHERE
        intervenants.firstname ILIKE $1 OR
        intervenants.lastname ILIKE $1 OR
        intervenants.email ILIKE $1 OR
        intervenants.key ILIKE $1
      ORDER BY intervenants.firstname ASC
      LIMIT $2 OFFSET $3
    `;
    const queryValues = [`%${query}%`, ITEMS_PER_PAGE, offset];
    const result = await client.query(queryText, queryValues);

    client.release();
    return result.rows as Intervenant[];

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch intervenants.');
  }
}

export async function fetchIntervenantById (id: string) {
  try {
    const client = await db.connect();
    const result = await client.query(`
      SELECT intervenants.id,
        intervenants.email,
        intervenants.firstname,
        intervenants.lastname,
        intervenants.key,
        intervenants.enddate
      FROM intervenants
      WHERE intervenants.id = $1`, [id]);
    client.release();
    return result.rows[0] as Intervenant;
  } catch (error) {
    throw new Error(`Failed to fetch intervenants: ${error}`);
  }
}

export async function fetchIntervenantByKey(key: string): Promise<Intervenant | null> {
  try {
    const client = await db.connect();
    const result = await client.query(`
      SELECT intervenants.id,
        intervenants.email,
        intervenants.firstname,
        intervenants.lastname,
        intervenants.key,
        intervenants.creationdate,
        intervenants.enddate,
        intervenants.availability
      FROM intervenants
      WHERE intervenants.key = $1`, [key]);
    client.release();

    if (result.rows.length === 0) {
      return null;
    }

    const intervenant = result.rows[0] as Intervenant;

    // Vérifier si la clé est expirée
    const currentDate = new Date();
    const endDate = new Date(intervenant.enddate);
    const isKeyExpired = currentDate > endDate;

    return {
      ...intervenant,
      isKeyExpired,
    };
  } catch (error) {
    throw new Error(`Failed to fetch intervenant by key: ${error}`);
  }
}