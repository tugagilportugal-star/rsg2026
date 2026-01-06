import React, { useEffect, useState } from 'react';
import { getSubmissions, deleteSubmission, setAuthHeader, clearAuthHeader } from '../services/db';
import {
  X, Download, Trash2, Lock, User, Key
} from 'lucide-react';
import { ASSETS } from '../config';
import { FormType } from '../types';

export const AdminView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getSubmissions();
      setData(res);
    } catch {
      setIsAuthenticated(false);
      clearAuthHeader();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !pass) {
      setError('Credenciais inválidas');
      return;
    }

    const auth = 'Basic ' + btoa(`${user}:${pass}`);
    setAuthHeader(auth);
    setIsAuthenticated(true);
    await loadData();
  };

  const handleLogout = () => {
    clearAuthHeader();
    setIsAuthenticated(false);
    setUser('');
    setPass('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja remover este lead permanentemente?')) return;
    try {
      await deleteSubmission(id);
      await loadData();
    } catch {
      handleLogout();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[110] bg-brand-darkBlue/95 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto bg-brand-blue/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-brand-blue" />
            </div>
            <h2 className="text-2xl font-black text-brand-darkBlue">Admin</h2>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={user}
                onChange={e => setUser(e.target.value)}
                placeholder="Utilizador"
                className="w-full pl-12 pr-4 py-3 border rounded-xl"
              />
            </div>

            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-4 py-3 border rounded-xl"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button className="w-full bg-brand-darkBlue text-white py-3 rounded-xl font-bold">
              Entrar
            </button>
            <button type="button" onClick={onClose} className="w-full text-xs text-gray-400 mt-4">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] bg-gray-50 flex flex-col">
      <header className="bg-white border-b p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src={ASSETS.TUGAGIL_LOGO} className="h-8" />
          <span className="font-black text-brand-darkBlue">RSG Lisbon 2026</span>
        </div>
        <button onClick={handleLogout} className="text-sm text-red-500 font-bold">
          Logout
        </button>
      </header>

      <main className="flex-grow overflow-auto p-6">
        {loading ? (
          <p className="text-center text-gray-400">A carregar…</p>
        ) : (
          <table className="w-full bg-white rounded-xl shadow border">
            <thead>
              <tr className="text-xs text-gray-500 uppercase">
                <th className="p-4">Tipo</th>
                <th className="p-4">Nome</th>
                <th className="p-4">Email</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.type}</td>
                  <td className="p-4 font-bold">{item.name}</td>
                  <td className="p-4">{item.email}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 font-bold"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};
