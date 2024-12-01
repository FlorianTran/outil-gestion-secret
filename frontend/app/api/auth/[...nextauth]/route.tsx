import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Récupérer la whitelist des variables d'environnement
const whitelistedEmails = process.env.WHITELISTED_EMAILS?.split(',') || [];

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Activer le debug pour faciliter le développement
  pages: {
    signIn: '/login',
  },
  callbacks: {
    /**
     * Contrôle si l'utilisateur est autorisé à se connecter
     */
    async signIn({ user }) {
      if (!user.email) {
        console.error('Connexion refusée : Aucun email trouvé.');
        return false; // Refuser si l'utilisateur n'a pas d'email
      }

      if (!whitelistedEmails.includes(user.email)) {
        console.error(`Connexion refusée : ${user.email} non autorisé.`);
        return false; // Refuser si l'email n'est pas dans la whitelist
      }

      return true; // Autoriser la connexion
    },

    /**
     * Ajoute les informations utilisateur dans la session
     */
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.email = token.email;
      }
      return session;
    },
  },
};

// Export des handlers GET et POST pour Next.js 13
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
