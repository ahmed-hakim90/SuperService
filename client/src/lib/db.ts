import { apiRequest } from "./queryClient";

export async function apiGet(endpoint: string) {
  const response = await apiRequest('GET', endpoint);
  return await response.json();
}

export async function apiPost(endpoint: string, data: any) {
  const response = await apiRequest('POST', endpoint, data);
  return await response.json();
}

export async function apiPut(endpoint: string, data: any) {
  const response = await apiRequest('PUT', endpoint, data);
  return await response.json();
}

export async function apiDelete(endpoint: string) {
  const response = await apiRequest('DELETE', endpoint);
  return await response.json();
}
