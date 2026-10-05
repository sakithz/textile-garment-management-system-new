import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  fetchAllOrders,
} from '../services/orderApi';

import {
  fetchFinanceSummary,
} from '../services/financeApi';

import {
  fetchAllInventory,
} from '../services/inventoryApi';

import {
  fetchAllProductionTasks,
} from '../services/productionApi';

import {
  fetchAllCampaigns,
} from '../services/marketingApi';

import {
  fetchAllDeliveries,
} from '../services/deliveryApi';

import {
  formatCurrency,
} from '../data/mockData';

import type { Order } from '../types';

export default function Reports() {
  const [orders, setOrders] =
      useState<
          (Order & {
            numericId?: number;
          })[]
      >([]);

  const [finance, setFinance] =
      useState({
        totalRevenue: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        invoiceCount: 0,
      });

  const [inventory, setInventory] =
      useState<any[]>([]);

  const [production, setProduction] =
      useState<any[]>([]);

  const [campaigns, setCampaigns] =
      useState<any[]>([]);

  const [deliveries, setDeliveries] =
      useState<any[]>([]);

  const [loading, setLoading] =
      useState(true);

  const [error, setError] =
      useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');

      const results =
          await Promise.allSettled([
            fetchAllOrders(),
            fetchFinanceSummary(),
            fetchAllInventory(),
            fetchAllProductionTasks(),
            fetchAllCampaigns(),
            fetchAllDeliveries(),
          ]);

      if (!mounted) {
        return;
      }

      if (
          results[0].status ===
          'fulfilled'
      ) {
        setOrders(
            results[0].value
        );
      }

      if (
          results[1].status ===
          'fulfilled'
      ) {
        setFinance(
            results[1].value
        );
      }

      if (
          results[2].status ===
          'fulfilled'
      ) {
        setInventory(
            results[2].value
        );
      }

      if (
          results[3].status ===
          'fulfilled'
      ) {
        setProduction(
            results[3].value
        );
      }

      if (
          results[4].status ===
          'fulfilled'
      ) {
        setCampaigns(
            results[4].value
        );
      }

      if (
          results[5].status ===
          'fulfilled'
      ) {
        setDeliveries(
            results[5].value
        );
      }

      if (
          results.every(
              (result) =>
                  result.status ===
                  'rejected'
          )
      ) {
        setError(
            'No report API is available for this user role.'
        );
      }

      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const garmentData =
      useMemo(() => {
        const map =
            new Map<
                string,
                number
            >();

        orders.forEach(
            (order) => {
              map.set(
                  order.garmentType,
                  (map.get(
                      order.garmentType
                  ) || 0) + 1
              );
            }
        );

        return [
          ...map.entries(),
        ]
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .slice(0, 8);
      }, [orders]);

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Reports & Analytics
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              All figures are
              calculated from live
              database records.
            </p>
          </div>

          <button
              onClick={() =>
                  window.location.reload()
              }
              className="px-3 py-2 bg-white border rounded-lg text-sm font-semibold"
          >
            ↻ Refresh
          </button>
        </div>

        {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm">
              {error}
            </div>
        )}

        {loading ? (
            <div className="bg-white border rounded-xl p-12 text-center text-slate-500">
              Loading reports from
              MySQL...
            </div>
        ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Metric
                    label="Orders"
                    value={orders.length}
                />

                <Metric
                    label="Revenue"
                    value={formatCurrency(
                        finance.totalRevenue
                    )}
                />

                <Metric
                    label="Production Tasks"
                    value={
                      production.length
                    }
                />

                <Metric
                    label="Inventory Items"
                    value={
                      inventory.length
                    }
                />

                <Metric
                    label="Low Stock"
                    value={
                      inventory.filter(
                          (item) =>
                              item.status !==
                              'in_stock'
                      ).length
                    }
                />

                <Metric
                    label="Campaigns"
                    value={
                      campaigns.length
                    }
                />

                <Metric
                    label="Deliveries"
                    value={
                      deliveries.length
                    }
                />

                <Metric
                    label="Overdue"
                    value={formatCurrency(
                        finance.overdue
                    )}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <section className="bg-white border rounded-xl p-5">
                  <h2 className="font-semibold text-slate-900 mb-4">
                    Order Status
                  </h2>

                  <div className="space-y-3">
                    {[
                      'pending',
                      'approved',
                      'in_production',
                      'quality_check',
                      'ready',
                      'delivered',
                      'cancelled',
                    ].map((status) => (
                        <div
                            key={status}
                            className="flex justify-between text-sm"
                        >
                    <span className="capitalize text-slate-500">
                      {status.replace(
                          /_/g,
                          ' '
                      )}
                    </span>

                          <strong>
                            {
                              orders.filter(
                                  (order) =>
                                      order.status ===
                                      status
                              ).length
                            }
                          </strong>
                        </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white border rounded-xl p-5">
                  <h2 className="font-semibold text-slate-900 mb-4">
                    Orders by Garment
                    Type
                  </h2>

                  {garmentData.length ===
                  0 ? (
                      <p className="text-sm text-slate-400">
                        No order data in
                        the database.
                      </p>
                  ) : (
                      <div className="space-y-3">
                        {garmentData.map(
                            ([name, count]) => {
                              const max =
                                  Math.max(
                                      ...garmentData.map(
                                          (item) =>
                                              item[1]
                                      )
                                  );

                              return (
                                  <div
                                      key={name}
                                  >
                                    <div className="flex justify-between text-sm mb-1">
                            <span>
                              {name}
                            </span>

                                      <strong>
                                        {count}
                                      </strong>
                                    </div>

                                    <div className="h-2 bg-slate-100 rounded-full">
                                      <div
                                          className="h-2 bg-blue-600 rounded-full"
                                          style={{
                                            width: `${Math.max(
                                                8,
                                                (count /
                                                    max) *
                                                100
                                            )}%`,
                                          }}
                                      />
                                    </div>
                                  </div>
                              );
                            }
                        )}
                      </div>
                  )}
                </section>
              </div>

              <div className="bg-white border rounded-xl overflow-hidden">
                <div className="p-5">
                  <h2 className="font-semibold text-slate-900">
                    Recent Database
                    Orders
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs text-slate-500">
                        Order
                      </th>

                      <th className="text-left px-5 py-3 text-xs text-slate-500">
                        Customer
                      </th>

                      <th className="text-left px-5 py-3 text-xs text-slate-500">
                        Status
                      </th>

                      <th className="text-left px-5 py-3 text-xs text-slate-500">
                        Total
                      </th>
                    </tr>
                    </thead>

                    <tbody>
                    {[
                      ...orders,
                    ]
                        .reverse()
                        .slice(0, 10)
                        .map(
                            (order) => (
                                <tr
                                    key={
                                      order.id
                                    }
                                    className="border-t"
                                >
                                  <td className="px-5 py-3 font-semibold text-blue-600">
                                    {order.id}
                                  </td>

                                  <td className="px-5 py-3">
                                    {
                                      order.customer
                                    }
                                  </td>

                                  <td className="px-5 py-3 capitalize">
                                    {order.status.replace(
                                        /_/g,
                                        ' '
                                    )}
                                  </td>

                                  <td className="px-5 py-3 font-semibold">
                                    {formatCurrency(
                                        order.total
                                    )}
                                  </td>
                                </tr>
                            )
                        )}

                    {orders.length ===
                        0 && (
                            <tr>
                              <td
                                  colSpan={4}
                                  className="p-10 text-center text-slate-400"
                              >
                                No orders in
                                the database.
                              </td>
                            </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
        )}
      </div>
  );
}

function Metric({
                  label,
                  value,
                }: {
  label: string;

  value: string | number;
}) {
  return (
      <div className="bg-white border rounded-xl p-4">
        <div className="text-xs uppercase text-slate-400">
          {label}
        </div>

        <div className="text-xl font-bold text-slate-900 mt-2">
          {value}
        </div>
      </div>
  );
}