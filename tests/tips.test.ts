import { describe, expect, it } from 'vitest';
import { TIPS, hayTip, tipDe } from '../src/lib/tips';

describe('tips de ejecución', () => {
  it('todos dicen dónde se nota y dan al menos dos claves', () => {
    for (const [id, t] of Object.entries(TIPS)) {
      expect(t.donde.trim().length, `${id}: sin "donde"`).toBeGreaterThan(10);
      expect(t.claves.length, `${id}: pocas claves`).toBeGreaterThanOrEqual(2);
      for (const c of t.claves) expect(c.trim().length, `${id}: clave vacía`).toBeGreaterThan(10);
    }
  });

  it('cubre los ejercicios donde la gente se equivoca de músculo', () => {
    // El caso de Yasmina: hace espalda y lo nota en el bíceps.
    for (const id of ['jalon-pecho', 'remo-maquina', 'remo-polea']) {
      expect(tipDe(id)?.error, `${id} necesita corrección de "lo noto en el bíceps"`).toContain('bíceps');
    }
  });

  it('los ejercicios con riesgo llevan su aviso', () => {
    for (const id of ['rumano-mancuerna', 'prensa-horizontal', 'extension-cuadriceps', 'hiperextension']) {
      expect(tipDe(id)?.error, `${id} sin aviso`).toBeTruthy();
    }
  });

  it('cubre las dos rutinas activas', () => {
    const yasmina = [
      'hip-thrust', 'rumano-mancuerna', 'curl-femoral', 'patada-gluteo', 'abduccion-cadera',
      'press-banca-maquina', 'pec-deck', 'elevacion-lateral', 'face-pull', 'extension-triceps-polea',
      'prensa-horizontal', 'extension-cuadriceps', 'gemelo-prensa', 'jalon-pecho', 'remo-maquina',
      'curl-mancuerna', 'plancha', 'dead-bug', 'cardio-cinta', 'cardio-eliptica', 'cardio-bici',
      'cardio-caminar',
    ];
    const jose = [
      'press-banca-maquina', 'jalon-pecho', 'press-inclinado-maquina', 'remo-maquina',
      'fondos-paralelas', 'press-militar-mancuerna', 'elevacion-lateral', 'face-pull', 'curl-z',
      'extension-triceps-polea', 'encogimiento-trapecio', 'prensa-horizontal', 'extension-cuadriceps',
      'curl-femoral', 'gemelo-prensa', 'hiperextension', 'crunch-polea', 'press-banca', 'remo-polea',
      'pec-deck', 'remo-maquina-brazo', 'curl-polea-cuerda', 'elevacion-piernas',
    ];
    for (const id of [...yasmina, ...jose]) expect(hayTip(id), `falta tip: ${id}`).toBe(true);
  });

  it('un id desconocido no rompe', () => {
    expect(hayTip('no-existe')).toBe(false);
    expect(tipDe(undefined)).toBeUndefined();
  });
});
