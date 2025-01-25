import { isPrismaError, prisma } from '$lib/db';
// import { createJWT, type AuthPayload } from '$lib/jwt';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import type { RequestEvent } from './$types';
import { createJWT, type AuthPayload } from '$lib/jwt';

interface RegisterRequest {
	email: string;
	firstName: string;
	lastName: string;
	password: string;
}

interface RegisterResponse {
	error: 1 | 0;
	message: string;
	success: 1 | 0;
}

function isRegisterRequest(data: unknown): data is RegisterRequest {
	return (
		typeof data === 'object' &&
		data !== null &&
		typeof (data as RegisterRequest).email === 'string' &&
		typeof (data as RegisterRequest).firstName === 'string' &&
		typeof (data as RegisterRequest).lastName === 'string' &&
		typeof (data as RegisterRequest).password === 'string'
	);
}

export async function POST(event: RequestEvent): Promise<Response> {
	const { request } = event;
	const data = await request.json();

	if (!isRegisterRequest(data)) {
		const resp: RegisterResponse = {
			error: 0,
			message: 'email, firstName, lastName, and password fields are required!',
			success: 0
		};
		return json(resp, { status: 400 });
	}

	try {
		const hashedPw = await bcrypt.hash(data.password, 10);

		const user = await prisma.user.create({
			data: {
				email: data.email.toLowerCase(),
				firstName: data.firstName,
				lastName: data.lastName,
				password: hashedPw
			}
		});

		const resp: RegisterResponse = {
			error: 0,
			message: 'Registered Successfully!',
			success: 1
		};

		const payload: AuthPayload = {
			id: user.id,
			email: user.email
		};

		const jwt = await createJWT(payload);

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
	} catch (error) {
		if (isPrismaError(error)) {
			if (error.code == 'P2002') {
				const resp: RegisterResponse = {
					error: 1,
					message: 'That email address is already registered!',
					success: 0
				};
				return json(resp, { status: 400 });
			}
		}
		console.log(error);
		return json({
			error: 1,
			message: 'Unknown error',
			success: 0
		});
	}
}
