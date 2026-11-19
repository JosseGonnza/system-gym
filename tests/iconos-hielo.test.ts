import { describe, expect, it } from 'vitest';
import { hayHielo, svgHielo } from '../src/lib/iconos-hielo';
import { iconoDeDia } from '../src/lib/iconos';
import { RUTINA_JEIK } from '../src/lib/seed';

describe('iconos de Hielo (Jeik)', () => {
  it('cada día de su rutina tiene icono', () => {
    for (const dia of RUTINA_JEIK.dias) {
      expect(hayHielo(iconoDeDia(RUTINA_JEIK.dias, dia)), dia.nombre).toBe(true);
    }
  });

  it('sus cinco pestañas y lo que se ve en sus pantallas tienen icono', () => {
    const ids = ['nav-hoy', 'nav-entreno', 'nav-comida', 'nav-domingo', 'nav-plan', 'ajustes', 'nota', 'record', 'superserie', 'descanso', 'hecho', 'aviso', 'perfil', 'backup', 'borrar', 'rest-timer', 'camara'];
    for (const id of ids) expect(hayHielo(id), id).toBe(true);
  });

  it('pinta un svg de trazo del tamaño pedido y nada si no existe', () => {
    const svg = svgHielo('record', 18);
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain('width="18"');
    expect(svg).toContain('stroke="currentColor"');
    expect(svgHielo('no-existe', 18)).toBe('');
    expect(hayHielo(undefined)).toBe(false);
  });
});
