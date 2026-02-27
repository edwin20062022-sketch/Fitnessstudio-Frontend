const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});


// AUTH

export const loginUsuario = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
};

export const registrarUsuario = async (datos) => {
  const res = await fetch(`${API_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return res.json();
};


// MIEMBROS

export const getMiembros = async ({ page = 1, limit = 5, membresia = '' } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (membresia) params.append('membresia', membresia);
  const res = await fetch(`${API_URL}/miembros?${params}`, {
    headers: getHeaders()
  });
  return res.json();
};

export const getMiembroPorId = async (id) => {
  const res = await fetch(`${API_URL}/miembros/${id}`, {
    headers: getHeaders()
  });
  return res.json();
};

export const crearMiembro = async (datos) => {
  const res = await fetch(`${API_URL}/miembros`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });
  return res.json();
};

export const actualizarMiembro = async (id, datos) => {
  const res = await fetch(`${API_URL}/miembros/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });
  return res.json();
};

export const eliminarMiembro = async (id) => {
  const res = await fetch(`${API_URL}/miembros/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
};

// EQUIPOS

export const getEquipos = async () => {
  const res = await fetch(`${API_URL}/equipos`, {
    headers: getHeaders()
  });
  return res.json();
};

export const crearEquipo = async (datos) => {
  const res = await fetch(`${API_URL}/equipos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });
  return res.json();
};

export const actualizarEquipo = async (id, datos) => {
  const res = await fetch(`${API_URL}/equipos/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });
  return res.json();
};

export const eliminarEquipo = async (id) => {
  const res = await fetch(`${API_URL}/equipos/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
};


// ÁREAS

export const getAreas = async () => {
  const res = await fetch(`${API_URL}/areas`, {
    headers: getHeaders()
  });
  return res.json();
};

export const crearArea = async (datos) => {
  const res = await fetch(`${API_URL}/areas`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });
  return res.json();
};

export const asignarMiembroArea = async (areaId, miembroId) => {
  const res = await fetch(`${API_URL}/areas/${areaId}/asignar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ miembro_id: miembroId })
  });
  return res.json();
};

export const eliminarArea = async (id) => {
  const res = await fetch(`${API_URL}/areas/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
};


// MONEDAS

export const getTasas = async (base = 'MXN') => {
  const res = await fetch(`${API_URL}/monedas/tasas?base=${base}`, {
    headers: getHeaders()
  });
  return res.json();
};

export const convertirMoneda = async (monto, de = 'MXN', a = 'USD') => {
  const res = await fetch(`${API_URL}/monedas/convertir?monto=${monto}&de=${de}&a=${a}`, {
    headers: getHeaders()
  });
  return res.json();
};