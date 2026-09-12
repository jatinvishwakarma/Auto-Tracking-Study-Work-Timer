import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Password",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const password = credentials?.password as string | undefined;
        const expected = process.env.AUTH_PASSWORD;

        if (!expected) {
          throw new Error("AUTH_PASSWORD is not configured on the server.");
        }

        if (password === expected) {
          // Ensure the user exists in the database
          const user = await prisma.user.upsert({
            where: { id: "owner" },
            update: {},
            create: {
              id: "owner",
              name: "Jatin",
              email: "owner@tracker.local",
            },
          });

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
