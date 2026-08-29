import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signAuthToken } from "../lib/jwt";
import { asyncHandler } from "../middleware/error";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, passwordHash } });
    const token = signAuthToken({ userId: user.id, email: user.email });
    return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  }),
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signAuthToken({ userId: user.id, email: user.email });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  }),
);

const oauthUpsertSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

/** Called by NextAuth's Google provider callback to get-or-create a user and mint our own JWT. */
authRouter.post(
  "/oauth-upsert",
  asyncHandler(async (req, res) => {
    const { name, email } = oauthUpsertSchema.parse(req.body);

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, authProvider: "google" },
    });

    const token = signAuthToken({ userId: user.id, email: user.email });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  }),
);
