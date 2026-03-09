import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_TOKEN_SECRET is not configured.");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminToken(username) {
  return new SignJWT({ role: "admin", username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAdminToken(token) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
}
