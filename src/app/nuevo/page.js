'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { crearMiembro, crearEquipo, crearArea } from '../utils/api/api';

export default function NuevoPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [tabActiva, setTabActiva] = useState('miembro');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const [formMiembro, setFormMiembro] = useState({
    nombre: '', email: '', telefono: '', membresia: 'Basica', meses: 1, precio: 99
  });
  const [formEquipo, setFormEquipo] = useState({ nombre: '', descripcion: '' });
  const [formArea, setFormArea] = useState({ nombre: '', descripcion: '', capacidad: 10 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('usuario');
    if (u) setUsuario(JSON.parse(u));
  }, []);

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
  };

  const calcularPrecio = (membresia, meses) => {
    const precios = { Basica: 99, Premium: 199 };
    return (precios[membresia] || 99) * meses;
  };

  const handleMiembroChange = (e) => {
    const { name, value } = e.target;
    const actualizado = { ...formMiembro, [name]: value };
    if (name === 'membresia' || name === 'meses') {
      actualizado.precio = calcularPrecio(
        name === 'membresia' ? value : formMiembro.membresia,
        name === 'meses' ? parseInt(value) : formMiembro.meses
      );
    }
    setFormMiembro(actualizado);
  };

  const handleSubmitMiembro = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const data = await crearMiembro({
        ...formMiembro,
        meses: parseInt(formMiembro.meses),
        precio: parseFloat(formMiembro.precio)
      });
      if (data.error) { mostrarMensaje('error', data.mensaje); return; }
      mostrarMensaje('success', '¡Miembro registrado correctamente!');
      setFormMiembro({ nombre: '', email: '', telefono: '', membresia: 'Basica', meses: 1, precio: 99 });
    } catch (err) {
      mostrarMensaje('error', 'Error al crear el miembro.');
    } finally {
      setCargando(false);
    }
  };

  const handleSubmitEquipo = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const data = await crearEquipo(formEquipo);
      if (data.error) { mostrarMensaje('error', data.mensaje); return; }
      mostrarMensaje('success', '¡Equipo registrado correctamente!');
      setFormEquipo({ nombre: '', descripcion: '' });
    } catch (err) {
      mostrarMensaje('error', 'Error al crear el equipo.');
    } finally {
      setCargando(false);
    }
  };

  const handleSubmitArea = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const data = await crearArea({ ...formArea, capacidad: parseInt(formArea.capacidad) });
      if (data.error) { mostrarMensaje('error', data.mensaje); return; }
      mostrarMensaje('success', '¡Área registrada correctamente!');
      setFormArea({ nombre: '', descripcion: '', capacidad: 10 });
    } catch (err) {
      mostrarMensaje('error', 'Error al crear el área.');
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏋️</span>
            <span className="text-white font-bold text-xl">FitnessStudio</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="btn-secondary text-sm py-1 px-3">Dashboard</button>
            <button onClick={() => router.push('/miembros')} className="btn-secondary text-sm py-1 px-3">Gestión</button>
            <button onClick={cerrarSesion} className="btn-danger text-sm py-1 px-3">Cerrar Sesión</button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Registrar Nuevo</h1>

        {mensaje.texto && (
          <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${
            mensaje.tipo === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
              : 'bg-red-500/20 border border-red-500 text-red-400'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => setTabActiva('miembro')}
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
              tabActiva === 'miembro'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            👥 Miembro
          </button>

          {usuario?.rol === 'admin' && (
            <>
              <button
                onClick={() => setTabActiva('equipo')}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                  tabActiva === 'equipo'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                🏃 Equipo
              </button>
              <button
                onClick={() => setTabActiva('area')}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                  tabActiva === 'area'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                📍 Área
              </button>
            </>
          )}
        </div>

        {/* FORM: MIEMBRO */}
        {tabActiva === 'miembro' && (
          <form onSubmit={handleSubmitMiembro} className="card space-y-4">
            <h2 className="text-lg font-semibold text-white">Nuevo Miembro</h2>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Nombre completo *</label>
              <input name="nombre" value={formMiembro.nombre} onChange={handleMiembroChange}
                className="input" placeholder="Juan Pérez" required />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Email</label>
              <input name="email" type="email" value={formMiembro.email} onChange={handleMiembroChange}
                className="input" placeholder="juan@email.com" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Teléfono</label>
              <input name="telefono" value={formMiembro.telefono} onChange={handleMiembroChange}
                className="input" placeholder="555-0000" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Membresía *</label>
                <select name="membresia" value={formMiembro.membresia} onChange={handleMiembroChange} className="input">
                  <option value="Basica">Básica - $99/mes</option>
                  <option value="Premium">Premium - $199/mes</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Meses *</label>
                <input name="meses" type="number" min="1" max="24" value={formMiembro.meses}
                  onChange={handleMiembroChange} className="input" required />
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Precio total calculado:</span>
                <span className="text-emerald-400 font-bold text-xl">${formMiembro.precio} MXN</span>
              </div>
            </div>
            <button type="submit" disabled={cargando} className="btn-primary w-full disabled:opacity-50">
              {cargando ? 'Registrando...' : 'Registrar Miembro'}
            </button>
          </form>
        )}

        {/* FORM: EQUIPO - solo admin */}
        {tabActiva === 'equipo' && usuario?.rol === 'admin' && (
          <form onSubmit={handleSubmitEquipo} className="card space-y-4">
            <h2 className="text-lg font-semibold text-white">Nuevo Equipo</h2>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Nombre del equipo *</label>
              <input name="nombre" value={formEquipo.nombre}
                onChange={e => setFormEquipo({ ...formEquipo, nombre: e.target.value })}
                className="input" placeholder="Cinta de Correr #3" required />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Descripción</label>
              <textarea value={formEquipo.descripcion}
                onChange={e => setFormEquipo({ ...formEquipo, descripcion: e.target.value })}
                className="input resize-none" rows="3" placeholder="Descripción del equipo..." />
            </div>
            <button type="submit" disabled={cargando} className="btn-primary w-full disabled:opacity-50">
              {cargando ? 'Registrando...' : 'Registrar Equipo'}
            </button>
          </form>
        )}

        {/* FORM: ÁREA - solo admin */}
        {tabActiva === 'area' && usuario?.rol === 'admin' && (
          <form onSubmit={handleSubmitArea} className="card space-y-4">
            <h2 className="text-lg font-semibold text-white">Nueva Área</h2>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Nombre del área *</label>
              <input value={formArea.nombre}
                onChange={e => setFormArea({ ...formArea, nombre: e.target.value })}
                className="input" placeholder="Zona de Yoga" required />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Descripción</label>
              <textarea value={formArea.descripcion}
                onChange={e => setFormArea({ ...formArea, descripcion: e.target.value })}
                className="input resize-none" rows="3" placeholder="Descripción del área..." />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Capacidad máxima *</label>
              <input type="number" min="1" max="100" value={formArea.capacidad}
                onChange={e => setFormArea({ ...formArea, capacidad: e.target.value })}
                className="input" required />
            </div>
            <button type="submit" disabled={cargando} className="btn-primary w-full disabled:opacity-50">
              {cargando ? 'Registrando...' : 'Registrar Área'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}