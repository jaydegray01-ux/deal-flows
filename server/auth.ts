import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcrypt";
import connectPgSimple from "connect-pg-simple";
import crypto from "crypto";
import { storage } from "./storage";
import type { Express, Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";

async function generateUniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = crypto.randomBytes(4).toString("hex");
    const existing = await storage.getUserByReferralCode(code);
    if (!existing) return code;
  }
  return crypto.randomBytes(8).toString("hex");
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
    }
  }
}

const PgSession = connectPgSimple(session);

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "";

  if (process.env.NODE_ENV === "production") {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required in production");
    }
    if (!sessionSecret) {
      throw new Error("SESSION_SECRET is required in production");
    }
  }

  const effectiveSecret = sessionSecret || "dev-secret-change-me";

  app.use(
    session({
      store: new PgSession({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      }),
      secret: effectiveSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, {
            id: user.id,
            email: user.email,
            role: user.role,
          });
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(null, false);
      done(null, { id: user.id, email: user.email, role: user.role });
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });

      req.logIn(user, (err) => {
        if (err) return next(err);
        res.json({ user: { id: user.id, email: user.email, role: user.role } });
      });
    })(req, res, next);
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, referralCode: refCode } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      const newReferralCode = await generateUniqueReferralCode();
      const passwordHash = await bcrypt.hash(password, 10);

      let referredById: string | undefined;
      if (refCode && typeof refCode === "string" && /^[a-f0-9]{8,16}$/.test(refCode)) {
        const referrer = await storage.getUserByReferralCode(refCode);
        if (referrer && referrer.email !== email) {
          referredById = referrer.id;
        }
      }

      const user = await storage.createUser({
        email,
        passwordHash,
        role: "USER",
        referralCode: newReferralCode,
        referredById: referredById || null,
      });

      if (referredById) {
        await storage.createRaffleEntry(referredById);
      }

      req.logIn({ id: user.id, email: user.email, role: user.role }, (err) => {
        if (err) return res.status(500).json({ message: "Registration succeeded but login failed" });
        res.status(201).json({ user: { id: user.id, email: user.email, role: user.role } });
      });
    } catch (err: any) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user: req.user });
  });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}
