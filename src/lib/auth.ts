import type { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/tr/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password || user.isBanned || !user.isActive) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
        } as NextAuthUser & { username: string; role: string };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        const u = user as NextAuthUser & { username?: string; role?: string; id: string };
        token.id = u.id;
        token.role = u.role ?? "USER";
        token.username = u.username;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        (session.user as typeof session.user & { id?: string; role?: string; username?: string }).id = token.id as string;
        (session.user as typeof session.user & { role?: string }).role = token.role as string;
        (session.user as typeof session.user & { username?: string }).username = token.username as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
