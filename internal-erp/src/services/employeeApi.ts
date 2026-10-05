import { type Employee } from '../data/mockData';
import { apiFetch } from './apiClient';

const API_BASE_URL =
    'http://localhost:8080/api/employees';


export interface BackendEmployee {

  id: number;

  employeeCode: string;

  name: string;

  role: string;

  department: string;

  email: string;

  phone: string;

  status:
      | 'ACTIVE'
      | 'ON_LEAVE'
      | 'INACTIVE';

  joinDate: string;

  salary: number;
}


/*
 * ---------------------------------------------------------
 * BACKEND EMPLOYEE → FRONTEND EMPLOYEE
 * ---------------------------------------------------------
 */

export function toFrontendEmployee(
    employee: BackendEmployee
): Employee & { numericId: number } {

  const statusMap: Record<
      string,
      'active' | 'on_leave' | 'inactive'
  > = {

    ACTIVE:
        'active',

    ON_LEAVE:
        'on_leave',

    INACTIVE:
        'inactive'
  };


  return {

    id:
        employee.employeeCode
        ||
        `EMP${employee.id}`,

    numericId:
    employee.id,

    name:
    employee.name,

    role:
    employee.role,

    department:
    employee.department,

    email:
    employee.email,

    phone:
    employee.phone,

    status:
        statusMap[
            employee.status
            ]
        ||
        'active',

    joinDate:
        employee.joinDate
        ||
        new Date()
            .toISOString()
            .split('T')[0],

    salary:
        employee.salary
        ||
        0
  };
}


/*
 * ---------------------------------------------------------
 * GET ALL EMPLOYEES
 * ---------------------------------------------------------
 *
 * IMPORTANT:
 *
 * apiFetch() automatically adds:
 *
 * Authorization: Bearer <token>
 *
 * Therefore the backend can identify the logged-in user
 * and apply RBAC.
 * ---------------------------------------------------------
 */

export async function fetchAllEmployees():
    Promise<
        (Employee & {
          numericId: number
        })[]
    > {

  const response =
      await apiFetch(
          API_BASE_URL
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
        `Failed to fetch employees: HTTP ${response.status}`
    );
  }


  const data:
      BackendEmployee[] =
      await response.json();


  return data.map(
      toFrontendEmployee
  );
}


/*
 * ---------------------------------------------------------
 * CREATE EMPLOYEE
 * ---------------------------------------------------------
 */

export async function createEmployee(
    employee: {
      employeeCode?: string;

      name: string;

      role: string;

      department: string;

      email: string;

      phone: string;

      status?: string;

      joinDate?: string;

      salary: number;
    }
):
    Promise<
        Employee & {
      numericId: number
    }
    > {


  const payload = {

    employeeCode:
    employee.employeeCode,

    name:
    employee.name,

    role:
    employee.role,

    department:
    employee.department,

    email:
    employee.email,

    phone:
    employee.phone,

    status:
        employee.status
            ? employee.status
                .replace(
                    '-',
                    '_'
                )
                .toUpperCase()

            : 'ACTIVE',

    joinDate:
    employee.joinDate,

    salary:
    employee.salary
  };


  const response =
      await apiFetch(
          API_BASE_URL,
          {
            method:
                'POST',

            headers: {
              'Content-Type':
                  'application/json'
            },

            body:
                JSON.stringify(
                    payload
                )
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
        `Failed to create employee: HTTP ${response.status}`
    );
  }


  const data:
      BackendEmployee =
      await response.json();


  return toFrontendEmployee(
      data
  );
}


/*
 * ---------------------------------------------------------
 * UPDATE EMPLOYEE
 * ---------------------------------------------------------
 */

export async function updateEmployee(
    numericId: number,

    employee:
    Partial<Employee>
):
    Promise<
        Employee & {
      numericId: number
    }
    > {


  const payload = {

    name:
    employee.name,

    role:
    employee.role,

    department:
    employee.department,

    email:
    employee.email,

    phone:
    employee.phone,

    status:
        employee.status
            ? employee.status
                .replace(
                    '-',
                    '_'
                )
                .toUpperCase()

            : undefined,

    joinDate:
    employee.joinDate,

    salary:
    employee.salary
  };


  const response =
      await apiFetch(
          `${API_BASE_URL}/${numericId}`,

          {
            method:
                'PUT',

            headers: {
              'Content-Type':
                  'application/json'
            },

            body:
                JSON.stringify(
                    payload
                )
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
        `Failed to update employee: HTTP ${response.status}`
    );
  }


  const data:
      BackendEmployee =
      await response.json();


  return toFrontendEmployee(
      data
  );
}


/*
 * ---------------------------------------------------------
 * UPDATE EMPLOYEE STATUS
 * ---------------------------------------------------------
 */

export async function updateEmployeeStatus(
    numericId: number,

    status:
        | 'ACTIVE'
        | 'ON_LEAVE'
        | 'INACTIVE'
):
    Promise<
        Employee & {
      numericId: number
    }
    > {


  const response =
      await apiFetch(
          `${API_BASE_URL}/${numericId}/status`,

          {
            method:
                'PATCH',

            headers: {
              'Content-Type':
                  'application/json'
            },

            body:
                JSON.stringify({
                  status
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
        `Failed to update employee status: HTTP ${response.status}`
    );
  }


  const data:
      BackendEmployee =
      await response.json();


  return toFrontendEmployee(
      data
  );
}


/*
 * ---------------------------------------------------------
 * DELETE EMPLOYEE
 * ---------------------------------------------------------
 */

export async function deleteEmployee(
    numericId: number
):
    Promise<void> {


  const response =
      await apiFetch(
          `${API_BASE_URL}/${numericId}`,

          {
            method:
                'DELETE'
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
        `Failed to delete employee: HTTP ${response.status}`
    );
  }
}