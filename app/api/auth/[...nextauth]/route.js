import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import { connectDb } from "../../../../utils/database";
import User from "@/models/user";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      const sessionUser = await User.findOne({ email: session.user.email });

      session.user.id = sessionUser._id;
      console.log("SESSION FROM BE:", session);
      return session;
    },
    async signIn({ profile }) {
      console.log("PROFILE:", profile);
      try {
        await connectDb();

        const userExists = await User.findOne({ email: profile.email });

        if (!userExists) {
          await User.create({
            email: profile.email,
            name: profile.given_name,
            image: profile.picture,
          });
        }
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
