import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";


//google login setup to save users and sessions to DB
export const { handlers, auth, signIn, signOut} = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [Google],
    callbacks:{
        session({session, user}){
            session.user.id = user.id;
            return session;
        },
    },
});