import { describe, expect, it } from 'vitest';
import type { FilaSerie } from '../src/lib/datos';
import { aCSV, COLUMNAS, cumple, filtrar, ordenar, resumen } from '../src/lib/tabla';

const fila = (p: Partial<FilaSerie>): FilaSerie =>
  ({
    id: 'x',
    sesionId: 's',
    fecha: '2026-11-17',
    semana: '2026-S47',
    rutina: 'R',
    dia: 'Empuje',
    ejercicio: 'Press banca',
    ejercicioId: 'press-banca',
    musculo: 'Pecho',
    patron: 'empujeH',
    implemento: 'multipower',
    n: 1,
    kg: 30,
    lastre: null,
    kgReal: 60,
    reps: 5,
    seg: null,
    estado: 'completada',
    e1rm: 70,
    tonelaje: 300,
    sensacion: '',
    molestia: false,
    sueno: 8,
    energia: 4,
    ...p,
  }) as FilaSerie;

describe('cumple', () => {
  it('vacío deja pasar todo', () => {
    expect(cumple(null, '', 'num')).toBe(true);
    expect(cumple('x', '   ', 'texto')).toBe(true);
  });

  it('texto: contiene, sin mayúsculas ni tildes', () => {
    expect(cumple('Curl de bíceps', 'BICEPS', 'texto')).toBe(true);
    expect(cumple('Curl de bíceps', 'banca', 'texto')).toBe(false);
  });

  it('texto con = busca la palabra exacta', () => {
    expect(cumple('Pecho', '=pecho', 'texto')).toBe(true);
    expect(cumple('Pecho alto', '=pecho', 'texto')).toBe(false);
  });

  it('texto con ! excluye', () => {
    expect(cumple('fallo', '!fallo', 'texto')).toBe(false);
    expect(cumple('completada', '!fallo', 'texto')).toBe(true);
  });

  it('número: igual, comparadores y rango, con coma decimal', () => {
    expect(cumple(8, '8', 'num')).toBe(true);
    expect(cumple(8, '>=8', 'num')).toBe(true);
    expect(cumple(8, '>8', 'num')).toBe(false);
    expect(cumple(62.5, '<62,6', 'num')).toBe(true);
    expect(cumple(70, '60..80', 'num')).toBe(true);
    expect(cumple(81, '60..80', 'num')).toBe(false);
  });

  it('número: un valor vacío no cumple ningún filtro', () => {
    expect(cumple(null, '>0', 'num')).toBe(false);
  });

  it('fecha: prefijo, comparadores y rango', () => {
    expect(cumple('2026-11-17', '2026-11', 'fecha')).toBe(true);
    expect(cumple('2026-10-17', '2026-11', 'fecha')).toBe(false);
    expect(cumple('2026-11-17', '>=2026-11-01', 'fecha')).toBe(true);
    expect(cumple('2026-11-17', '2026-11-01..2026-11-10', 'fecha')).toBe(false);
  });

  it('booleano: sí / no', () => {
    expect(cumple(true, 'sí', 'bool')).toBe(true);
    expect(cumple(false, 'si', 'bool')).toBe(false);
    expect(cumple(false, 'no', 'bool')).toBe(true);
  });

  it('una expresión que no se entiende como número no filtra (no deja la tabla vacía por una tecla)', () => {
    expect(cumple(8, '>', 'num')).toBe(true);
  });
});

describe('filtrar', () => {
  it('combina los filtros de varias columnas', () => {
    const filas = [fila({ id: 'a', reps: 5 }), fila({ id: 'b', reps: 10 }), fila({ id: 'c', reps: 10, musculo: 'Espalda' })];
    expect(filtrar(filas, { reps: '>=8', musculo: 'pecho' }).map((f) => f.id)).toEqual(['b']);
  });
});

describe('ordenar', () => {
  it('ordena por número y deja los vacíos al final en los dos sentidos', () => {
    const filas = [fila({ id: 'a', e1rm: 50 }), fila({ id: 'b', e1rm: null }), fila({ id: 'c', e1rm: 70 })];
    expect(ordenar(filas, 'e1rm', 'asc').map((f) => f.id)).toEqual(['a', 'c', 'b']);
    expect(ordenar(filas, 'e1rm', 'desc').map((f) => f.id)).toEqual(['c', 'a', 'b']);
  });

  it('el texto se ordena en español y es estable', () => {
    const filas = [fila({ id: 'a', ejercicio: 'Remo' }), fila({ id: 'b', ejercicio: 'Ñ' }), fila({ id: 'c', ejercicio: 'Abducción' }), fila({ id: 'd', ejercicio: 'Remo' })];
    expect(ordenar(filas, 'ejercicio', 'asc').map((f) => f.id)).toEqual(['c', 'b', 'a', 'd']);
  });

  it('no toca el array original', () => {
    const filas = [fila({ id: 'a', reps: 9 }), fila({ id: 'b', reps: 1 })];
    ordenar(filas, 'reps', 'asc');
    expect(filas.map((f) => f.id)).toEqual(['a', 'b']);
  });
});

describe('resumen', () => {
  it('cuenta series, sesiones, reps, tonelaje, mejor 1RM y % al fallo', () => {
    const r = resumen([
      fila({ sesionId: 's1', reps: 5, tonelaje: 300, e1rm: 70, estado: 'completada' }),
      fila({ sesionId: 's1', reps: 4, tonelaje: 240, e1rm: 68, estado: 'fallo' }),
      fila({ sesionId: 's2', reps: null, tonelaje: null, e1rm: null, estado: 'corta' }),
      fila({ sesionId: 's2', reps: 8, tonelaje: 0, e1rm: 75, estado: 'completada' }),
    ]);
    expect(r).toEqual({ series: 4, sesiones: 2, reps: 17, tonelaje: 540, e1rmMax: 75, pctFallo: 25 });
  });

  it('sin filas no divide entre cero', () => {
    expect(resumen([])).toEqual({ series: 0, sesiones: 0, reps: 0, tonelaje: 0, e1rmMax: null, pctFallo: 0 });
  });
});

describe('aCSV', () => {
  it('cabecera, punto y coma, coma decimal y comillas cuando hacen falta', () => {
    const cols = COLUMNAS.filter((c) => ['fecha', 'ejercicio', 'kgReal', 'molestia'].includes(c.key));
    const csv = aCSV([fila({ ejercicio: 'Curl; "Z"', kgReal: 14.5, molestia: true })], cols);
    const [cab, linea] = csv.split('\r\n');
    expect(cab).toBe(cols.map((c) => c.titulo).join(';'));
    expect(linea).toBe('2026-11-17;"Curl; ""Z""";14,5;sí');
  });

  it('los vacíos salen como celda vacía', () => {
    const cols = COLUMNAS.filter((c) => c.key === 'e1rm');
    expect(aCSV([fila({ e1rm: null })], cols).split('\r\n')[1]).toBe('');
  });
});
