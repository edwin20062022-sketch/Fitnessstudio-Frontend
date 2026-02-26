'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getMiembroPorId, convertirMoneda } from '../../utils/api/api';

export default function DetalleMiembroPage() {
  const router = useRouter();
  const { id } = useParams();
  const [miembro, setMiembro] = useState(null);
  const [conversion, setConversion] = useState(null);
  const [monedaDestino, setMonedaDestino] = useState('USD');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    cargarMiembro();
  }, [id]);

  const cargarMiembro = async () => {
    try {
      const data = await getMiembroPorId(id);
      if (data.error) { setError(data.mensaje); return; }
      setMiembro(data.datos);
      convertirPrecio(data.datos.precio, 'USD');
    } catch (err) {
      setError('Error al cargar el miembro.');
    } finally {
      setCargando(false);
    }
  };

  const convertirPrecio = async (precio, moneda) => {
    try {
      const data = await convertirMoneda(precio, 'MXN', moneda);
      if (!data.error) setConversion(data.datos);
    } catch (err) {
      console.error('Error convirtiendo moneda:', err);
    }
  };

  const handleCambioMoneda = (moneda) => {
    setMonedaDestino(moneda);
    convertirPrecio(miembro.precio, moneda);
  };

  const estaVigente = (fecha) => {
    if (!fecha) return false;
    return new Date(fecha) > new Date();
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Cargando miembro...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button onClick={() => router.push('/miembros')} className="btn-primary">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏋️</span>
            <span className="text-white font-bold text-xl">FitnessStudio</span>
          </div>
          <button onClick={() => router.push('/miembros')} className="btn-secondary text-sm py-1 px-3">
            ← Volver
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Detalle del Miembro</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Info del miembro */}
          <div className="card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {miembro.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{miembro.nombre}</h2>
                <span className={miembro.membresia === 'Premium' ? 'badge-premium' : 'badge-basica'}>
                  {miembro.membresia}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {miembro.email && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Email</span>
                  <span className="text-white">{miembro.email}</span>
                </div>
              )}
              {miembro.telefono && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Teléfono</span>
                  <span className="text-white">{miembro.telefono}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Meses contratados</span>
                <span className="text-white">{miembro.meses} {miembro.meses === 1 ? 'mes' : 'meses'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fecha inicio</span>
                <span className="text-white">
                  {miembro.fecha_inicio ? new Date(miembro.fecha_inicio).toLocaleDateString('es-MX') : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vencimiento</span>
                <span className={estaVigente(miembro.fecha_vencimiento) ? 'text-emerald-400' : 'text-red-400'}>
                  {miembro.fecha_vencimiento ? new Date(miembro.fecha_vencimiento).toLocaleDateString('es-MX') : '-'}
                  {estaVigente(miembro.fecha_vencimiento) ? ' ✓ Vigente' : ' ✗ Vencida'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-3">
                <span className="text-slate-400">Precio total</span>
                <span className="text-emerald-400 font-bold text-lg">${miembro.precio} MXN</span>
              </div>
            </div>
          </div>

          {/* Conversión de moneda */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">💱</span>
              <h3 className="text-lg font-semibold text-white">Convertir Precio</h3>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              Convierte el precio de la membresía a otras monedas en tiempo real.
            </p>

            <div className="flex gap-2 mb-4 flex-wrap">
              {['USD', 'EUR', 'GBP', 'CAD'].map(moneda => (
                <button
                  key={moneda}
                  onClick={() => handleCambioMoneda(moneda)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    monedaDestino === moneda
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {moneda}
                </button>
              ))}
            </div>

            {conversion && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-1">Precio original</div>
                <div className="text-white font-bold text-xl mb-3">${miembro.precio} MXN</div>
                <div className="text-slate-400 text-sm mb-1">Equivale a</div>
                <div className="text-emerald-400 font-bold text-3xl">
                  ${conversion.monto_convertido.toFixed(2)} {monedaDestino}
                </div>
                <div className="text-slate-500 text-xs mt-2">
                  Tasa: 1 MXN = {conversion.tasa.toFixed(4)} {monedaDestino}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}