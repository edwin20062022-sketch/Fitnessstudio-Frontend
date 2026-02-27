'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMiembros, eliminarMiembro, getEquipos, actualizarEquipo, eliminarEquipo, getAreas, eliminarArea, asignarMiembroArea, actualizarMiembro } from '../utils/api/api';

export default function MiembrosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [paginacion, setPaginacion] = useState({ pagina: 1, totalPaginas: 1, total: 0 });
  const [filtroMembresia, setFiltroMembresia] = useState('');
  const [tabActiva, setTabActiva] = useState('miembros');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Modal asignación
  const [modalAsignar, setModalAsignar] = useState(false);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [areaSeleccionada, setAreaSeleccionada] = useState('');
  const [cargandoAsignacion, setCargandoAsignacion] = useState(false);
  const [mensajeAsignacion, setMensajeAsignacion] = useState({ tipo: '', texto: '' });

  // Modal edición
  const [modalEditar, setModalEditar] = useState(false);
  const [formEditar, setFormEditar] = useState({
    nombre: '', email: '', telefono: '', membresia: 'Basica', meses: 1, precio: 99
  });
  const [cargandoEdicion, setCargandoEdicion] = useState(false);
  const [mensajeEdicion, setMensajeEdicion] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('usuario');
    setUsuario(JSON.parse(u));
    cargarMiembros(1, '');
    cargarEquipos();
    cargarAreas();
  }, []);

  const cargarMiembros = async (page, membresia) => {
    setCargando(true);
    try {
      const data = await getMiembros({ page, limit: 5, membresia });
      if (data.error) { setError(data.mensaje); return; }
      setMiembros(data.datos || []);
      setPaginacion({ pagina: data.pagina, totalPaginas: data.totalPaginas, total: data.total });
    } catch (err) {
      setError('Error al cargar miembros.');
    } finally {
      setCargando(false);
    }
  };

  const cargarEquipos = async () => {
    try {
      const data = await getEquipos();
      setEquipos(data.datos || []);
    } catch (err) {
      console.error('Error cargando equipos:', err);
    }
  };

  const cargarAreas = async () => {
    try {
      const data = await getAreas();
      setAreas(data.datos || []);
    } catch (err) {
      console.error('Error cargando áreas:', err);
    }
  };

  const handleEliminarMiembro = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este miembro?')) return;
    try {
      await eliminarMiembro(id);
      cargarMiembros(paginacion.pagina, filtroMembresia);
    } catch (err) {
      setError('Error al eliminar miembro.');
    }
  };

  const handleToggleEquipo = async (equipo) => {
    try {
      await actualizarEquipo(equipo.id, { disponible: !equipo.disponible });
      cargarEquipos();
    } catch (err) {
      console.error('Error actualizando equipo:', err);
    }
  };

  const handleEliminarEquipo = async (id) => {
    if (!confirm('¿Eliminar este equipo?')) return;
    try {
      await eliminarEquipo(id);
      cargarEquipos();
    } catch (err) {
      console.error('Error eliminando equipo:', err);
    }
  };

  const handleEliminarArea = async (id) => {
    if (!confirm('¿Eliminar esta área?')) return;
    try {
      await eliminarArea(id);
      cargarAreas();
    } catch (err) {
      console.error('Error eliminando área:', err);
    }
  };

  const handleFiltro = (membresia) => {
    setFiltroMembresia(membresia);
    cargarMiembros(1, membresia);
  };

  const abrirModalAsignar = (miembro) => {
    setMiembroSeleccionado(miembro);
    setAreaSeleccionada('');
    setMensajeAsignacion({ tipo: '', texto: '' });
    setModalAsignar(true);
  };

  const handleAsignar = async () => {
    if (!areaSeleccionada) {
      setMensajeAsignacion({ tipo: 'error', texto: 'Selecciona un área.' });
      return;
    }
    setCargandoAsignacion(true);
    try {
      const data = await asignarMiembroArea(areaSeleccionada, miembroSeleccionado.id);
      if (data.error) {
        setMensajeAsignacion({ tipo: 'error', texto: data.mensaje });
        return;
      }
      setMensajeAsignacion({ tipo: 'success', texto: '¡Miembro asignado correctamente!' });
      cargarAreas();
      setTimeout(() => setModalAsignar(false), 1500);
    } catch (err) {
      setMensajeAsignacion({ tipo: 'error', texto: 'Error al asignar miembro.' });
    } finally {
      setCargandoAsignacion(false);
    }
  };

  const abrirModalEditar = (miembro) => {
    setFormEditar({
      nombre: miembro.nombre,
      email: miembro.email || '',
      telefono: miembro.telefono || '',
      membresia: miembro.membresia,
      meses: miembro.meses,
      precio: miembro.precio
    });
    setMiembroSeleccionado(miembro);
    setMensajeEdicion({ tipo: '', texto: '' });
    setModalEditar(true);
  };

  const handleEditar = async () => {
    setCargandoEdicion(true);
    try {
      const data = await actualizarMiembro(miembroSeleccionado.id, {
        ...formEditar,
        meses: parseInt(formEditar.meses),
        precio: parseFloat(formEditar.precio)
      });
      if (data.error) {
        setMensajeEdicion({ tipo: 'error', texto: data.mensaje });
        return;
      }
      setMensajeEdicion({ tipo: 'success', texto: '¡Miembro actualizado correctamente!' });
      cargarMiembros(paginacion.pagina, filtroMembresia);
      setTimeout(() => setModalEditar(false), 1500);
    } catch (err) {
      setMensajeEdicion({ tipo: 'error', texto: 'Error al actualizar el miembro.' });
    } finally {
      setCargandoEdicion(false);
    }
  };

  const calcularPrecioEdicion = (membresia, meses) => {
    const precios = { Basica: 99, Premium: 199 };
    return (precios[membresia] || 99) * parseInt(meses);
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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏋️</span>
            <span className="text-white font-bold text-xl">FitnessStudio</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="btn-secondary text-sm py-1 px-3">Dashboard</button>
            <button onClick={() => router.push('/nuevo')} className="btn-primary text-sm py-1 px-3">+ Nuevo</button>
            <button onClick={cerrarSesion} className="btn-danger text-sm py-1 px-3">Cerrar Sesión</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Gestión del Gimnasio</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          {['miembros', 'equipos', 'areas'].map(tab => (
            <button
              key={tab}
              onClick={() => setTabActiva(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-all duration-200 border-b-2 -mb-px ${
                tabActiva === tab
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'miembros' ? '👥 Miembros' : tab === 'equipos' ? '🏃 Equipos' : '📍 Áreas'}
            </button>
          ))}
        </div>

        {/* TAB: MIEMBROS */}
        {tabActiva === 'miembros' && (
          <div>
            <div className="flex gap-2 mb-4">
              {['', 'Premium', 'Basica'].map(f => (
                <button
                  key={f}
                  onClick={() => handleFiltro(f)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    filtroMembresia === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {f === '' ? 'Todos' : f}
                </button>
              ))}
              <span className="ml-auto text-slate-400 text-sm self-center">
                Total: {paginacion.total} miembros
              </span>
            </div>

            <div className="card overflow-x-auto">
              {cargando ? (
                <div className="text-center text-slate-400 py-8">Cargando...</div>
              ) : miembros.length === 0 ? (
                <div className="text-center text-slate-400 py-8">No hay miembros registrados</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-3 px-2">ID</th>
                      <th className="text-left py-3 px-2">Nombre</th>
                      <th className="text-left py-3 px-2">Membresía</th>
                      <th className="text-left py-3 px-2">Meses</th>
                      <th className="text-left py-3 px-2">Precio</th>
                      <th className="text-left py-3 px-2">Vencimiento</th>
                      <th className="text-left py-3 px-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {miembros.map(m => (
                      <tr key={m.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-2 text-slate-400">#{m.id}</td>
                        <td className="py-3 px-2 text-white font-medium">{m.nombre}</td>
                        <td className="py-3 px-2">
                          <span className={m.membresia === 'Premium' ? 'badge-premium' : 'badge-basica'}>
                            {m.membresia}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-300">{m.meses} {m.meses === 1 ? 'mes' : 'meses'}</td>
                        <td className="py-3 px-2 text-emerald-400">${m.precio}</td>
                        <td className="py-3 px-2 text-slate-400 text-xs">
                          {m.fecha_vencimiento ? new Date(m.fecha_vencimiento).toLocaleDateString('es-MX') : '-'}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => router.push(`/miembros/${m.id}`)}
                              className="btn-secondary text-xs py-1 px-2"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => abrirModalEditar(m)}
                              className="btn-primary text-xs py-1 px-2"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => abrirModalAsignar(m)}
                              className="btn-success text-xs py-1 px-2"
                            >
                              Área
                            </button>
                            {usuario?.rol === 'admin' && (
                              <button
                                onClick={() => handleEliminarMiembro(m.id)}
                                className="btn-danger text-xs py-1 px-2"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {paginacion.totalPaginas > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => cargarMiembros(paginacion.pagina - 1, filtroMembresia)}
                  disabled={paginacion.pagina === 1}
                  className="btn-secondary text-sm py-1 px-3 disabled:opacity-50"
                >
                  ← Anterior
                </button>
                <span className="text-slate-400 text-sm self-center">
                  Página {paginacion.pagina} de {paginacion.totalPaginas}
                </span>
                <button
                  onClick={() => cargarMiembros(paginacion.pagina + 1, filtroMembresia)}
                  disabled={paginacion.pagina === paginacion.totalPaginas}
                  className="btn-secondary text-sm py-1 px-3 disabled:opacity-50"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: EQUIPOS */}
        {tabActiva === 'equipos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipos.length === 0 ? (
              <div className="text-slate-400 col-span-3 text-center py-8">No hay equipos registrados</div>
            ) : equipos.map(e => (
              <div key={e.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{e.nombre}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    e.disponible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {e.disponible ? '● Disponible' : '● En Uso'}
                  </span>
                </div>
                {e.descripcion && <p className="text-slate-400 text-sm mb-3">{e.descripcion}</p>}
                <p className="text-slate-500 text-xs mb-4">ID: #{e.id} · {e.estado}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleEquipo(e)}
                    className={e.disponible ? 'btn-secondary text-xs py-1 px-3' : 'btn-success text-xs py-1 px-3'}
                  >
                    {e.disponible ? 'Marcar en Uso' : 'Marcar Disponible'}
                  </button>
                  {usuario?.rol === 'admin' && (
                    <button
                      onClick={() => handleEliminarEquipo(e.id)}
                      className="btn-danger text-xs py-1 px-3"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: ÁREAS */}
        {tabActiva === 'areas' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {areas.length === 0 ? (
              <div className="text-slate-400 col-span-3 text-center py-8">No hay áreas registradas</div>
            ) : areas.map(a => {
              const porcentaje = Math.min((a.ocupacion_actual / a.capacidad) * 100, 100);
              return (
                <div key={a.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">{a.nombre}</h3>
                    <span className="text-slate-400 text-sm">{a.ocupacion_actual}/{a.capacidad}</span>
                  </div>
                  {a.descripcion && <p className="text-slate-400 text-sm mb-3">{a.descripcion}</p>}
                  <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        porcentaje >= 100 ? 'bg-red-500' : porcentaje >= 70 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <p className="text-slate-500 text-xs mb-3">{a.lugares_disponibles} lugares disponibles</p>
                  {usuario?.rol === 'admin' && (
                    <button
                      onClick={() => handleEliminarArea(a.id)}
                      className="btn-danger text-xs py-1 px-3"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Asignar área */}
      {modalAsignar && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalAsignar(false); }}
        >
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Asignar a Área</h3>
              <button
                onClick={() => setModalAsignar(false)}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              Asignando a: <span className="text-white font-medium">{miembroSeleccionado?.nombre}</span>
            </p>

            {mensajeAsignacion.texto && (
              <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${
                mensajeAsignacion.tipo === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                  : 'bg-red-500/20 border border-red-500 text-red-400'
              }`}>
                {mensajeAsignacion.texto}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-slate-400 text-sm mb-2">Selecciona un área</label>
              <select
                value={areaSeleccionada}
                onChange={e => setAreaSeleccionada(e.target.value)}
                className="input"
              >
                <option value="">-- Selecciona un área --</option>
                {areas.map(a => (
                  <option
                    key={a.id}
                    value={a.id}
                    disabled={a.ocupacion_actual >= a.capacidad}
                  >
                    {a.nombre} ({a.ocupacion_actual}/{a.capacidad})
                    {a.ocupacion_actual >= a.capacidad ? ' - LLENA' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalAsignar(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleAsignar}
                disabled={cargandoAsignacion || !areaSeleccionada}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {cargandoAsignacion ? 'Asignando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Editar miembro */}
      {modalEditar && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalEditar(false); }}
        >
          <div className="card w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Editar Miembro</h3>
              <button
                onClick={() => setModalEditar(false)}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {mensajeEdicion.texto && (
              <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${
                mensajeEdicion.tipo === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                  : 'bg-red-500/20 border border-red-500 text-red-400'
              }`}>
                {mensajeEdicion.texto}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Nombre completo *</label>
                <input
                  value={formEditar.nombre}
                  onChange={e => setFormEditar({ ...formEditar, nombre: e.target.value })}
                  className="input"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={formEditar.email}
                  onChange={e => setFormEditar({ ...formEditar, email: e.target.value })}
                  className="input"
                  placeholder="juan@email.com"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Teléfono</label>
                <input
                  value={formEditar.telefono}
                  onChange={e => setFormEditar({ ...formEditar, telefono: e.target.value })}
                  className="input"
                  placeholder="555-0000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Membresía *</label>
                  <select
                    value={formEditar.membresia}
                    onChange={e => setFormEditar({
                      ...formEditar,
                      membresia: e.target.value,
                      precio: calcularPrecioEdicion(e.target.value, formEditar.meses)
                    })}
                    className="input"
                  >
                    <option value="Basica">Básica - $99/mes</option>
                    <option value="Premium">Premium - $199/mes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Meses *</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formEditar.meses}
                    onChange={e => setFormEditar({
                      ...formEditar,
                      meses: e.target.value,
                      precio: calcularPrecioEdicion(formEditar.membresia, e.target.value)
                    })}
                    className="input"
                  />
                </div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Precio total calculado:</span>
                  <span className="text-emerald-400 font-bold text-xl">${formEditar.precio} MXN</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalEditar(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditar}
                disabled={cargandoEdicion || !formEditar.nombre}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {cargandoEdicion ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}