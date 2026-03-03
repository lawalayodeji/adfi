import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/adwords",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (
          credentials.email !== process.env.ADMIN_EMAIL ||
          credentials.password !== process.env.ADMIN_PASSWORD
        ) return null;

        // Find or create the admin user in DB
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          user = await prisma.user.create({
            data: { email: credentials.email, name: "Admin" },
          });
        }
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // On first sign-in, persist user ID + refresh token into the JWT
      if (user) {
        token.id = user.id;
      }
      if (account?.refresh_token && user?.id) {
        token.refreshToken = account.refresh_token;
        // Persist refresh token to DB (non-critical)
        try {
          await prisma.user.update({
            where: { id: user.id as string },
            data: { googleRefreshToken: account.refresh_token },
          });
        } catch (_) {}
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  debug: true,
};
