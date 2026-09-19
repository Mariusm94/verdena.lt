import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/prisijungti",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.playerName = typeof user.playerName === "string" ? user.playerName : null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = String(token.role ?? "narys");
        session.user.playerName =
          typeof token.playerName === "string" ? token.playerName : null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
