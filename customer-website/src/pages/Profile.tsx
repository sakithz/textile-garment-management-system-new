import { useEffect, useState } from 'react'
import { useApp } from '../App'
import {
  fetchCustomerProfile,
  saveCustomerSession,
  updateCustomer,
} from '../services/customerApi'

export default function Profile() {
  const {
    navigate,
    customer,
    setCustomer,
  } = useApp()

  const [form, setForm] = useState({
    name: '',
    contact: '',
    email: '',
    company: '',
    country: '',
    password: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!customer) {
      navigate('login')
      return
    }

    const loadProfile = async () => {
      setLoading(true)
      setError('')

      try {
        const latestCustomer =
            await fetchCustomerProfile(
                customer.id
            )

        setCustomer(
            latestCustomer
        )

        saveCustomerSession(
            latestCustomer
        )

        setForm({
          name:
              latestCustomer.name || '',

          contact:
              latestCustomer.contact || '',

          email:
              latestCustomer.email || '',

          company:
              latestCustomer.company || '',

          country:
              latestCustomer.country || '',

          password: '',
        })
      } catch (err) {
        setError(
            err instanceof Error
                ? err.message
                : 'Failed to load your profile.'
        )

        setForm({
          name:
              customer.name || '',

          contact:
              customer.contact || '',

          email:
              customer.email || '',

          company:
              customer.company || '',

          country:
              customer.country || '',

          password: '',
        })
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()

    /*
     * IMPORTANT:
     *
     * Depend only on the customer ID.
     *
     * setCustomer() updates the customer object in App.
     * If the entire customer object is used as a dependency,
     * updating the customer causes this effect to run again.
     *
     * The same problem can happen with navigate/setCustomer
     * because those functions are recreated by App renders.
     *
     * The customer ID is stable, so the profile is loaded once
     * for the current customer.
     */
  }, [customer?.id])

  const handleChange = (
      field: keyof typeof form,
      value: string
  ) => {

    setForm(
        current => ({
          ...current,
          [field]: value,
        })
    )

    setMessage('')
    setError('')
  }

  const handleSubmit = async (
      event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault()

    if (!customer) {
      navigate('login')
      return
    }

    setMessage('')
    setError('')

    if (!form.name.trim()) {
      setError(
          'Please enter your name.'
      )
      return
    }

    if (!form.contact.trim()) {
      setError(
          'Please enter your contact number.'
      )
      return
    }

    if (!form.email.trim()) {
      setError(
          'Please enter your email address.'
      )
      return
    }

    if (!form.company.trim()) {
      setError(
          'Please enter your company name.'
      )
      return
    }

    if (
        form.password.trim() &&
        form.password.trim().length < 6
    ) {
      setError(
          'New password must be at least 6 characters long.'
      )
      return
    }

    setSaving(true)

    try {

      const updatedCustomer =
          await updateCustomer(
              customer.id,
              {
                name:
                    form.name.trim(),

                contact:
                    form.contact.trim(),

                email:
                    form.email
                        .trim()
                        .toLowerCase(),

                company:
                    form.company.trim(),

                country:
                    form.country.trim(),

                password:
                    form.password
                        .trim() ||
                    undefined,
              }
          )

      setCustomer(
          updatedCustomer
      )

      saveCustomerSession(
          updatedCustomer
      )

      setForm({
        name:
            updatedCustomer.name || '',

        contact:
            updatedCustomer.contact || '',

        email:
            updatedCustomer.email || '',

        company:
            updatedCustomer.company || '',

        country:
            updatedCustomer.country || '',

        password: '',
      })

      setMessage(
          'Your profile has been updated successfully.'
      )

    } catch (err) {

      setError(
          err instanceof Error
              ? err.message
              : 'Failed to update your profile.'
      )

    } finally {

      setSaving(false)

    }
  }

  if (!customer) {
    return null
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center">

          <div className="text-center">

            <div className="w-8 h-8 border-2 border-[#1F4D3A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />

            <p className="text-sm text-gray-500">
              Loading your profile...
            </p>

          </div>

        </div>
    )
  }

  return (
      <div className="min-h-screen bg-[#F8F8F6] py-10 px-4 sm:px-6 lg:px-8">

        <div className="max-w-4xl mx-auto">

          {/* Header */}

          <div className="mb-8">

            <button
                type="button"
                onClick={() =>
                    navigate(
                        'dashboard'
                    )
                }
                className="text-sm text-gray-500 hover:text-[#1F4D3A] mb-4 transition-colors"
            >
              ← Back to Dashboard
            </button>

            <h1 className="text-3xl font-semibold text-[#1F2937]">
              My Profile
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your customer account information and password.
            </p>

          </div>


          {/* Profile card */}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Account header */}

            <div className="px-6 py-6 border-b border-gray-100 bg-[#F5F7F4]">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-full bg-[#1F4D3A] text-white flex items-center justify-center text-xl font-semibold">

                  {form.name
                      ? form.name
                          .charAt(0)
                          .toUpperCase()
                      : 'C'}

                </div>

                <div>

                  <h2 className="text-lg font-semibold text-[#1F2937]">
                    {form.name || 'Customer'}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Customer ID: {customer.customerCode}
                  </p>

                </div>

              </div>

            </div>


            {/* Form */}

            <form
                onSubmit={
                  handleSubmit
                }
                className="p-6 space-y-8"
            >

              {/* Messages */}

              {message && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                  </div>
              )}

              {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
              )}


              {/* Personal information */}

              <section>

                <div className="mb-5">

                  <h3 className="text-base font-semibold text-[#1F2937]">
                    Personal Information
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Update the information associated with your customer account.
                  </p>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>

                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={
                          event =>
                              handleChange(
                                  'name',
                                  event.target.value
                              )
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1F4D3A] focus:ring-1 focus:ring-[#1F4D3A]"
                        placeholder="Enter your full name"
                    />

                  </div>


                  <div>

                    <label
                        htmlFor="contact"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Contact Number
                    </label>

                    <input
                        id="contact"
                        type="text"
                        value={form.contact}
                        onChange={
                          event =>
                              handleChange(
                                  'contact',
                                  event.target.value
                              )
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1F4D3A] focus:ring-1 focus:ring-[#1F4D3A]"
                        placeholder="Enter your contact number"
                    />

                  </div>


                  <div>

                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={
                          event =>
                              handleChange(
                                  'email',
                                  event.target.value
                              )
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1F4D3A] focus:ring-1 focus:ring-[#1F4D3A]"
                        placeholder="Enter your email"
                    />

                  </div>


                  <div>

                    <label
                        htmlFor="company"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Company
                    </label>

                    <input
                        id="company"
                        type="text"
                        value={form.company}
                        onChange={
                          event =>
                              handleChange(
                                  'company',
                                  event.target.value
                              )
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1F4D3A] focus:ring-1 focus:ring-[#1F4D3A]"
                        placeholder="Enter your company"
                    />

                  </div>


                  <div>

                    <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Country
                    </label>

                    <input
                        id="country"
                        type="text"
                        value={form.country}
                        onChange={
                          event =>
                              handleChange(
                                  'country',
                                  event.target.value
                              )
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1F4D3A] focus:ring-1 focus:ring-[#1F4D3A]"
                        placeholder="Enter your country"
                    />

                  </div>

                </div>

              </section>


              {/* Security */}

              <section className="border-t border-gray-100 pt-8">

                <div className="mb-5">

                  <h3 className="text-base font-semibold text-[#1F2937]">
                    Security
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Leave the password field empty if you do not want to change your password.
                  </p>

                </div>


                <div className="max-w-md">

                  <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    New Password
                  </label>

                  <input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={
                        event =>
                            handleChange(
                                'password',
                                event.target.value
                            )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1F4D3A] focus:ring-1 focus:ring-[#1F4D3A]"
                      placeholder="Enter a new password"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Minimum 6 characters.
                  </p>

                </div>

              </section>


              {/* Account information */}

              <section className="border-t border-gray-100 pt-8">

                <div className="mb-5">

                  <h3 className="text-base font-semibold text-[#1F2937]">
                    Account Information
                  </h3>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Customer Code
                    </p>

                    <p className="font-semibold text-[#1F2937]">
                      {customer.customerCode}
                    </p>

                  </div>


                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Account Status
                    </p>

                    <p className="font-semibold text-[#1F2937]">
                      {customer.status}
                    </p>

                  </div>


                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Total Orders
                    </p>

                    <p className="font-semibold text-[#1F2937]">
                      {customer.totalOrders ?? 0}
                    </p>

                  </div>

                </div>

              </section>


              {/* Actions */}

              <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            'dashboard'
                        )
                    }
                    className="px-5 py-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-lg bg-[#1F4D3A] text-white text-sm font-medium hover:bg-[#173A2C] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {saving
                      ? 'Saving...'
                      : 'Save Changes'}
                </button>

              </div>

            </form>

          </div>

        </div>

      </div>
  )
}