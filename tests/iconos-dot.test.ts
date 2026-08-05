import { describe, expect, it } from 'vitest';
import { PATRONES, hayPatron, svgDot } from '../src/lib/iconos-dot';

describe('iconos de matriz de puntos', () => {
  it('todos los patrones son rejillas de 7×7', () => {
    for (const [id, filas] of Object.entries(PATRONES)) {
      expect(filas, id).toHaveLength(7);
      for (const fila of filas) expect(fila.length, `${id}: "${fila}"`).toBe(7);
    }
  });

  it('los patrones solo usan # y .', () => {
    for (const [id, filas] of Object.entries(PATRONES)) {
      expect(filas.join('').replace(/[#.]/g, ''), id).toBe('');
    }
  });

  it('ningún patrón está vacío', () => {
    for (const [id, filas] of Object.entries(PATRONES)) {
      expect(filas.join('').includes('#'), id).toBe(true);
    }
  });

  // Van dentro de círculos: si el patrón no está centrado, el glifo baila.
  it('todos los patrones están centrados en la rejilla', () => {
    for (const [id, filas] of Object.entries(PATRONES)) {
      const cols = filas.flatMap((f) => [...f].map((c, x) => (c === '#' ? x : -1))).filter((x) => x >= 0);
      const ys = filas.map((f, y) => (f.includes('#') ? y : -1)).filter((y) => y >= 0);
      const centroX = (Math.min(...cols) + Math.max(...cols)) / 2;
      const centroY = (Math.min(...ys) + Math.max(...ys)) / 2;
      expect(centroX, `${id}: descentrado en horizontal`).toBe(3);
      expect(centroY, `${id}: descentrado en vertical`).toBe(3);
    }
  });

  it('genera un círculo por punto encendido', () => {
    const encendidos = PATRONES['nav-hoy'].join('').split('').filter((c) => c === '#').length;
    expect(svgDot('nav-hoy', 22).match(/<circle/g)).toHaveLength(encendidos);
  });

  it('hereda el color del texto y respeta el tamaño pedido', () => {
    const svg = svgDot('nav-entreno', 26);
    expect(svg).toContain('fill="currentColor"');
    expect(svg).toContain('width="26"');
    expect(svg).toContain('viewBox="0 0 21 21"');
  });

  it('un id desconocido no rompe: devuelve cadena vacía', () => {
    expect(hayPatron('no-existe')).toBe(false);
    expect(svgDot('no-existe', 22)).toBe('');
  });

  it('están los iconos que usa la interfaz', () => {
    for (const id of [
      'nav-hoy', 'nav-entreno', 'nav-dieta', 'nav-progreso',
      'dia-empuje', 'dia-hombro', 'dia-pierna', 'dia-bombeo',
      'ajustes', 'cambiar', 'descanso', 'manana', 'aviso', 'hecho', 'backup', 'record',
    ]) {
      expect(hayPatron(id), id).toBe(true);
    }
  });
});
