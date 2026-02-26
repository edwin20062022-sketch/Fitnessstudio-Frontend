'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMiembros, getEquipos, getAreas, getTasas } from '../utils/api/api';

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [stats, setStats] = useState({
    totalMiembros: 0,
    equiposDisponibles: 0,
    totalAreas: 0,
    miembrosPremium: 0
  });
  const [tasas, setTasas] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!token) { router.push('/login'); return; }
    setUsuario(JSON.parse(usuarioGuardado));
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [miembrosData, equiposData, areasData, tasasData] = await Promise.all([
        getMiembros({ page: 1, limit: 100 }),
        getEquipos(),
        getAreas(),
        getTasas('MXN')
      ]);

      const miembros = miembrosData.datos || [];
      const equipos = equiposData.datos || [];
      const areas = areasData.datos || [];

      setStats({
        totalMiembros: miembrosData.total || 0,
        equiposDisponibles: equipos.filter(e => e.disponible).length,
        totalAreas: areas.length,
        miembrosPremium: miembros.filter(m => m.membresia === 'Premium').length
      });

      if (!tasasData.error) setTasas(tasasData.datos);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏋️</span>
            <span className="text-white font-bold text-xl">FitnessStudio</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">
              {usuario?.rol === 'admin' ? '👑' : '👤'} {usuario?.nombre}
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-700">
                {usuario?.rol === 'admin' ? 'Administrador' : 'Usuario'}
              </span>
            </span>
            <button onClick={cerrarSesion} className="btn-danger text-sm py-1 px-3">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Bienvenida */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Bienvenido, {usuario?.nombre}.
            {usuario?.rol === 'admin'
              ? ' Tienes acceso completo al sistema.'
              : ' Tienes acceso limitado al sistema.'}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-3xl font-bold text-white">{stats.totalMiembros}</div>
            <div className="text-slate-400 text-sm mt-1">Total Miembros</div>
          </div>
          <div className="card">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-indigo-400">{stats.miembrosPremium}</div>
            <div className="text-slate-400 text-sm mt-1">Miembros Premium</div>
          </div>
          <div className="card">
            <div className="text-3xl mb-2">🏃</div>
            <div className="text-3xl font-bold text-emerald-400">{stats.equiposDisponibles}</div>
            <div className="text-slate-400 text-sm mt-1">Equipos Disponibles</div>
          </div>
          <div className="card">
            <div className="text-3xl mb-2">📍</div>
            <div className="text-3xl font-bold text-yellow-400">{stats.totalAreas}</div>
            <div className="text-slate-400 text-sm mt-1">Áreas Activas</div>
          </div>
        </div>

        {/* Tasas de cambio */}
        {tasas && (
          <div className="card mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">💱</span>
              <h2 className="text-lg font-semibold text-white">Tasas de Cambio en Tiempo Real</h2>
              <span className="text-xs text-slate-400 ml-auto">Base: MXN</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(tasas.tasas).map(([moneda, tasa]) => (
                <div key={moneda} className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-slate-400 text-xs mb-1">{moneda}</div>
                  <div className="text-white font-bold text-lg">{tasa.toFixed(4)}</div>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-3">Actualizado: {tasas.fecha}</p>
          </div>
        )}

        {/* Navegación rápida */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/miembros')}
            className="card hover:border-indigo-500 transition-all duration-200 text-left cursor-pointer"
          >
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-white font-semibold text-lg">Ver Miembros</h3>
            <p className="text-slate-400 text-sm mt-1">
              {usuario?.rol === 'admin'
                ? 'Ver, agregar y eliminar miembros'
                : 'Consultar lista de miembros'}
            </p>
          </button>

          <button
            onClick={() => router.push('/nuevo')}
            className="card hover:border-indigo-500 transition-all duration-200 text-left cursor-pointer"
          >
            <div className="text-3xl mb-3">➕</div>
            <h3 className="text-white font-semibold text-lg">Registrar Miembro</h3>
            <p className="text-slate-400 text-sm mt-1">
              {usuario?.rol === 'admin'
                ? 'Registrar miembros, equipos y áreas'
                : 'Registrar un nuevo miembro'}
            </p>
          </button>

          {usuario?.rol === 'admin' && (
            <button
              onClick={() => router.push('/miembros')}
              className="card hover:border-indigo-500 transition-all duration-200 text-left cursor-pointer"
            >
              <div className="text-3xl mb-3">⚙️</div>
              <h3 className="text-white font-semibold text-lg">Equipos y Áreas</h3>
              <p className="text-slate-400 text-sm mt-1">Administrar equipos y zonas del gimnasio</p>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}