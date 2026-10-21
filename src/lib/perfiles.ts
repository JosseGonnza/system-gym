import type { Perfil, PerfilId } from './types';

export const PERFILES: Perfil[] = [
  { id: 'jose', nombre: 'Jose', tema: 'nothing', emoji: '🔴', usaJornadas: false, modoSencillo: false },
  { id: 'yasmina', nombre: 'Yasmina', tema: 'otono', emoji: '🍂', usaJornadas: false, modoSencillo: true },
];

export const PERFIL_POR_DEFECTO: PerfilId = 'jose';

export function esPerfilValido(x: unknown): x is PerfilId {
  return typeof x === 'string' && PERFILES.some((p) => p.id === x);
}

export const perfil = (id: PerfilId): Perfil => PERFILES.find((p) => p.id === id)!;
