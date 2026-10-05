import type { Material } from '../types';

import { apiFetch } from './apiClient';

const API_BASE_URL =
    'http://localhost:8080/api/inventory';

export interface BackendInventory {
  id: number;

  materialCode: string;

  name: string;

  category: string;

  currentStock: number;

  unit: string;

  minStock: number;

  supplier: string;

  unitCost: number;

  status:
      | 'IN_STOCK'
      | 'LOW_STOCK'
      | 'OUT_OF_STOCK';

  lastUpdated: string;
}

export function toFrontendMaterial(
    b: BackendInventory
): Material & {
  numericId: number;
} {
  return {
    id:
        b.materialCode ||
        `MAT-${b.id}`,

    numericId: b.id,

    name: b.name,

    category: b.category,

    currentStock:
    b.currentStock,

    unit: b.unit,

    minStock: b.minStock,

    supplier: b.supplier,

    unitCost: b.unitCost,

    status:
        b.status === 'LOW_STOCK'
            ? 'low_stock'
            : b.status === 'OUT_OF_STOCK'
                ? 'out_of_stock'
                : 'in_stock',

    lastUpdated:
    b.lastUpdated,
  };
}

async function handleError(
    response: Response,
    action: string
): Promise<never> {
  const error =
      await response
          .json()
          .catch(() => null);

  throw new Error(
      error?.error ||
      error?.message ||
      `${action}: HTTP ${response.status}`
  );
}

export async function fetchAllInventory() {
  const response =
      await apiFetch(
          API_BASE_URL
      );

  if (!response.ok) {
    await handleError(
        response,
        'Failed to fetch inventory'
    );
  }

  const data =
      (await response.json()) as BackendInventory[];

  return data.map(
      toFrontendMaterial
  );
}

export async function createMaterial(
    item: Partial<Material>
) {
  const response =
      await apiFetch(
          API_BASE_URL,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                  'application/json',
            },

            body: JSON.stringify({
              name: item.name,

              category: item.category,

              currentStock:
                  item.currentStock ?? 0,

              unit: item.unit,

              minStock:
                  item.minStock ?? 0,

              supplier: item.supplier,

              unitCost:
                  item.unitCost ?? 0,

              status:
                  item.status?.toUpperCase(),
            }),
          }
      );

  if (!response.ok) {
    await handleError(
        response,
        'Failed to create material'
    );
  }

  return toFrontendMaterial(
      await response.json()
  );
}

export async function updateMaterial(
    id: number,
    item: Partial<Material>
) {
  const response =
      await apiFetch(
          `${API_BASE_URL}/${id}`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                  'application/json',
            },

            body: JSON.stringify({
              name: item.name,

              category: item.category,

              currentStock:
              item.currentStock,

              unit: item.unit,

              minStock:
              item.minStock,

              supplier:
              item.supplier,

              unitCost:
              item.unitCost,

              status:
                  item.status?.toUpperCase(),
            }),
          }
      );

  if (!response.ok) {
    await handleError(
        response,
        'Failed to update material'
    );
  }

  return toFrontendMaterial(
      await response.json()
  );
}

export async function adjustStock(
    id: number,
    delta: number
) {
  const response =
      await apiFetch(
          `${API_BASE_URL}/${id}/stock?delta=${encodeURIComponent(
              delta
          )}`,
          {
            method: 'PATCH',
          }
      );

  if (!response.ok) {
    await handleError(
        response,
        'Failed to adjust stock'
    );
  }

  return toFrontendMaterial(
      await response.json()
  );
}

export async function deleteMaterial(
    id: number
) {
  const response =
      await apiFetch(
          `${API_BASE_URL}/${id}`,
          {
            method: 'DELETE',
          }
      );

  if (!response.ok) {
    await handleError(
        response,
        'Failed to delete material'
    );
  }
}