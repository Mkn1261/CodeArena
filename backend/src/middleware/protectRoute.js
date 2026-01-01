import { clerkClient, requireAuth } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      // find user in db by clerk ID
      let user = await User.findOne({ clerkId });

      // Auto-provision a local user for signed-in Clerk users when webhook sync is not running.
      if (!user) {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        const primaryEmail =
          clerkUser.emailAddresses.find(
            (email) => email.id === clerkUser.primaryEmailAddressId
          )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

        if (!primaryEmail) {
          return res.status(400).json({ message: "Authenticated user is missing an email address" });
        }

        const name =
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || primaryEmail;

        user = await User.create({
          clerkId,
          email: primaryEmail,
          name,
          profileImage: clerkUser.imageUrl || "",
        });

        await upsertStreamUser({
          id: clerkId,
          name: user.name,
          image: user.profileImage,
        });
      }

      // attach user to req
      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
