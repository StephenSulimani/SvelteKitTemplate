import { prisma } from '$lib/db';
import { verifyJWT } from '$lib/jwt';
import { json, type RequestEvent } from '@sveltejs/kit';

interface MeResponse {
	error: 1 | 0;
	message: string | object;
	success: 1 | 0;
}

export async function GET(event: RequestEvent) {
	const { cookies } = event;

	const authCookie = cookies.get('authToken');

	if (!authCookie) {
		// AuthCookie Empty
		const resp: MeResponse = {
			error: 0,
			message: 'AuthToken missing!',
			success: 0
		};
		return json(resp, { status: 400 });
	}
	
	const verification = await verifyJWT(authCookie);

	if (!verification) {
		// Invalid JWT
		const resp: MeResponse = {
			error: 0,
			message: 'AuthToken is invalid!',
			success: 0
		};
		return json(resp, { status: 400 });
	}

	const user = await prisma.user.findFirst({
		where: {
			id: {
				equals: verification.id,
				mode: 'insensitive'
			}
		}
	});

	if (!user) {
        // User cannot be located in the database
		const resp: MeResponse = {
			error: 1,
			message: 'AuthToken is invalid!',
			success: 0
		};
		return json(resp, { status: 400 });
	}

    const resp: MeResponse = {
        error: 0,
        message: {
            id: user.id,
            email: user.email,
        },
        success: 1
    }

    return json(resp, { status: 200 })
}
