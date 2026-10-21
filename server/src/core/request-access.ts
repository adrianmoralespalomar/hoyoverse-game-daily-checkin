import { createHmac, timingSafeEqual } from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import { AUTH_SESSION } from '../models/auth-session.const.ts';
import { ENV_VARIABLES } from '../models/env-variables.const.ts';

/** Sin contraseña en el `.env`, el panel es abierto. Con ella, solo los navegadores donde se puso (se recuerda un año). */
export function hasAccess(request: FastifyRequest): boolean {
  return !isAuthRequired() || hasValidSessionCookie(request);
}

export function isAuthRequired(): boolean {
  return !!getWebPassword();
}

function getWebPassword(): string | null {
  return process.env[ENV_VARIABLES.webPassword] || null;
}

/** La cookie es `<caducidad>.<firma>`: firmada con la contraseña, así que al cambiarla se cierran todas las sesiones. */
function hasValidSessionCookie({ headers }: FastifyRequest): boolean {
  const sessionCookie = headers.cookie?.split(/;\s*/).find(cookie => cookie.startsWith(`${AUTH_SESSION.cookieName}=`))?.split('=')[1];
  const [expiresAt, signature] = sessionCookie?.split('.') ?? [];
  return !!signature && Number(expiresAt) > Date.now() && isSameText(signature, sign(expiresAt));
}

/** Compara sin dar pistas por el tiempo que tarda (si no, se podría adivinar letra a letra). */
function isSameText(text: string, expectedText: string): boolean {
  const [textBytes, expectedBytes] = [Buffer.from(text), Buffer.from(expectedText)];
  return textBytes.length === expectedBytes.length && timingSafeEqual(textBytes, expectedBytes);
}

function sign(value: string): string {
  return createHmac('sha256', getWebPassword() ?? '').update(value).digest('base64url');
}

export function isCorrectWebPassword(password: string): boolean {
  const webPassword = getWebPassword();
  return !!webPassword && isSameText(password, webPassword);
}

/** Cabecera `Set-Cookie` de una sesión nueva. Sin `Secure`: en casa se entra por http. */
export function createSessionCookie(): string {
  const expiresAt = String(Date.now() + AUTH_SESSION.maxAgeSeconds * 1000);
  return `${AUTH_SESSION.cookieName}=${expiresAt}.${sign(expiresAt)}; Max-Age=${AUTH_SESSION.maxAgeSeconds}; Path=/; HttpOnly; SameSite=Strict`;
}
