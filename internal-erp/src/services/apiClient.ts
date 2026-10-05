const AUTH_TOKEN_KEY = 'fabriqs_auth_token';

/*
 * Get currently logged-in user's token.
 */
export function getAuthToken(): string | null {

    return sessionStorage.getItem(
        AUTH_TOKEN_KEY
    );
}

/*
 * Store login token.
 */
export function setAuthToken(
    token: string
): void {

    sessionStorage.setItem(
        AUTH_TOKEN_KEY,
        token
    );
}

/*
 * Remove token during logout.
 */
export function clearAuthToken(): void {

    sessionStorage.removeItem(
        AUTH_TOKEN_KEY
    );
}

/*
 * Common API request function.
 *
 * Automatically adds:
 *
 * Authorization: Bearer <token>
 */
export async function apiFetch(
    input: RequestInfo | URL,
    init: RequestInit = {}
): Promise<Response> {

    const token =
        getAuthToken();

    const headers =
        new Headers(
            init.headers
        );

    if (token) {

        headers.set(
            'Authorization',
            `Bearer ${token}`
        );
    }

    const response =
        await fetch(
            input,
            {
                ...init,
                headers
            }
        );

    /*
     * Token invalid / expired.
     */
    if (response.status === 401) {

        clearAuthToken();
    }

    return response;
}