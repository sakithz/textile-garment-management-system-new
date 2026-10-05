import {
    useEffect,
    useMemo,
    useState
} from 'react';

import type {
    Role,
    User
} from '../data/mockData';

import {
    fetchAllEmployees
} from '../services/employeeApi';

import {
    createUser,
    fetchUsers,
    type BackendUser
} from '../services/userApi';

interface UsersProps {
    user: User;
}

const ROLE_OPTIONS: {
    value: Exclude<Role, 'admin'>;
    label: string;
}[] = [

    {
        value: 'sales',
        label: 'Sales Executive'
    },

    {
        value: 'operations',
        label: 'Operations Manager'
    },

    {
        value: 'inventory',
        label: 'Inventory Officer'
    },

    {
        value: 'production',
        label: 'Production Supervisor'
    },

    {
        value: 'finance',
        label: 'Finance Officer'
    },

    {
        value: 'marketing',
        label: 'Marketing Executive'
    },

    {
        value: 'delivery',
        label: 'Delivery Officer'
    }
];

const ROLE_LABELS: Record<string, string> = {

    ADMIN: 'Administrator',

    SALES: 'Sales Executive',

    OPERATIONS: 'Operations Manager',

    INVENTORY: 'Inventory Officer',

    PRODUCTION: 'Production Supervisor',

    FINANCE: 'Finance Officer',

    MARKETING: 'Marketing Executive',

    DELIVERY: 'Delivery Officer'
};

export default function Users({
                                  user
                              }: UsersProps) {

    const [
        users,
        setUsers
    ] = useState<BackendUser[]>([]);

    const [
        employees,
        setEmployees
    ] = useState<
        Awaited<ReturnType<typeof fetchAllEmployees>>
    >([]);

    const [
        employeeId,
        setEmployeeId
    ] = useState('');

    const [
        role,
        setRole
    ] = useState<
        Exclude<Role, 'admin'> | ''
    >('');

    const [
        password,
        setPassword
    ] = useState('');

    const [
        showPassword,
        setShowPassword
    ] = useState(false);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        saving,
        setSaving
    ] = useState(false);

    const [
        error,
        setError
    ] = useState('');

    const [
        success,
        setSuccess
    ] = useState('');

    const loadData = async () => {

        setLoading(true);
        setError('');

        try {

            const [
                userData,
                employeeData
            ] = await Promise.all([

                fetchUsers(),

                fetchAllEmployees()

            ]);

            setUsers(userData);
            setEmployees(employeeData);

        } catch (err: unknown) {

            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load user management data.'
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        if (user.role === 'admin') {
            loadData();
        } else {
            setLoading(false);
        }

    }, [user.role]);

    /*
     * Employee IDs that already have accounts.
     */
    const assignedEmployeeIds = useMemo(

        () => new Set(

            users
                .map(
                    u => u.employee?.id
                )
                .filter(
                    (
                        id
                    ): id is number =>
                        typeof id === 'number'
                )
        ),

        [users]

    );

    /*
     * Only active employees without accounts
     * can be selected.
     */
    const availableEmployees =
        employees.filter(

            employee =>
                employee.status === 'active' &&
                !assignedEmployeeIds.has(
                    employee.numericId
                )

        );

    const selectedEmployee =
        employees.find(

            employee =>
                String(employee.numericId) === employeeId

        );

    const handleCreate = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        setError('');
        setSuccess('');

        if (!employeeId) {

            setError(
                'Please select an employee.'
            );

            return;
        }

        if (!role) {

            setError(
                'Please select a stakeholder role.'
            );

            return;
        }

        if (password.length < 4) {

            setError(
                'Password must contain at least 4 characters.'
            );

            return;
        }

        if (!selectedEmployee) {

            setError(
                'Selected employee could not be found.'
            );

            return;
        }

        setSaving(true);

        try {

            await createUser({

                employeeId:
                selectedEmployee.numericId,

                name:
                selectedEmployee.name,

                email:
                selectedEmployee.email,

                role,

                password,

                department:
                selectedEmployee.department

            });

            setEmployeeId('');
            setRole('');
            setPassword('');

            setSuccess(
                'User account created successfully.'
            );

            const refreshedUsers =
                await fetchUsers();

            setUsers(refreshedUsers);

        } catch (err: unknown) {

            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create user account.'
            );

        } finally {

            setSaving(false);

        }
    };

    /*
     * Admin only
     */
    if (user.role !== 'admin') {

        return (

            <div className="bg-white rounded-xl border border-[#e2e8f0] p-8">

                <h1 className="text-xl font-bold font-display text-[#0f172a]">
                    Access denied
                </h1>

                <p className="text-sm text-[#64748b] mt-2">
                    Only the administrator can manage user accounts.
                </p>

            </div>

        );
    }

    return (

        <div className="space-y-6">

            {/* Page heading */}
            <div>

                <h1 className="text-2xl font-bold font-display text-[#0f172a]">
                    User Management
                </h1>

                <p className="text-sm text-[#64748b] mt-1">
                    Create employee accounts and assign role-based access.
                </p>

            </div>

            {/* Error */}
            {error && (

                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                    {error}
                </div>

            )}

            {/* Success */}
            {success && (

                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                    {success}
                </div>

            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Registered users */}
                <div className="xl:col-span-2 bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">

                    <div className="px-5 py-4 border-b border-[#e2e8f0]">

                        <h2 className="font-semibold font-display text-[#0f172a]">
                            Registered Users
                        </h2>

                        <p className="text-xs text-[#94a3b8] mt-1">
                            Employee accounts currently assigned to the system.
                        </p>

                    </div>

                    {loading ? (

                        <div className="p-8 text-sm text-[#64748b]">
                            Loading users...
                        </div>

                    ) : users.length === 0 ? (

                        <div className="p-8 text-sm text-[#64748b]">
                            No user accounts found.
                        </div>

                    ) : (

                        <div className="divide-y divide-[#f1f5f9]">

                            {users.map(account => (

                                <div
                                    key={account.id}
                                    className="px-5 py-4 flex items-center gap-4"
                                >

                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                                        {account.avatar}
                                    </div>

                                    <div className="min-w-0 flex-1">

                                        <div className="font-semibold text-sm text-[#0f172a]">
                                            {account.name}
                                        </div>

                                        <div className="text-xs text-[#64748b] mt-0.5">
                                            {account.email}
                                        </div>

                                        {account.employee && (

                                            <div className="text-[11px] text-[#94a3b8] mt-1">
                                                Employee: {account.employee.employeeCode}
                                            </div>

                                        )}

                                    </div>

                                    <div className="text-right">

                                        <div className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                                            {ROLE_LABELS[account.role] ||
                                                account.role}
                                        </div>

                                        <div
                                            className={`text-[11px] mt-1 ${
                                                account.active
                                                    ? 'text-green-600'
                                                    : 'text-red-500'
                                            }`}
                                        >
                                            {account.active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

                {/* Create user */}
                <form
                    onSubmit={handleCreate}
                    className="bg-white rounded-xl border border-[#e2e8f0] p-5 h-fit"
                >

                    <div className="mb-5">

                        <h2 className="font-semibold font-display text-[#0f172a]">
                            Create Employee Account
                        </h2>

                        <p className="text-xs text-[#94a3b8] mt-1">
                            Select an existing employee and assign a stakeholder role.
                        </p>

                    </div>

                    <div className="space-y-4">

                        {/* Employee */}
                        <div>

                            <label className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">
                                Employee
                            </label>

                            <select
                                value={employeeId}
                                onChange={
                                    e =>
                                        setEmployeeId(
                                            e.target.value
                                        )
                                }
                                className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                            >

                                <option value="">
                                    Select an employee
                                </option>

                                {availableEmployees.map(
                                    employee => (

                                        <option
                                            key={employee.numericId}
                                            value={employee.numericId}
                                        >
                                            {employee.name} — {employee.id}
                                        </option>

                                    )
                                )}

                            </select>

                            {availableEmployees.length === 0 && (

                                <p className="text-xs text-amber-600 mt-1.5">
                                    No active employees are currently available for a new account.
                                </p>

                            )}

                        </div>

                        {/* Employee preview */}
                        {selectedEmployee && (

                            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3 text-xs">

                                <div className="font-semibold text-[#334155]">
                                    {selectedEmployee.name}
                                </div>

                                <div className="text-[#64748b] mt-1">
                                    {selectedEmployee.email}
                                </div>

                                <div className="text-[#64748b]">
                                    {selectedEmployee.department}
                                </div>

                            </div>

                        )}

                        {/* Role */}
                        <div>

                            <label className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">
                                Stakeholder Role
                            </label>

                            <select
                                value={role}
                                onChange={
                                    e =>
                                        setRole(
                                            e.target.value as
                                                | Exclude<Role, 'admin'>
                                                | ''
                                        )
                                }
                                className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                            >

                                <option value="">
                                    Select a role
                                </option>

                                {ROLE_OPTIONS.map(
                                    option => (

                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                        {/* Password */}
                        <div>

                            <label className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">
                                Login Password
                            </label>

                            <div className="relative">

                                <input
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={password}
                                    onChange={
                                        e =>
                                            setPassword(
                                                e.target.value
                                            )
                                    }
                                    placeholder="Enter password"
                                    className="w-full px-3 py-2.5 pr-10 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-xs"
                                >
                                    {showPassword
                                        ? 'Hide'
                                        : 'Show'}
                                </button>

                            </div>

                        </div>

                        {/* Create */}
                        <button
                            type="submit"
                            disabled={
                                saving ||
                                loading ||
                                availableEmployees.length === 0
                            }
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >

                            {saving
                                ? 'Creating Account...'
                                : 'Create User Account'}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}