export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const BASE_ROUTE = import.meta.env.VITE_IS_DEV === 'true' ? '/' : '/PGA-Fatec-Frontend/';
console.log('Base route:', BASE_ROUTE);

export const API_ENDPOINTS = {
  LOGIN: `${API_URL}/auth/login`,
  USERS: `${API_URL}/users`,
  THEMES: `${API_URL}/themes`,
  THEMATIC_AXIS: `${API_URL}/thematic-axis`,
  PROJECTS: `${API_URL}/project1`,
  ATTACHMENTS: `${API_URL}/attachments`,
  PRIORITY_ACTIONS: `${API_URL}/priority-action`,
  DELIVERABLES: `${API_URL}/deliverable`,
  SITUATIONS: `${API_URL}/problem-situation`,
  WORKLOAD_HAE: `${API_URL}/workload-hae`,
  PROCESS_STEPS: `${API_URL}/process-step`,
  PROJECT_PERSON: `${API_URL}/project-person`,
  PGA: `${API_URL}/pga`,
  UNITS: `${API_URL}/unit`,
  REGIONAL: `${API_URL}/regional`,
};