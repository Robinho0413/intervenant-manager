'use server';

import { db } from './db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { inter } from '../ui/fonts';
import { v4 as uuidv4 } from 'uuid';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
  id: z.string(),
  email: z.string().email('Email invalide'),
  firstname: z.string(),
  lastname: z.string(),
});

const EditFormSchema = z.object({
  id: z.string(),
  email: z.string().email('Email invalide'),
  firstname: z.string(),
  lastname: z.string(),
  enddate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide')
});

export type State = {
  errors?: {
    email?: string[];
    firstname?: string[];
    lastname?: string[];
    enddate?: string[];
  };
  message?: string | null;
};

const CreateIntervenant = FormSchema.omit({ id: true });

export async function createIntervenant(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateIntervenant.safeParse({
    email: formData.get('email'),
    firstname: formData.get('firstname'),
    lastname: formData.get('lastname'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Champs manquants Création de l\'intervenant échouée.',
    };
  }

  // Prepare data for insertion into the database
  const { email, firstname, lastname } = validatedFields.data;

  // Vérifier si l'email existe déjà dans la base de données
  try {
    const client = await db.connect();
    const emailCheckResult = await client.query(
      'SELECT COUNT(*) FROM intervenants WHERE email = $1',
      [email]
    );
    client.release();

    const emailExists = parseInt(emailCheckResult.rows[0].count, 10) > 0;

    if (emailExists) {
      // Retourner un message d'erreur si l'email existe déjà
      return {
        errors: { email: ['Cet email est déjà utilisé.'] },
        message: 'Email déjà utilisé.',
      };
    }

    // Si l'email n'existe pas, continuer avec l'insertion dans la base de données
    const key = uuidv4();
    const creationdate = new Date().toISOString();
    const enddate = new Date();
    enddate.setMonth(enddate.getMonth() + 2);

    const clientInsert = await db.connect();
    await clientInsert.query(`
      INSERT INTO intervenants(
        email,
        firstname,
        lastname,
        key,
        creationdate,
        enddate,
        availability
      )
      VALUES ($1, $2, $3, $4, $5, $6, '{}')`, [email, firstname, lastname, key, creationdate, enddate.toISOString()]);
    clientInsert.release();

    revalidatePath('/dashboard/interveners');
    redirect('/dashboard/interveners');

  } catch (error) {
    return {
      message: 'Erreur base de données : Échec de la création de l\'intervenant : ' + error,
    };
  }
}

const UpdateIntervenant = EditFormSchema.omit({ id: true });

export async function updateIntervenant(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateIntervenant.safeParse({
    email: formData.get('email'),
    firstname: formData.get('firstname'),
    lastname: formData.get('lastname'),
    enddate: formData.get('enddate'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Champs manquants. Modification impossible.',
    };
  }

  const { email, firstname, lastname, enddate } = validatedFields.data;

  try {
    const client = await db.connect();
    const result = await client.query(`
      UPDATE intervenants
      SET email = $1, firstname = $2, lastname = $3, enddate = $4
      WHERE id = $5
    `, [email, firstname, lastname, enddate, id]);
    client.release();
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Intervenants: ' + error,
    };
  }

  revalidatePath('/dashboard/interveners');
  redirect('/dashboard/interveners');
}


export async function deleteIntervenant(id: string) {
  try {
    const client = await db.connect();
    const result = await client.query(`DELETE FROM intervenants WHERE id = ${id}`)
    client.release();
    revalidatePath('/dashboard/interveners');
    return { message: 'Deleted intervenants.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete intervenants.' };
  }
}

export async function regenerateKeyIntervenant(id: string) {
  try {
    const newKey = uuidv4();
    const creationdate = new Date().toISOString();
    const enddate = new Date();
    enddate.setMonth(enddate.getMonth() + 2);

    const client = await db.connect();
    await client.query(
      `UPDATE intervenants SET key = $1, creationdate = $2, enddate = $3 WHERE id = $4`,
      [newKey, creationdate, enddate.toISOString(), id]
    );
    client.release();
    revalidatePath('/dashboard/interveners');
    return { message: 'Clé régénérée avec succès.' };
  } catch (error) {
    return { message: 'Erreur base de données : Échec de la régénération de la clé : ' + error };
  }
}

export async function regenerateAllKeysIntervenant() {
  try {
    const client = await db.connect();
    const intervenants = await client.query('SELECT id FROM intervenants');

    for (const intervenant of intervenants.rows) {
      const newKey = uuidv4();
      const creationdate = new Date().toISOString();
      const enddate = new Date();
      enddate.setMonth(enddate.getMonth() + 2);

      await client.query(
        `UPDATE intervenants SET key = $1, creationdate = $2, enddate = $3 WHERE id = $4`,
        [newKey, creationdate, enddate.toISOString(), intervenant.id]
      );
    }

    client.release();
    revalidatePath('/dashboard/interveners');
    return { message: 'Toutes les clés ont été régénérées avec succès.' };
  } catch (error) {
    return { message: 'Erreur base de données : Échec de la régénération des clés : ' + error };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}