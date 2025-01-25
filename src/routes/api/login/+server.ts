import { json } from '@sveltejs/kit';
import type { RequestEvent } from '../register/$types';
import { prisma } from '$lib/db';
import bcrypt from 'bcryptjs';
import { createJWT, type AuthPayload } from '$lib/jwt';

interface LoginRequest {
	email: string;
	password: string;
}

interface LoginResponse {
	error: 1 | 0;
	message: string;
	success: 1 | 0;
}

function isLoginRequest(data: unknown): data is LoginRequest {
	return (
		typeof data === 'object' &&
		data !== null &&
		typeof (data as LoginRequest).email === 'string' &&
		typeof (data as LoginRequest).password === 'string'
	);
}

export async function POST(event: RequestEvent) {
	const { request } = event;

	const data = await request.json();

	if (!isLoginRequest(data)) {
		const resp: LoginResponse = {
			error: 1,
			message: 'email and password fields are required!',
			success: 0
		};
		return json(resp, { status: 400 });
	}

	const user = await prisma.user.findFirst({
		where: {
			email: {
				equals: data.email,
				mode: 'insensitive'
			}
		}
	});

	if (!user) {
		const resp: LoginResponse = {
			error: 1,
			message: 'This email does not exist.',
			success: 0
		};

		return json(resp, { status: 401 });
	}

	const loginStatus = await bcrypt.compare(data.password, user.password);

	if (!loginStatus) {
		const resp: LoginResponse = {
			error: 1,
			message: 'The password is invalid.',
			success: 0
		};

		return json(resp, { status: 401 });
	}

	const payload: AuthPayload = {
		id: user.id,
		email: user.email
	};

	const jwt = await createJWT(payload);

	const resp: LoginResponse = {
		error: 0,
		message: `Login Successful`,
		success: 1
	};

	let tokenCookie = `authToken=${jwt}; HttpOnly; Path=/; Max-Age=86400;`; // Add Secure

	if (process.env.NODE_ENV === 'production') {
		tokenCookie += ' Secure';
	}

	const response = json(resp, {
		status: 200,
		headers: {
			'Set-Cookie': tokenCookie
		}
	});

	return response;
}
