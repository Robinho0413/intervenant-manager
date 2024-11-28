'use server';

import { db } from './db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { inter } from '../ui/fonts';
import { v4 as uuidv4 } from 'uuid';
 
const FormSchema = z.object({
  id: z.string(),
  email: z.string().email('Email invalide'),
  firstname: z.string(),
  lastname: z.string(),
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

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}


export async function deleteIntervenant(id: string) {
    try {
    const client = await db.connect();
    const result = await client.query(`DELETE FROM intervenants WHERE id = ${id}`)
    client.release();
    revalidatePath('/dashboard/interveners');
    return { message: 'Deleted intervenant.' };
    } catch (error) {
      return { message: 'Database Error: Failed to Delete intervenant.' };
    }
}

