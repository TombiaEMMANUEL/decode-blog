import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { adminDb } from "./firebaseAdmin";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const userRef = adminDb.collection("users").doc(user.id);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
          await userRef.set({
            name: user.name,
            email: user.email,
            image: user.image,
            role: "reader",
            bookmarks: [],
            createdAt: new Date(),
          });
        }
        return true;
      } catch (error) {
        console.error("Error saving user:", error);
        return true;
      }
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
});