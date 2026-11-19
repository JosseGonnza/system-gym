import { describe, expect, it } from 'vitest';
import { LINEA, hayLinea, partirGlifos, svgLinea } from '../src/lib/iconos-linea';

describe('iconos de línea (perfil de Jose)', () => {
  it('cubre todos los iconos del perfil de Jose: días, estados, ajustes y jornadas', () => {
    const ids = [
      'dia-empuje', 'dia-hombro', 'dia-pierna', 'dia-bombeo', 'dia-espalda', 'dia-coraza', 'dia-alas', 'dia-raices', 'dia-bomba', 'dia-cardio',
      'sistema', 'descanso', 'record', 'energia', 'sueno', 'nota', 'alarma', 'medidas', 'superserie', 'rest-timer', 'ajustes', 'fallo',
      'backup', 'import-export', 'perfil', 'previsto', 'cambiar', 'manana', 'aviso', 'hecho',
      'borrar', 'camara', 'jor-laboratorio', 'jor-ett', 'jor-libre',
    ];
    expect(ids.filter((id) => !hayLinea(id))).toEqual([]);
  });

  it('dibuja con trazo fino sobre rejilla de 24 y hereda el color', () => {
    const svg = svgLinea('record', 20);
    expect(svg).toContain('viewBox="0 0 24 24"');
    expect(svg).toContain('width="20"');
    expect(svg).toContain('stroke="currentColor"');
    expect(svg).toContain('stroke-width="1.6"');
    expect(svg).toContain(LINEA.record);
  });

  it('un id desconocido no dibuja nada', () => {
    expect(hayLinea('no-existe')).toBe(false);
    expect(hayLinea(undefined)).toBe(false);
    expect(svgLinea('no-existe', 20)).toBe('');
  });
});

describe('partirGlifos', () => {
  it('cambia el emoji de delante por su icono', () => {
    expect(partirGlifos('▶ Empezar entreno')).toEqual([{ icono: 'play' }, 'Empezar entreno']);
    expect(partirGlifos('🗑 Descartar')).toEqual([{ icono: 'borrar' }, 'Descartar']);
  });

  it('entiende el selector de variante (⬇️, ⚠️)', () => {
    expect(partirGlifos('⬇️ Exportar JSON')).toEqual([{ icono: 'bajar' }, 'Exportar JSON']);
    expect(partirGlifos('⚠️')).toEqual([{ icono: 'aviso' }]);
  });

  it('quita los emojis que no tienen icono', () => {
    expect(partirGlifos('Estás en el perfil de Jose 🔴')).toEqual(['Estás en el perfil de Jose']);
  });

  it('deja en paz el texto sin emojis, también las marcas ✓ y ✗', () => {
    expect(partirGlifos('Siguiente →')).toBeNull();
    expect(partirGlifos('✓ Guardado')).toBeNull();
    expect(partirGlifos('Hecho hoy ✓')).toBeNull();
    expect(partirGlifos('✗')).toBeNull();
  });
});
