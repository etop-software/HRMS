// services/api.js
const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchAreas = async () => {
  const response = await fetch(`${BASE_URL}/api/areas`);
  if (!response.ok) {
    throw new Error("Failed to fetch areas");
  }
  return response.json();
};

export const addArea = async (newArea) => {
  const response = await fetch(`${BASE_URL}/api/areas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newArea),
  });
  if (!response.ok) {
    throw new Error("Failed to add area");
  }
  return response.json();
};

export const editArea = async (areaId, updatedArea) => {
  const response = await fetch(`${BASE_URL}/api/areas/${areaId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedArea),
  });
  if (!response.ok) {
    throw new Error("Failed to update area");
  }
  return response.json();
};

export const deleteArea = async (areaId) => {
  const response = await fetch(`${BASE_URL}/api/areas/${areaId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error("Failed to delete area");
  }
  return response.json();
};
