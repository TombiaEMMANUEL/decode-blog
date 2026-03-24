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
        // Use email as stable document ID
        const safeId = user.email.replace(/[.@]/g, "_");
        const userRef = adminDb.collection("users").doc(safeId);
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
        } else {
          // Update image and name in case they changed
          await userRef.update({
            name: user.name,
            image: user.image,
          });
        }
        return true;
      } catch (error) {
        console.error("Error saving user:", error);
        return true;
      }
    },
    async session({ session, token }) {
      // Use email-based stable ID
      session.user.id = token.email.replace(/[.@]/g, "_");
      return session;
    },
  },
});