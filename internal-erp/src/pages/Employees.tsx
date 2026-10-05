import {
  useState,
  useEffect,
  type FormEvent,
} from 'react';

import type { Employee } from '../data/mockData';

import {
  fetchAllEmployees,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
} from '../services/employeeApi';


/*
 * =========================================================
 * TYPES
 * =========================================================
 */

type EmployeeStatus =
    | 'active'
    | 'on_leave'
    | 'inactive';

type BackendEmployeeStatus =
    | 'ACTIVE'
    | 'ON_LEAVE'
    | 'INACTIVE';

type EmployeeItem = Employee & {
  numericId?: number;
};


/*
 * =========================================================
 * DEPARTMENT COLORS
 * =========================================================
 */

const DEPT_COLORS: Record<string, string> = {
  Management: 'bg-purple-100 text-purple-700',
  Sales: 'bg-blue-100 text-blue-700',
  Operations: 'bg-amber-100 text-amber-700',
  Inventory: 'bg-teal-100 text-teal-700',
  Production: 'bg-orange-100 text-orange-600',
  Finance: 'bg-green-100 text-green-700',
  Marketing: 'bg-pink-100 text-pink-700',
};


/*
 * =========================================================
 * STATUS COLORS
 * =========================================================
 */

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  on_leave: 'bg-amber-100 text-amber-700',
  inactive: 'bg-slate-100 text-slate-500',
};


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function normalizeStatus(value: unknown): EmployeeStatus {
  if (value === 'on_leave' || value === 'ON_LEAVE') {
    return 'on_leave';
  }

  if (value === 'inactive' || value === 'INACTIVE') {
    return 'inactive';
  }

  return 'active';
}


function toBackendStatus(
    status: EmployeeStatus
): BackendEmployeeStatus {
  if (status === 'on_leave') {
    return 'ON_LEAVE';
  }

  if (status === 'inactive') {
    return 'INACTIVE';
  }

  return 'ACTIVE';
}


/*
 * =========================================================
 * FORM TYPE
 * =========================================================
 */

type EmployeeForm = {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  joinDate: string;
  salary: number;
};


/*
 * =========================================================
 * INITIAL FORM
 * =========================================================
 */

function getInitialForm(): EmployeeForm {
  return {
    name: '',
    role: '',
    department: 'Production',
    email: '',
    phone: '',
    status: 'active',
    joinDate: new Date()
        .toISOString()
        .split('T')[0],
    salary: 60000,
  };
}


/*
 * =========================================================
 * EMPLOYEE MANAGEMENT
 * =========================================================
 */

export default function Employees() {

  /*
   * -------------------------------------------------------
   * EMPLOYEE DATA
   * -------------------------------------------------------
   *
   * Database is the single source of truth.
   */

  const [employees, setEmployees] =
      useState<EmployeeItem[]>([]);


  /*
   * -------------------------------------------------------
   * LOADING
   * -------------------------------------------------------
   */

  const [loading, setLoading] =
      useState(true);


  /*
   * -------------------------------------------------------
   * DATABASE STATUS
   * -------------------------------------------------------
   */

  const [isLiveDb, setIsLiveDb] =
      useState(false);


  /*
   * -------------------------------------------------------
   * SEARCH
   * -------------------------------------------------------
   */

  const [search, setSearch] =
      useState('');


  /*
   * -------------------------------------------------------
   * DEPARTMENT FILTER
   * -------------------------------------------------------
   */

  const [deptFilter, setDeptFilter] =
      useState('all');


  /*
   * -------------------------------------------------------
   * SELECTED EMPLOYEE
   * -------------------------------------------------------
   */

  const [selected, setSelected] =
      useState<EmployeeItem | null>(null);


  /*
   * -------------------------------------------------------
   * MODALS
   * -------------------------------------------------------
   */

  const [isAddModalOpen, setIsAddModalOpen] =
      useState(false);

  const [isEditModalOpen, setIsEditModalOpen] =
      useState(false);


  /*
   * -------------------------------------------------------
   * EDITING EMPLOYEE
   * -------------------------------------------------------
   */

  const [editingEmployee, setEditingEmployee] =
      useState<EmployeeItem | null>(null);


  /*
   * -------------------------------------------------------
   * SUBMITTING
   * -------------------------------------------------------
   */

  const [submitting, setSubmitting] =
      useState(false);


  /*
   * -------------------------------------------------------
   * ERROR
   * -------------------------------------------------------
   */

  const [error, setError] =
      useState<string | null>(null);


  /*
   * -------------------------------------------------------
   * FORM
   * -------------------------------------------------------
   */

  const [form, setForm] =
      useState<EmployeeForm>(getInitialForm());


  /*
   * =======================================================
   * LOAD DATA
   * =======================================================
   */

  const loadData = async () => {

    try {

      setLoading(true);
      setError(null);

      /*
       * Get employees directly from Spring Boot.
       */
      const data = await fetchAllEmployees();

      /*
       * Database is the only source.
       */
      setEmployees(data);

      setIsLiveDb(true);

    } catch (err: unknown) {

      console.error(
          'Failed to load employees from database:',
          err
      );

      /*
       * Do NOT use mock data.
       */
      setEmployees([]);

      setIsLiveDb(false);

      setError(
          err instanceof Error
              ? err.message
              : 'Failed to load employees from database.'
      );

    } finally {

      setLoading(false);
    }
  };


  /*
   * =======================================================
   * INITIAL LOAD
   * =======================================================
   */

  useEffect(() => {
    void loadData();
  }, []);


  /*
   * =======================================================
   * DEPARTMENTS
   * =======================================================
   */

  const departments =
      Array.from(
          new Set(
              employees.map(
                  employee => employee.department
              )
          )
      );


  /*
   * =======================================================
   * SEARCH + FILTER
   * =======================================================
   */

  const filtered =
      employees.filter(employee => {

        const searchText =
            search
                .toLowerCase()
                .trim();

        const matchSearch =
            searchText === '' ||
            employee.name
                .toLowerCase()
                .includes(searchText) ||
            employee.role
                .toLowerCase()
                .includes(searchText) ||
            employee.id
                .toLowerCase()
                .includes(searchText);

        const matchDepartment =
            deptFilter === 'all' ||
            employee.department === deptFilter;

        return (
            matchSearch &&
            matchDepartment
        );
      });


  /*
   * =======================================================
   * CREATE EMPLOYEE
   * =======================================================
   */

  const handleCreate = async (
      event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    try {

      setSubmitting(true);
      setError(null);

      /*
       * Validation
       */

      if (
          !form.name.trim() ||
          !form.role.trim() ||
          !form.email.trim() ||
          !form.phone.trim()
      ) {

        setError(
            'Please fill in all required fields.'
        );

        return;
      }


      /*
       * Create employee in MySQL.
       */

      await createEmployee({
        name: form.name.trim(),
        role: form.role.trim(),
        department: form.department,
        email: form.email.trim(),
        phone: form.phone.trim(),
        status: form.status,
        joinDate: form.joinDate,
        salary: Number(form.salary),
      });


      /*
       * Close modal.
       */

      setIsAddModalOpen(false);


      /*
       * Reset form.
       */

      setForm(
          getInitialForm()
      );


      /*
       * Reload from DB.
       */

      await loadData();

    } catch (err: unknown) {

      console.error(
          'Failed to create employee:',
          err
      );

      setError(
          err instanceof Error
              ? err.message
              : 'Failed to create employee.'
      );

    } finally {

      setSubmitting(false);
    }
  };


  /*
   * =======================================================
   * START EDIT
   * =======================================================
   */

  const handleStartEdit = (
      employee: EmployeeItem
  ) => {

    setEditingEmployee(employee);

    setForm({
      name: employee.name,
      role: employee.role,
      department: employee.department,
      email: employee.email,
      phone: employee.phone,
      status: normalizeStatus(
          employee.status
      ),
      joinDate: employee.joinDate,
      salary: Number(
          employee.salary || 0
      ),
    });

    setError(null);

    setIsEditModalOpen(true);
  };


  /*
   * =======================================================
   * UPDATE EMPLOYEE
   * =======================================================
   */

  const handleUpdate = async (
      event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    if (!editingEmployee) {
      return;
    }

    try {

      setSubmitting(true);
      setError(null);

      if (
          editingEmployee.numericId === undefined
      ) {

        throw new Error(
            'This employee does not have a valid database ID.'
        );
      }


      /*
       * Update MySQL record.
       */

      await updateEmployee(
          editingEmployee.numericId,
          {
            name: form.name.trim(),
            role: form.role.trim(),
            department: form.department,
            email: form.email.trim(),
            phone: form.phone.trim(),
            status: form.status,
            joinDate: form.joinDate,
            salary: Number(form.salary),
          }
      );


      /*
       * Close modal.
       */

      setIsEditModalOpen(false);

      setEditingEmployee(null);


      /*
       * Reload database.
       */

      await loadData();


      /*
       * Keep selected employee updated.
       */

      setSelected(
          currentSelected => {

            if (
                !currentSelected ||
                currentSelected.id !==
                editingEmployee.id
            ) {
              return currentSelected;
            }

            return {
              ...currentSelected,
              ...form,
              salary: Number(form.salary),
              status: form.status,
              numericId:
              editingEmployee.numericId,
            };
          }
      );

    } catch (err: unknown) {

      console.error(
          'Failed to update employee:',
          err
      );

      setError(
          err instanceof Error
              ? err.message
              : 'Failed to update employee.'
      );

    } finally {

      setSubmitting(false);
    }
  };


  /*
   * =======================================================
   * CHANGE STATUS
   * =======================================================
   */

  const handleStatusChange = async (
      employee: EmployeeItem,
      newStatus: EmployeeStatus
  ) => {

    if (
        employee.numericId === undefined
    ) {

      setError(
          'This employee does not have a valid database ID.'
      );

      return;
    }

    try {

      setError(null);

      /*
       * Convert frontend status:
       *
       * active
       * on_leave
       * inactive
       *
       * into backend enum:
       *
       * ACTIVE
       * ON_LEAVE
       * INACTIVE
       */

      const dbStatus =
          toBackendStatus(
              newStatus
          );


      await updateEmployeeStatus(
          employee.numericId,
          dbStatus
      );


      /*
       * Reload from database.
       */

      await loadData();


      /*
       * Update selected employee.
       */

      setSelected(
          currentSelected => {

            if (
                !currentSelected ||
                currentSelected.id !==
                employee.id
            ) {

              return currentSelected;
            }

            return {
              ...currentSelected,
              status: newStatus,
            };
          }
      );

    } catch (err: unknown) {

      console.error(
          'Failed to change employee status:',
          err
      );

      setError(
          err instanceof Error
              ? err.message
              : 'Failed to change employee status.'
      );
    }
  };


  /*
   * =======================================================
   * DELETE EMPLOYEE
   * =======================================================
   */

  const handleDelete = async (
      employee: EmployeeItem
  ) => {

    if (
        employee.numericId === undefined
    ) {

      setError(
          'This employee does not have a valid database ID.'
      );

      return;
    }


    const confirmed =
        window.confirm(
            `Are you sure you want to remove employee ${employee.name}?`
        );


    if (!confirmed) {
      return;
    }


    try {

      setError(null);

      await deleteEmployee(
          employee.numericId
      );


      /*
       * Close selected employee.
       */

      setSelected(
          currentSelected => {

            if (
                currentSelected?.id ===
                employee.id
            ) {

              return null;
            }

            return currentSelected;
          }
      );


      /*
       * Reload database.
       */

      await loadData();

    } catch (err: unknown) {

      console.error(
          'Failed to delete employee:',
          err
      );

      setError(
          err instanceof Error
              ? err.message
              : 'Failed to delete employee.'
      );
    }
  };


  /*
   * =======================================================
   * SELECTED EMPLOYEE DETAILS
   * =======================================================
   */

  if (selected) {

    const selectedStatus =
        normalizeStatus(
            selected.status
        );

    return (

        <div className="space-y-5">

          {/* Breadcrumb */}

          <div className="flex items-center gap-2 text-sm text-[#94a3b8]">

            <button
                onClick={() =>
                    setSelected(null)
                }
                className="hover:text-blue-600 transition-colors"
            >
              Employees
            </button>

            <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
              />
            </svg>

            <span className="text-[#334155] font-medium">
            {selected.name}
          </span>

          </div>


          {/* Error */}

          {error && (

              <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>

          )}


          {/* Employee summary */}

          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">

            <div className="flex items-start gap-5">

              {/* Avatar */}

              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white text-xl font-bold flex items-center justify-center font-display">

                {selected.name
                    .split(' ')
                    .map(name => name[0])
                    .join('')}

              </div>


              <div className="flex-1">

                <div className="flex items-start justify-between gap-4 flex-wrap">

                  <div>

                    <h1 className="text-xl font-bold font-display text-[#0f172a]">
                      {selected.name}
                    </h1>

                    <p className="text-[#64748b] text-sm">
                      {selected.role}
                      {' · '}
                      {selected.department}
                    </p>

                  </div>


                  <div className="flex gap-2 items-center">

                  <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          STATUS_COLOR[selectedStatus]
                      }`}
                  >
                    {selectedStatus.replace(
                        '_',
                        ' '
                    )}
                  </span>

                    <button
                        onClick={() =>
                            handleStartEdit(selected)
                        }
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>

                    <button
                        onClick={() =>
                            void handleDelete(selected)
                        }
                        className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      Delete
                    </button>

                  </div>

                </div>


                {/* Summary cards */}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">

                  <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0]">
                    <div className="text-xs text-[#94a3b8]">
                      Employee ID
                    </div>
                    <div className="text-sm font-bold text-[#0f172a] mt-0.5">
                      {selected.id}
                    </div>
                  </div>


                  <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0]">
                    <div className="text-xs text-[#94a3b8]">
                      Department
                    </div>
                    <div className="text-sm font-bold text-[#0f172a] mt-0.5">
                      {selected.department}
                    </div>
                  </div>


                  <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0]">
                    <div className="text-xs text-[#94a3b8]">
                      Join Date
                    </div>
                    <div className="text-sm font-bold text-[#0f172a] mt-0.5">
                      {selected.joinDate}
                    </div>
                  </div>


                  <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0]">
                    <div className="text-xs text-[#94a3b8]">
                      Salary
                    </div>
                    <div className="text-sm font-bold text-[#0f172a] mt-0.5">
                      LKR {Number(
                        selected.salary || 0
                    ).toLocaleString('en-IN')}
                      /mo
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* Contact + Status */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Contact */}

            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">

              <h3 className="font-semibold font-display text-[#0f172a] mb-4">
                Contact Details
              </h3>

              <div className="space-y-3 text-sm">

                <div className="flex items-center gap-3">

                  <svg
                      className="w-4 h-4 text-[#94a3b8]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"
                    />
                  </svg>

                  <span className="text-[#334155]">
                  {selected.email}
                </span>

                </div>


                <div className="flex items-center gap-3">

                  <svg
                      className="w-4 h-4 text-[#94a3b8]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 011.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>

                  <span className="text-[#334155]">
                  {selected.phone}
                </span>

                </div>

              </div>

            </div>


            {/* Status */}

            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">

              <h3 className="font-semibold font-display text-[#0f172a] mb-4">
                Quick Status Updates
              </h3>

              <div className="space-y-2">

                <button
                    onClick={() =>
                        void handleStatusChange(
                            selected,
                            'active'
                        )
                    }
                    className={`w-full text-left px-4 py-2.5 text-sm rounded-lg border flex items-center justify-between transition-colors ${
                        selectedStatus === 'active'
                            ? 'bg-green-50 border-green-200 text-green-700 font-semibold'
                            : 'text-[#334155] hover:bg-[#f8fafc] border-[#f1f5f9]'
                    }`}
                >
                  <span>Set as Active</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </button>


                <button
                    onClick={() =>
                        void handleStatusChange(
                            selected,
                            'on_leave'
                        )
                    }
                    className={`w-full text-left px-4 py-2.5 text-sm rounded-lg border flex items-center justify-between transition-colors ${
                        selectedStatus === 'on_leave'
                            ? 'bg-amber-50 border-amber-200 text-amber-700 font-semibold'
                            : 'text-[#334155] hover:bg-[#f8fafc] border-[#f1f5f9]'
                    }`}
                >
                  <span>Set as On Leave</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                </button>


                <button
                    onClick={() =>
                        void handleStatusChange(
                            selected,
                            'inactive'
                        )
                    }
                    className={`w-full text-left px-4 py-2.5 text-sm rounded-lg border flex items-center justify-between transition-colors ${
                        selectedStatus === 'inactive'
                            ? 'bg-slate-100 border-slate-300 text-slate-700 font-semibold'
                            : 'text-[#334155] hover:bg-[#f8fafc] border-[#f1f5f9]'
                    }`}
                >
                  <span>Set as Inactive</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                </button>

              </div>

            </div>

          </div>

        </div>
    );
  }


  /*
   * =======================================================
   * MAIN EMPLOYEE LIST
   * =======================================================
   */

  return (

      <div className="space-y-5">

        {/* =================================================
          HEADER
          ================================================= */}

        <div className="flex items-center justify-between gap-4 flex-wrap">

          <div>

            <h1 className="text-2xl font-bold font-display text-[#0f172a]">
              Employee Management
            </h1>

            <div className="flex items-center gap-2 mt-0.5">

              <p className="text-sm text-[#64748b]">
                {filtered.length}{' '}
                {filtered.length === 1
                    ? 'employee'
                    : 'employees'}
              </p>


              {isLiveDb ? (

                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Live MySQL DB
              </span>

              ) : (

                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                ● Database unavailable
              </span>

              )}

            </div>

          </div>


          <button
              onClick={() => {
                setError(null);
                setForm(getInitialForm());
                setIsAddModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >

            <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
              />
            </svg>

            Add Employee

          </button>

        </div>


        {/* =================================================
          ERROR
          ================================================= */}

        {error && (

            <div className="flex items-start gap-3 p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">

              <div className="flex-1">

                <p className="font-semibold">
                  Unable to load employee data
                </p>

                <p className="mt-1">
                  {error}
                </p>

              </div>

              <button
                  onClick={() =>
                      void loadData()
                  }
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-red-200 rounded-lg hover:bg-red-100"
              >
                Retry
              </button>

            </div>

        )}


        {/* =================================================
          SEARCH + FILTER
          ================================================= */}

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 flex gap-3 flex-wrap">

          <div className="flex-1 min-w-52 relative">

            <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
                value={search}
                onChange={event =>
                    setSearch(event.target.value)
                }
                placeholder="Search name, role, or ID..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-[#f8fafc]"
            />

          </div>


          <select
              value={deptFilter}
              onChange={event =>
                  setDeptFilter(
                      event.target.value
                  )
              }
              className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none bg-[#f8fafc] text-[#334155]"
          >

            <option value="all">
              All Departments
            </option>

            {departments.map(
                department => (

                    <option
                        key={department}
                        value={department}
                    >
                      {department}
                    </option>

                )
            )}

          </select>

        </div>


        {/* =================================================
          CONTENT
          ================================================= */}

        {loading ? (

            <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center text-slate-500">

              <div className="flex flex-col items-center gap-3">

                <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />

                <p>
                  Loading employees from database...
                </p>

              </div>

            </div>

        ) : filtered.length === 0 ? (

            <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center">

              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">

                <svg
                    className="w-6 h-6 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>

              </div>

              <h3 className="text-base font-semibold text-slate-800">
                No employees found
              </h3>

              <p className="text-sm text-slate-500 mt-1">

                {employees.length === 0
                    ? 'There are no employees stored in the database.'
                    : 'Try changing your search or department filter.'}

              </p>

              {employees.length === 0 && (

                  <button
                      onClick={() => {
                        setError(null);
                        setForm(getInitialForm());
                        setIsAddModalOpen(true);
                      }}
                      className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Add First Employee
                  </button>

              )}

            </div>

        ) : (

            <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>

                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">

                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                      Employee
                    </th>

                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                      Role
                    </th>

                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                      Department
                    </th>

                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden md:table-cell">
                      Contact
                    </th>

                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">
                      Joined
                    </th>

                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                      Status
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider text-right">
                      Actions
                    </th>

                  </tr>

                  </thead>


                  <tbody>

                  {filtered.map(employee => {

                    const employeeStatus =
                        normalizeStatus(
                            employee.status
                        );

                    return (

                        <tr
                            key={
                                employee.numericId ??
                                employee.id
                            }
                            className="border-t border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors cursor-pointer"
                            onClick={() =>
                                setSelected(employee)
                            }
                        >

                          {/* Employee */}

                          <td className="px-5 py-3.5">

                            <div className="flex items-center gap-3">

                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center font-display">

                                {employee.name
                                    .split(' ')
                                    .map(
                                        name => name[0]
                                    )
                                    .join('')}

                              </div>

                              <div>

                                <p className="font-medium text-[#334155]">
                                  {employee.name}
                                </p>

                                <p className="text-xs text-[#94a3b8]">
                                  {employee.id}
                                </p>

                              </div>

                            </div>

                          </td>


                          {/* Role */}

                          <td className="px-4 py-3.5 text-[#64748b] text-sm">
                            {employee.role}
                          </td>


                          {/* Department */}

                          <td className="px-4 py-3.5">

                        <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                DEPT_COLORS[
                                    employee.department
                                    ] ??
                                'bg-slate-100 text-slate-600'
                            }`}
                        >
                          {employee.department}
                        </span>

                          </td>


                          {/* Contact */}

                          <td className="px-4 py-3.5 text-[#64748b] text-xs hidden md:table-cell">
                            {employee.phone}
                          </td>


                          {/* Joined */}

                          <td className="px-4 py-3.5 text-[#94a3b8] text-xs hidden lg:table-cell">
                            {employee.joinDate}
                          </td>


                          {/* Status */}

                          <td className="px-4 py-3.5">

                        <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                STATUS_COLOR[
                                    employeeStatus
                                    ] ??
                                'bg-slate-100 text-slate-600'
                            }`}
                        >
                          {employeeStatus.replace(
                              '_',
                              ' '
                          )}
                        </span>

                          </td>


                          {/* Actions */}

                          <td className="px-5 py-3.5 text-right">

                            <div
                                className="flex items-center justify-end gap-1"
                                onClick={event =>
                                    event.stopPropagation()
                                }
                            >

                              {/* View */}

                              <button
                                  onClick={() =>
                                      setSelected(employee)
                                  }
                                  title="View Details"
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f1f5f9] text-[#64748b]"
                              >

                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>

                              </button>


                              {/* Edit */}

                              <button
                                  onClick={() =>
                                      handleStartEdit(
                                          employee
                                      )
                                  }
                                  title="Edit Employee"
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f1f5f9] text-blue-600"
                              >

                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>

                              </button>


                              {/* Delete */}

                              <button
                                  onClick={() =>
                                      void handleDelete(
                                          employee
                                      )
                                  }
                                  title="Delete Employee"
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-rose-500"
                              >

                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>

                              </button>

                            </div>

                          </td>

                        </tr>

                    );
                  })}

                  </tbody>

                </table>

              </div>

            </div>

        )}


        {/* =================================================
          ADD EMPLOYEE MODAL
          ================================================= */}

        {isAddModalOpen && (

            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-center mb-5">

                  <h2 className="text-xl font-bold font-display text-slate-900">
                    Add New Employee
                  </h2>

                  <button
                      type="button"
                      onClick={() =>
                          setIsAddModalOpen(false)
                      }
                      className="text-slate-400 hover:text-slate-600"
                  >

                    <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>

                  </button>

                </div>


                {error && (

                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                      {error}
                    </div>

                )}


                <form
                    onSubmit={handleCreate}
                    className="space-y-4"
                >

                  {/* Name + Role */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name *
                      </label>

                      <input
                          required
                          value={form.name}
                          onChange={event =>
                              setForm({
                                ...form,
                                name:
                                event.target.value,
                              })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                          placeholder="e.g. Sunil Perera"
                      />

                    </div>


                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Job Role *
                      </label>

                      <input
                          required
                          value={form.role}
                          onChange={event =>
                              setForm({
                                ...form,
                                role:
                                event.target.value,
                              })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                          placeholder="e.g. Production Specialist"
                      />

                    </div>

                  </div>


                  {/* Department + Status */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Department
                      </label>

                      <select
                          value={form.department}
                          onChange={event =>
                              setForm({
                                ...form,
                                department:
                                event.target.value,
                              })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      >

                        <option value="Production">
                          Production
                        </option>

                        <option value="Inventory">
                          Inventory
                        </option>

                        <option value="Operations">
                          Operations
                        </option>

                        <option value="Sales">
                          Sales
                        </option>

                        <option value="Finance">
                          Finance
                        </option>

                        <option value="Marketing">
                          Marketing
                        </option>

                        <option value="Management">
                          Management
                        </option>

                      </select>

                    </div>


                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Status
                      </label>

                      <select
                          value={form.status}
                          onChange={event => {

                            const value =
                                event.target.value;

                            const status: EmployeeStatus =
                                value === 'on_leave'
                                    ? 'on_leave'
                                    : value === 'inactive'
                                        ? 'inactive'
                                        : 'active';

                            setForm({
                              ...form,
                              status,
                            });
                          }}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      >

                        <option value="active">
                          Active
                        </option>

                        <option value="on_leave">
                          On Leave
                        </option>

                        <option value="inactive">
                          Inactive
                        </option>

                      </select>

                    </div>

                  </div>


                  {/* Email + Phone */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email *
                      </label>

                      <input
                          required
                          type="email"
                          value={form.email}
                          onChange={event =>
                              setForm({
                                ...form,
                                email:
                                event.target.value,
                              })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                          placeholder="employee@fabriqs.com"
                      />

                    </div>


                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number *
                      </label>

                      <input
                          required
                          value={form.phone}
                          onChange={event =>
                              setForm({
                                ...form,
                                phone:
                                event.target.value,
                              })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                          placeholder="+94 77 123 4567"
                      />

                    </div>

                  </div>


                  {/* Salary + Join Date */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Monthly Salary
                      </label>

                      <input
                          type="number"
                          required
                          min={0}
                          value={form.salary}
                          onChange={event =>
                              setForm({
                                ...form,
                                salary:
                                    Number(
                                        event.target.value
                                    ),
                              })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />

                    </div>


                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Join Date
                      </label>

                      <input
                          type="date"
                          value={form.joinDate}
                          onChange={event =>
                              setForm({
                                ...form,
                                joinDate:
                                event.target.value,
                              })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />

                    </div>

                  </div>


                  {/* Buttons */}

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">

                    <button
                        type="button"
                        onClick={() =>
                            setIsAddModalOpen(false)
                        }
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                    >
                      {submitting
                          ? 'Saving...'
                          : 'Add Employee'}
                    </button>

                  </div>

                </form>

              </div>

            </div>

        )}


        {/* =================================================
          EDIT EMPLOYEE MODAL
          ================================================= */}

        {isEditModalOpen && (

            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-center mb-5">

                  <h2 className="text-xl font-bold font-display text-slate-900">
                    Edit Employee
                  </h2>

                  <button
                      type="button"
                      onClick={() =>
                          setIsEditModalOpen(false)
                      }
                      className="text-slate-400 hover:text-slate-600"
                  >

                    <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>

                  </button>

                </div>


                {error && (

                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                      {error}
                    </div>

                )}


                <form
                    onSubmit={handleUpdate}
                    className="space-y-4"
                >

                  {/* Name + Role */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>

                      <input
                          required
                          value={form.name}
                          onChange={event =>
                              setForm({
                                ...form,
                                name:
                                event.target.value,
                              })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />

                    </div>


                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Job Role
                      </label>

                      <input
                          required
                          value={form.role}
                          onChange={event =>
                              setForm({
                                ...form,
                                role:
                                event.target.value,
                              })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />

                    </div>

                  </div>


                  {/* Department + Status */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Department
                      </label>

                      <select
                          value={form.department}
                          onChange={event =>
                              setForm({
                                ...form,
                                department:
                                event.target.value,
                              })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      >

                        <option value="Production">
                          Production
                        </option>

                        <option value="Inventory">
                          Inventory
                        </option>

                        <option value="Operations">
                          Operations
                        </option>

                        <option value="Sales">
                          Sales
                        </option>

                        <option value="Finance">
                          Finance
                        </option>

                        <option value="Marketing">
                          Marketing
                        </option>

                        <option value="Management">
                          Management
                        </option>

                      </select>

                    </div>


                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Status
                      </label>

                      <select
                          value={form.status}
                          onChange={event => {

                            const value =
                                event.target.value;

                            const status: EmployeeStatus =
                                value === 'on_leave'
                                    ? 'on_leave'
                                    : value === 'inactive'
                                        ? 'inactive'
                                        : 'active';

                            setForm({
                              ...form,
                              status,
                            });
                          }}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      >

                        <option value="active">
                          Active
                        </option>

                        <option value="on_leave">
                          On Leave
                        </option>

                        <option value="inactive">
                          Inactive
                        </option>

                      </select>

                    </div>

                  </div>


                  {/* Email + Phone */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email
                      </label>

                      <input
                          required
                          type="email"
                          value={form.email}
                          onChange={event =>
                              setForm({
                                ...form,
                                email:
                                event.target.value,
                              })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />

                    </div>


                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number
                      </label>

                      <input
                          required
                          value={form.phone}
                          onChange={event =>
                              setForm({
                                ...form,
                                phone:
                                event.target.value,
                              })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />

                    </div>

                  </div>


                  {/* Salary + Join Date */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Monthly Salary
                      </label>

                      <input
                          type="number"
                          required
                          min={0}
                          value={form.salary}
                          onChange={event =>
                              setForm({
                                ...form,
                                salary:
                                    Number(
                                        event.target.value
                                    ),
                              })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />

                    </div>


                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Join Date
                      </label>

                      <input
                          type="date"
                          value={form.joinDate}
                          onChange={event =>
                              setForm({
                                ...form,
                                joinDate:
                                event.target.value,
                              })
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />

                    </div>

                  </div>


                  {/* Buttons */}

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">

                    <button
                        type="button"
                        onClick={() =>
                            setIsEditModalOpen(false)
                        }
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                    >
                      {submitting
                          ? 'Updating...'
                          : 'Save Changes'}
                    </button>

                  </div>

                </form>

              </div>

            </div>

        )}

      </div>
  );
}