import { describe, expect, it } from 'vitest';
import { EXTRA, aSnack, buscar, macrosDe, nuevoAlimento, todos, type Alimento } from '../src/lib/alimentos';
import { PRODUCTOS } from '../src/lib/casa';

const lista = todos();
const a = (id: string) => {
  const x = lista.find((y) => y.id === id);
  if (!x) throw new Error(`Falta ${id}`);
  return x;
};

describe('la lista de alimentos', () => {
  it('junta los productos de la compra y los de fuera de la carta', () => {
    for (const id of Object.keys(PRODUCTOS)) expect(a(id).por100).toEqual(PRODUCTOS[id].por100);
    for (const x of EXTRA) expect(a(x.id).nombre).toBe(x.nombre);
  });

  it('trae lo que Jose come normalmente', () => {
    for (const id of ['fuet', 'chorizo', 'platano', 'polvoron', 'mandarina', 'kiwi', 'yogur-proteina', 'evowhey', 'leche-entera']) a(id);
  });

  it('ningún id repetido', () => {
    expect(new Set(lista.map((x) => x.id)).size).toBe(lista.length);
  });

  it('las kcal cuadran con los macros (±15 %, Atwater 4-4-9)', () => {
    for (const x of lista) {
      const { kcal, prot, hc, grasa } = x.por100;
      const atwater = prot * 4 + hc * 4 + grasa * 9;
      expect(Math.abs(atwater - kcal) / kcal, x.id).toBeLessThan(0.15);
    }
  });

  it('va en orden alfabético español', () => {
    const nombres = lista.map((x) => x.nombre);
    expect(nombres).toEqual([...nombres].sort(new Intl.Collator('es').compare));
  });

  it('los propios sustituyen al de la lista con el mismo id y se marcan', () => {
    const mio: Alimento = { id: 'evowhey', nombre: 'Evowhey (mi etiqueta)', por100: { kcal: 380, prot: 72.6, hc: 9, grasa: 5.5 } };
    const l = todos([mio]);
    expect(l.filter((x) => x.id === 'evowhey')).toEqual([{ ...mio, propio: true }]);
  });

  it('y los nuevos se suman a la lista', () => {
    const mio: Alimento = { id: 'propio-crema-lentejas', nombre: 'Crema de lentejas', por100: { kcal: 61, prot: 4, hc: 8, grasa: 1.2 } };
    expect(todos([mio])).toHaveLength(lista.length + 1);
  });
});

describe('buscar', () => {
  it('sin tildes ni mayúsculas, por el principio de cualquier palabra', () => {
    expect(buscar(lista, 'platano').map((x) => x.id)).toContain('platano');
    expect(buscar(lista, 'POLVO').map((x) => x.id)).toEqual(['polvoron']);
    expect(buscar(lista, 'pollo').map((x) => x.id)).toContain('pollo');
  });

  it('todas las palabras tienen que estar', () => {
    expect(buscar(lista, 'leche ent').map((x) => x.id)).toEqual(['leche-entera']);
  });

  it('primero los que empiezan por lo buscado', () => {
    const r = buscar(lista, 'pan');
    expect(r[0].nombre.toLowerCase().startsWith('pan')).toBe(true);
  });

  it('vacío no devuelve nada', () => {
    expect(buscar(lista, '  ')).toEqual([]);
  });

  it('corta en el máximo pedido', () => {
    expect(buscar(lista, 'a', 3)).toHaveLength(3);
  });
});

describe('macrosDe', () => {
  it('por regla de tres sobre 100 g', () => {
    expect(macrosDe(a('leche-entera'), 250)).toEqual({ kcal: 157.5, prot: 7.75, hc: 11.5, grasa: 9 });
  });

  it('pesado hecho: divide por lo que cambia el peso al cocinar', () => {
    // Arroz: 347 kcal en seco y triplica casi su peso (×2,7).
    expect(macrosDe(a('arroz'), 270, true).kcal).toBeCloseTo(347, 5);
    // Pollo: 106 kcal en crudo y se queda en el 75 % del peso.
    expect(macrosDe(a('pollo'), 75, true).prot).toBeCloseTo(22, 5);
  });

  it('si no cambia al cocinar, «hecho» no altera nada', () => {
    expect(macrosDe(a('kiwi'), 100, true)).toEqual(a('kiwi').por100);
  });
});

describe('aSnack', () => {
  it('un alimento: nombre y gramos, macros redondeados y las pesadas guardadas', () => {
    const s = aSnack([{ id: 'platano', g: 120 }], lista);
    expect(s.t).toBe('Plátano · 120 g');
    expect(s.kcal).toBe(Math.round((a('platano').por100.kcal * 120) / 100));
    expect(s.items).toEqual([{ id: 'platano', g: 120 }]);
  });

  it('el batido: varios alimentos suman, con el nombre que le pongas', () => {
    const s = aSnack(
      [
        { id: 'evowhey', g: 30 },
        { id: 'leche-entera', g: 300 },
      ],
      lista,
      '  Batido  ',
    );
    const e = macrosDe(a('evowhey'), 30);
    const l = macrosDe(a('leche-entera'), 300);
    expect(s).toEqual({
      t: 'Batido',
      kcal: Math.round(e.kcal + l.kcal),
      p: Math.round(e.prot + l.prot),
      hc: Math.round(e.hc + l.hc),
      grasa: Math.round(e.grasa + l.grasa),
      items: [
        { id: 'evowhey', g: 30 },
        { id: 'leche-entera', g: 300 },
      ],
    });
  });

  it('sin nombre, lista lo que lleva y marca lo pesado hecho', () => {
    const s = aSnack(
      [
        { id: 'arroz', g: 200, hecho: true },
        { id: 'pollo', g: 150, hecho: true },
      ],
      lista,
    );
    expect(s.t).toBe('Arroz 200 g hecho + Pechuga de pollo 150 g hecho');
  });

  it('las pesadas de 0 g o de un alimento que ya no existe no cuentan', () => {
    const s = aSnack(
      [
        { id: 'kiwi', g: 0 },
        { id: 'borrado', g: 50 },
        { id: 'kiwi', g: 90 },
      ],
      lista,
    );
    expect(s.items).toEqual([{ id: 'kiwi', g: 90 }]);
    expect(s.t).toBe('Kiwi · 90 g');
  });
});

describe('nuevoAlimento', () => {
  const campos = { nombre: '  Yogur Hacendado +prot ', kcal: '56', prot: '10', hc: '3,9', grasa: '0,2' };

  it('crea uno propio con id nuevo y coma decimal', () => {
    const r = nuevoAlimento(campos, lista);
    expect(r).toEqual({
      ok: true,
      alimento: { id: 'propio-yogur-hacendado-prot', nombre: 'Yogur Hacendado +prot', por100: { kcal: 56, prot: 10, hc: 3.9, grasa: 0.2 } },
    });
  });

  it('no repite un id que ya existe', () => {
    const ya: Alimento = { id: 'propio-yogur-hacendado-prot', nombre: 'x', por100: { kcal: 1, prot: 0, hc: 0, grasa: 0 } };
    const r = nuevoAlimento(campos, [...lista, ya]);
    expect(r.ok && r.alimento.id).toBe('propio-yogur-hacendado-prot-2');
  });

  it('al editar uno de la lista conserva su id y su forma de cocinarse', () => {
    const r = nuevoAlimento({ ...campos, nombre: 'Arroz' }, lista, a('arroz'));
    expect(r.ok && r.alimento).toMatchObject({ id: 'arroz', cocido: 2.7, estado: 'en seco' });
  });

  it('pide nombre y kcal; los macros que falten cuentan 0', () => {
    expect(nuevoAlimento({ ...campos, nombre: ' ' }, lista)).toEqual({ ok: false, error: expect.stringMatching(/nombre/i) });
    expect(nuevoAlimento({ ...campos, kcal: '' }, lista)).toEqual({ ok: false, error: expect.stringMatching(/kcal/i) });
    const r = nuevoAlimento({ ...campos, hc: '', grasa: '' }, lista);
    expect(r.ok && r.alimento.por100).toEqual({ kcal: 56, prot: 10, hc: 0, grasa: 0 });
  });

  it('rechaza números raros', () => {
    expect(nuevoAlimento({ ...campos, prot: '-3' }, lista).ok).toBe(false);
    expect(nuevoAlimento({ ...campos, kcal: '1200' }, lista).ok).toBe(false);
    expect(nuevoAlimento({ ...campos, prot: '120' }, lista).ok).toBe(false);
  });
});
