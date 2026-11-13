import { describe, expect, it } from 'vitest';
import { hayTrazo, svgTrazo } from '../src/lib/iconos-trazo';
import { iconoDeDia } from '../src/lib/iconos';
import { RUTINA_YASMINA } from '../src/lib/seed';

describe('iconos de trazo (Grimorio de Yasmina)', () => {
  it('cada día de su rutina tiene glifo de trazo', () => {
    for (const dia of RUTINA_YASMINA.dias) {
      expect(hayTrazo(iconoDeDia(RUTINA_YASMINA.dias, dia)), dia.nombre).toBe(true);
    }
  });

  it('las cuatro pestañas del nav tienen icono', () => {
    for (const id of ['nav-hoy', 'nav-entreno', 'nav-dieta', 'nav-progreso']) {
      expect(hayTrazo(id), id).toBe(true);
    }
  });

  it('pinta un svg del tamaño pedido y nada si no existe', () => {
    expect(svgTrazo('record', 18)).toContain('width="18"');
    expect(svgTrazo('no-existe', 18)).toBe('');
    expect(hayTrazo(undefined)).toBe(false);
  });
});
