import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth({
  ...authConfig,
  trustHost: true, // Permet d'autoriser l'hôte actuel (localhost dans ce cas)
}).auth;

export const config = {
  // Matcher qui exclut les chemins API et statiques
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
