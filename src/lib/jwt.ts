import * as jose from 'jose';
import { JWT_SECRET } from '$env/static/private';

export interface AuthPayload extends jose.JWTPayload {
	id: string;
	email: string;
}

// function isAuthPayload(obj: unknown): obj is AuthPayload {
// 	if (typeof obj !== 'object' || obj === null) {
// 		return false;
// 	}

// 	const payload = obj as AuthPayload;

// 	return (
// 		typeof payload.id === 'string' &&
// 		typeof payload.email === 'string' &&
// 		typeof payload.exp === 'number' &&
// 		typeof payload.iat === 'number'
// 	);
// }

export async function createJWT(payload: jose.JWTPayload): Promise<string> {
	const encodedSecret = new TextEncoder().encode(JWT_SECRET);

	const token = await new jose.SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('2h')
		.sign(encodedSecret);
	return token;
}
