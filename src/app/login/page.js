'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUsuario } from '../utils/api/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const data = await loginUsuario(form.email, form.password);

      if (data.error) {
        setError(data.mensaje);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      router.push('/dashboard');
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md">

        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏋️</div>
          <h1 className="text-3xl font-bold text-white">FitnessStudio</h1>
          <p className="text-slate-400 mt-2">Sistema de Gestión de Gimnasio</p>
        </div>

        {/* Card del formulario */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Iniciar Sesión</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@gimnasio.com"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Credenciales de prueba */}
          <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-400 text-xs font-semibold mb-2">CREDENCIALES DE PRUEBA:</p>
            <p className="text-slate-300 text-xs">👑 Admin: admin@gimnasio.com / Admin123!</p>
            <p className="text-slate-300 text-xs mt-1">👤 Usuario: user@gimnasio.com / User123!</p>
          </div>
        </div>

      </div>
    </div>
  );
}