import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
    userId: string;
    role: string;
}

export function generateToken(
    payload: JwtPayload,
    secret: string,
    expiresIn: string,
): string {
    return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string, secret: string): JwtPayload {
    return jwt.verify(token, secret) as JwtPayload;
}
