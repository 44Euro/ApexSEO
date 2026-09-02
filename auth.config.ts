import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // Vercel and any reverse proxy terminate TLS upstream, so Auth.js has to take
  // the forwarded host instead of rejecting it as untrusted.
  trustHost: true,
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (!pathname.startsWith("/admin")) return true;
      if (pathname === "/admin/login") return true;
      return Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;
