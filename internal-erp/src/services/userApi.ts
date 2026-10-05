import {
    apiFetch
} from './apiClient';

import type {
    Role
} from '../data/mockData';

const API_BASE_URL =
    'http://localhost:8080/api';

export interface BackendUser {

    id: number;

    userCode: string;

    name: string;

    email: string;

    role: string;

    avatar: string;

    department: string;

    active: boolean;

    employee?: {

        id: number;

        employeeCode: string;

        name: string;

        role: string;

        department: string;

        email: string;

        status: string;
    };
}

export interface CreateUserRequest {

    employeeId: number;

    name: string;

    email: string;

    role: Role;

    password: string;

    department: string;
}

/*
 * =====================================================
 * GET USERS
 * =====================================================
 *
 * Authorization token is automatically attached
 * by apiFetch().
 */
export async function fetchUsers():
    Promise<BackendUser[]> {

    const response =
        await apiFetch(
            `${API_BASE_URL}/users`
        );

    if (!response.ok) {

        throw new Error(
            `Failed to fetch users: HTTP ${response.status}`
        );
    }

    return response.json();
}

/*
 * =====================================================
 * CREATE USER
 * =====================================================
 */
export async function createUser(
    request: CreateUserRequest
): Promise<BackendUser> {

    const response =
        await apiFetch(
            `${API_BASE_URL}/users`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({

                    employeeId:
                    request.employeeId,

                    name:
                    request.name,

                    email:
                    request.email,

                    /*
                     * Backend enum expects:
                     *
                     * SALES
                     * OPERATIONS
                     * etc.
                     */
                    role:
                        request.role.toUpperCase(),

                    password:
                    request.password,

                    department:
                    request.department,

                    active:
                        true
                })
            }
        );

    if (!response.ok) {

        const error =
            await response
                .json()
                .catch(
                    () => null
                );

        throw new Error(
            error?.error
            ||
            error?.message
            ||
            `Failed to create user: HTTP ${response.status}`
        );
    }

    return response.json();
}