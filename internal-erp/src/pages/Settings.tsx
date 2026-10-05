import { useState } from 'react';

const SECTIONS = [
  { id: 'general', label: 'General', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'users', label: 'Users & Roles', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { id: 'security', label: 'Security', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'billing', label: 'Billing & Tax', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'integrations', label: 'Integrations', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
];

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={`w-10 h-5.5 rounded-full transition-colors relative flex-shrink-0 ${on ? 'bg-blue-600' : 'bg-[#e2e8f0]'}`} style={{ height: 22 }}>
      <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4.5' : ''}`} style={{ width: 18, height: 18, transform: on ? 'translateX(18px)' : '' }} />
    </button>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-display text-[#0f172a]">Settings</h1>
        <p className="text-sm text-[#64748b] mt-0.5">System configuration and preferences</p>
      </div>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-2 space-y-0.5">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${activeSection === s.id ? 'bg-blue-600 text-white' : 'text-[#64748b] hover:bg-[#f8fafc]'}`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.icon} /></svg>
                <span className="font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {activeSection === 'general' && (
            <>
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <h3 className="font-semibold font-display text-[#0f172a] mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Company Name', value: 'Fabriqs Garments Pvt. Ltd.' },
                    { label: 'Registration No.', value: 'U17290GJ2015PTC085234' },
                    { label: 'GSTIN', value: '24AACFF1234R1ZP' },
                    { label: 'Address', value: 'Surat, Gujarat – 395003' },
                    { label: 'Email', value: 'info@fabriqs.com' },
                    { label: 'Phone', value: '+91 261 234 5678' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">{f.label}</label>
                      <input defaultValue={f.value} className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-[#334155]" />
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <button className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Save Changes</button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <h3 className="font-semibold font-display text-[#0f172a] mb-4">Preferences</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Dark Mode', desc: 'Use dark theme across the application', defaultOn: false },
                    { label: 'Email Notifications', desc: 'Receive system notifications via email', defaultOn: true },
                    { label: 'Auto-save Drafts', desc: 'Automatically save order drafts every 5 minutes', defaultOn: true },
                    { label: 'Low Stock Alerts', desc: 'Alert when materials fall below minimum threshold', defaultOn: true },
                  ].map(p => (
                    <div key={p.label} className="flex items-center justify-between py-3 border-b border-[#f1f5f9] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[#334155]">{p.label}</p>
                        <p className="text-xs text-[#94a3b8] mt-0.5">{p.desc}</p>
                      </div>
                      <Toggle defaultOn={p.defaultOn} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeSection === 'users' && (
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold font-display text-[#0f172a]">Role Permissions</h3>
                <button className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Add Role</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f8fafc]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Role</th>
                      {['Orders', 'Customers', 'Inventory', 'Production', 'Finance', 'Marketing', 'Employees'].map(m => (
                        <th key={m} className="text-center px-2 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { role: 'Admin', perms: [true, true, true, true, true, true, true] },
                      { role: 'Sales Executive', perms: [true, true, false, false, false, false, false] },
                      { role: 'Operations Manager', perms: [true, false, false, true, false, false, true] },
                      { role: 'Inventory Officer', perms: [false, false, true, false, false, false, false] },
                      { role: 'Production Supervisor', perms: [false, false, true, true, false, false, false] },
                      { role: 'Finance Officer', perms: [false, false, false, false, true, false, false] },
                      { role: 'Marketing Manager', perms: [false, false, false, false, false, true, false] },
                    ].map(row => (
                      <tr key={row.role} className="border-t border-[#f1f5f9]">
                        <td className="px-4 py-3 font-medium text-[#334155]">{row.role}</td>
                        {row.perms.map((allowed, i) => (
                          <td key={i} className="px-2 py-3 text-center">
                            {allowed
                              ? <svg className="w-4 h-4 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                              : <span className="text-[#e2e8f0] text-lg">—</span>
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
              <h3 className="font-semibold font-display text-[#0f172a] mb-4">Security Settings</h3>
              <div className="space-y-4">
                {[
                  { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin accounts', defaultOn: true },
                  { label: 'Session Timeout', desc: 'Auto-logout after 30 minutes of inactivity', defaultOn: true },
                  { label: 'IP Whitelist', desc: 'Restrict access to whitelisted IP addresses', defaultOn: false },
                  { label: 'Audit Log', desc: 'Log all user actions and data changes', defaultOn: true },
                ].map(p => (
                  <div key={p.label} className="flex items-center justify-between py-3 border-b border-[#f1f5f9] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#334155]">{p.label}</p>
                      <p className="text-xs text-[#94a3b8] mt-0.5">{p.desc}</p>
                    </div>
                    <Toggle defaultOn={p.defaultOn} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!['general', 'users', 'security'].includes(activeSection) && (
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-16 text-center">
              <div className="text-4xl mb-3">{SECTIONS.find(s => s.id === activeSection) ? '🔧' : '⚙️'}</div>
              <h3 className="font-semibold font-display text-[#0f172a]">{SECTIONS.find(s => s.id === activeSection)?.label}</h3>
              <p className="text-sm text-[#94a3b8] mt-1">Configuration options for this section</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
