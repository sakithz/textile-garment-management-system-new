import type { User } from '../data/mockData';
import {
  clearAuthToken,
  setAuthToken
} from './apiClient';

const API_BASE_URL =
    'http://localhost:8080/api';


/*
 * ---------------------------------------------------------
 * BACKEND LOGIN RESPONSE
 * ---------------------------------------------------------
 */

export interface BackendLoginResponse {

  id: string;

  numericId: number;

  name: string;

  email: string;

  role: string;

  avatar: string;

  department: string;

  message: string;

  token: string;
}


/*
 * ---------------------------------------------------------
 * CONVERT BACKEND ROLE TO FRONTEND ROLE
 * ---------------------------------------------------------
 *
 * Backend:
 *
 * ADMIN
 * SALES
 * OPERATIONS
 * INVENTORY
 * PRODUCTION
 * FINANCE
 * MARKETING
 * DELIVERY
 *
 * Frontend:
 *
 * admin
 * sales
 * operations
 * inventory
 * production
 * finance
 * marketing
 * delivery
 *
 * We don't directly cast the string.
 * Instead, we validate it first.
 * ---------------------------------------------------------
 */

function normalizeRole(
    backendRole: string
): User['role'] {

  const role =
      backendRole
          .trim()
          .toLowerCase();


  switch (role) {

    case 'admin':
      return 'admin';

    case 'sales':
      return 'sales';

    case 'operations':
      return 'operations';

    case 'inventory':
      return 'inventory';

    case 'production':
      return 'production';

    case 'finance':
      return 'finance';

    case 'marketing':
      return 'marketing';

    case 'delivery':
      return 'delivery';

    default:

      throw new Error(
          `Invalid user role received from server: ${backendRole}`
      );
  }
}


/*
 * ---------------------------------------------------------
 * LOGIN
 * ---------------------------------------------------------
 */

export async function loginUser(
    email: string,
    password: string
): Promise<User> {

  /*
   * Send login request to Spring Boot backend.
   */

  const response =
      await fetch(
          `${API_BASE_URL}/auth/login`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                  'application/json'
            },

            body: JSON.stringify({

              email:
                  email.trim(),

              password
            })
          }
      );


  /*
   * -------------------------------------------------------
   * LOGIN FAILED
   * -------------------------------------------------------
   */

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
        `Authentication failed: HTTP ${response.status}`
    );
  }


  /*
   * -------------------------------------------------------
   * LOGIN SUCCESS
   * -------------------------------------------------------
   */

  const data:
      BackendLoginResponse =
      await response.json();


  /*
   * Make sure backend actually returned
   * an authentication token.
   */

  if (
      !data.token
      ||
      data.token.trim() === ''
  ) {

    throw new Error(
        'Login succeeded but the server did not return an authentication token.'
    );
  }


  /*
   * -------------------------------------------------------
   * STORE TOKEN
   * -------------------------------------------------------
   *
   * The token will be used by apiClient.ts
   * for future authenticated API requests.
   */

  setAuthToken(
      data.token
  );


  /*
   * -------------------------------------------------------
   * CONVERT USER
   * -------------------------------------------------------
   */

  const frontendRole =
      normalizeRole(
          data.role
      );


  /*
   * Return the user in the format
   * expected by the React application.
   */

  return {

    id:
    data.id,

    name:
    data.name,

    email:
    data.email,

    role:
    frontendRole,

    avatar:
    data.avatar,

    department:
    data.department
  };
}


/*
 * ---------------------------------------------------------
 * LOGOUT
 * ---------------------------------------------------------
 */

export function logoutUser(): void {

  /*
   * Remove authentication token.
   */

  clearAuthToken();
}