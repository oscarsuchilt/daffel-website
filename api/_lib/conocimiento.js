// ═══════════════════════════════════════════════════════════════════
// CONOCIMIENTO DE BARRIO INN — los 5 edificios
//
// Aquí vive TODO lo que el bot sabe. Si cambia algo (un link, una regla,
// una habitación nueva), se edita en este archivo y se sube a GitHub.
// Fuente: anuncios de Airbnb, direct-book, Cloudbeds y Belong (nov-2026),
// más lo que confirmó el equipo.
// ═══════════════════════════════════════════════════════════════════

export const SITIO = 'https://www.barrioinn.com';

// ─── Sistemas de reserva ───
export const SISTEMAS = {
  directbook: 'Motor de reservas oficial (direct-book)',
  airbnb: 'Airbnb',
  cloudbeds: 'Motor de reservas oficial (Cloudbeds)',
  belong: 'App Belong (renta mensual)',
};

// ═══════════════════════════════════════════════════════════════════
// EDIFICIOS Y UNIDADES
// id de unidad = "<edificio>-<numero>"  (lo usa la herramienta de links)
// ═══════════════════════════════════════════════════════════════════
export const EDIFICIOS = {
  // ─────────────────────────────────────────────────────────────────
  morelos: {
    nombre: 'Barrio Inn Morelos (Morelos Suites)',
    alias: ['Morelos', 'Morelos Suites'],
    sistema: 'directbook',
    slug: 'morelossuites',
    tipo: 'Suites por noche',
    direccion: 'Calle José María Morelos y Pavón 1091, Centro Histórico / Barrio Antiguo, Monterrey',
    resumen: 'Suites privadas, TODAS con baño privado, en pleno Barrio Antiguo rodeadas de bares, cafés y restaurantes.',
    incluye: 'Baño privado con regadera, TV, aire acondicionado (mini split), escritorio, armario, amenidades de baño. Habitaciones libres de humo. Acceso autónomo con chapa digital.',
    comoReservar: [
      'Abrir el link, elegir fechas y número de huéspedes (sin fechas no aparecen precios).',
      'Elegir habitación y tarifa: *No reembolsable* (se paga hoy) o *Flexible* (cancelación gratis hasta la fecha que indica el motor y "reserve ahora, pague después"; a veces se agota).',
      'Llenar datos (nombre, correo, teléfono, hora estimada de llegada) y "Proceder al pago".',
      'Pago con tarjeta Visa, Mastercard, American Express o Discover, en MXN o USD. El precio ya incluye IVA e impuesto de hospedaje.',
    ],
    notas: [
      'Si el motor dice "no tiene disponibilidad", sugiere otras fechas u otro edificio (Padre Mier o Abasolo están muy cerca).',
      'El cargo en la tarjeta puede aparecer como "Urbazidora Habitare": es la empresa operadora de Barrio Inn.',
      'Máximo 2 personas por habitación; para grupos la herramienta arma el link con varias habitaciones.',
    ],
    unidades: [
      { n: '3', nombre: 'Single Suite #3', cama: 'individual', personas: 1, extras: '~10 m², frigobar' },
      { n: '22', nombre: 'Single Suite #22', cama: 'individual', personas: 1, extras: '~10 m², frigobar' },
      { n: '24', nombre: 'Single Suite #24', cama: 'individual', personas: 1, extras: '~10 m², frigobar' },
      { n: '25', nombre: 'Queen Suite #25', cama: 'queen', personas: 2, extras: '~12 m²' },
      { n: '26', nombre: 'Queen Suite #26', cama: 'queen', personas: 2, extras: '~12 m²' },
      { n: '21', nombre: 'Queen Suite #21', cama: 'queen', personas: 2, extras: '~15 m²' },
      { n: '5', nombre: 'Cama Matrimonial #5', cama: 'matrimonial', personas: 2, extras: '~15 m², cafetera compacta, microondas' },
      { n: '6', nombre: 'Cama Matrimonial #6', cama: 'matrimonial', personas: 2, extras: '~15 m², cafetera compacta, microondas' },
      { n: '7', nombre: 'Cama Matrimonial #7', cama: 'matrimonial', personas: 2, extras: '~15 m², cafetera compacta, microondas' },
      { n: '23', nombre: 'Cama Matrimonial #23', cama: 'matrimonial', personas: 2, extras: '~15 m²' },
      { n: '2', nombre: 'Cama Matrimonial #2', cama: 'matrimonial', personas: 2, extras: '~20 m², la más amplia de las matrimoniales' },
      { n: '4', nombre: 'King Size #4', cama: 'king', personas: 2, extras: '~20 m²' },
      { n: '20', nombre: 'King Size #20', cama: 'king', personas: 2, extras: '~20 m², amplia' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  hostal: {
    nombre: 'Barrio Inn Hostal (Aldea / Fonda & Aldea Morelos)',
    alias: ['Hostal', 'Aldea', 'Fonda', 'Fonda Morelos', 'Fonda & Aldea'],
    sistema: 'airbnb',
    tipo: 'Habitaciones privadas por noche, estilo hostal con alberca',
    direccion: 'Barrio Antiguo, Monterrey. La entrada es por la Fonda Morelos (restaurante); la ubicación exacta llega en las instrucciones de Airbnb.',
    resumen: 'Habitaciones privadas con llave, ambiente de hostal con ALBERCA al aire libre, patio con mobiliario y parrilla, y entrada por la Fonda Morelos. La opción más económica para estar en el corazón del Barrio Antiguo.',
    incluye: 'Habitación privada con llave, aire acondicionado y calefacción, Smart TV personal, WiFi de alta velocidad, café de cortesía, ropa de cama. Cocineta compartida (microondas, parrilla eléctrica, refrigerador, cafetera, tostadora). Plancha comunal. Alberca compartida al aire libre de 9:00 am a 12:30 am.',
    banos: 'Baños COMPARTIDOS con regadera: 3 de hombres y 3 de mujeres. Ninguna habitación del Hostal tiene baño privado (si buscan baño privado, ofrece Morelos, Abasolo o las suites King de Padre Mier).',
    reglas: [
      'Prohibidas las visitas: solo entran huéspedes de la reservación.',
      'No hay early check-in ni late check-out: si quieren llegar antes, reservan la noche anterior; si quieren salir más tarde, una noche adicional.',
      'No hay guarda de equipaje antes del check-in ni después del check-out.',
      'Cancelaciones: directamente con Airbnb, según la política de su reserva.',
    ],
    unidades: [
      { n: '13', nombre: 'Habitación #13', cama: 'individual', personas: 1, extras: 'con ventana', airbnb: '1395177004487138871', destaca: '4.94★ — Favorito entre huéspedes' },
      { n: '05', nombre: 'Habitación #05', cama: 'individual', personas: 1, extras: 'zona de trabajo, botiquín, ventilador de techo', airbnb: '1376411231333404172', destaca: '4.78★ con 54 reseñas' },
      { n: '07', nombre: 'Habitación #07', cama: 'individual', personas: 1, extras: 'zona de trabajo, mininevera', airbnb: '1389984698699340821', destaca: '4.71★' },
      { n: '04', nombre: 'Habitación #04', cama: 'individual', personas: 1, extras: 'zona de trabajo', airbnb: '1376981160670580106' },
      { n: '01', nombre: 'Habitación #01', cama: 'matrimonial', personas: 2, extras: 'ventilador de techo, la del Hostal para parejas', airbnb: '1387136096293334870', destaca: 'la más reservada (67 reseñas)' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  padremier: {
    nombre: 'Barrio Inn Padre Mier (Hostal & Suites)',
    alias: ['Padre Mier', 'PM'],
    sistema: 'cloudbeds',
    link: 'https://us2.cloudbeds.com/es/reservation/US4usL?currency=mxn',
    tipo: 'Habitaciones y suites por noche',
    direccion: 'Padre Mier 1093, Centro, Monterrey, CP 64000 (Barrio Antiguo)',
    resumen: 'Habitaciones individuales y matrimoniales con baño compartido a buen precio, y 3 suites King con baño privado. A 300–600 m de la Macroplaza y 400–500 m del MARCO.',
    incluye: 'Aire acondicionado, TV por cable, WiFi gratis, espacio para ropa, agua de cortesía, cocineta compartida, limpieza profesional y desinfección diaria de áreas comunes, check-in/check-out exprés sin contacto con chapa digital. Libre de humo. Factura disponible.',
    precioReferencia: 'Como referencia, las individuales andan desde unos $900 MXN por noche entre semana (más en fines de semana y temporada). El precio exacto sale al poner fechas.',
    comoReservar: [
      'Abrir el link, poner fechas y huéspedes y darle Buscar.',
      'Elegir la habitación, darle "Añadir" y escoger cuántas personas.',
      'Llenar datos (nombre, país, correo, teléfono). Opcional: protección "Cancelar por cualquier motivo".',
      'Aceptar términos y pagar con tarjeta en la página segura de Cloudbeds.',
    ],
    politicas: [
      'Se pide tarjeta al reservar; el saldo se cobra 2 días antes del check-in. Impuestos incluidos.',
      'Cancelación con reembolso total hasta 48 horas antes de la llegada; después de eso no hay reembolso.',
      'Solo pueden entrar personas registradas; no fiestas ni reuniones sin autorización; no fumar en las suites (hay cargo de limpieza); respetar el descanso de los demás.',
    ],
    unidades: [
      { n: '3', nombre: 'Habitación #3', cama: 'individual', personas: 1, extras: 'baño compartido' },
      { n: '4', nombre: 'Habitación #4', cama: 'individual', personas: 1, extras: 'baño compartido' },
      { n: '5', nombre: 'Habitación #5', cama: 'individual', personas: 1, extras: 'baño compartido' },
      { n: '6', nombre: 'Habitación #6', cama: 'individual', personas: 1, extras: 'baño compartido' },
      { n: '7', nombre: 'Habitación #7', cama: 'individual', personas: 1, extras: 'baño compartido' },
      { n: '8', nombre: 'Habitación #8', cama: 'individual', personas: 1, extras: 'baño compartido' },
      { n: '9', nombre: 'Habitación #9', cama: 'individual', personas: 1, extras: 'baño compartido' },
      { n: '1', nombre: 'Habitación #1', cama: 'matrimonial', personas: 2, extras: 'baño compartido' },
      { n: '2', nombre: 'Habitación #2', cama: 'matrimonial', personas: 2, extras: 'baño compartido' },
      { n: '10', nombre: 'Habitación #10', cama: 'matrimonial', personas: 2, extras: 'baño compartido' },
      { n: '11', nombre: 'Habitación #11', cama: 'matrimonial', personas: 2, extras: 'baño compartido' },
      { n: '12', nombre: 'Habitación #12', cama: 'matrimonial', personas: 2, extras: 'baño compartido' },
      { n: '13', nombre: 'Habitación #13', cama: 'matrimonial', personas: 2, extras: 'baño compartido' },
      { n: '14', nombre: 'Suite King #14', cama: 'king', personas: 2, extras: 'BAÑO PRIVADO, mini cocina con microondas y mini refri, área de comedor' },
      { n: '15', nombre: 'Suite King #15', cama: 'king', personas: 2, extras: 'BAÑO PRIVADO, mini cocina con microondas y mini refri, área de comedor' },
      { n: '16', nombre: 'Suite King #16', cama: 'king', personas: 2, extras: 'BAÑO PRIVADO, frigobar y ESCRITORIO (ideal para trabajar)' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  abasolo: {
    nombre: 'Barrio Inn Abasolo (Casa Abasolo)',
    alias: ['Abasolo', 'Casa Abasolo'],
    sistema: 'airbnb',
    tipo: 'Suites minimalistas por noche (y estancias largas de 28+ días)',
    direccion: 'Barrio Antiguo, primer cuadro de Monterrey (ubicación exacta en las instrucciones de Airbnb). El 7-Eleven está a 10 m; cerca del Hospital San Vicente.',
    resumen: 'Suites con decoración minimalista y moderna, ideales para viajes de trabajo: escritorio, WiFi rápido (hasta ~100 Mbps, verificado para videollamadas), factura y la mejor ubicación del Barrio Antiguo. Ubicación calificada 4.9–5.0 por los huéspedes.',
    incluye: 'Minisplit frío/calor, ventilador de techo, WiFi verificado de alta velocidad, TV, agua caliente siempre, plancha, cortinas opacas, champú y jabón, entrada independiente y llegada autónoma con caja de seguridad para llaves. Estacionamiento gratis en la calle y estacionamientos de pago cerca.',
    reglas: [
      'Se aceptan estancias largas de 28 días o más.',
      'Cancelaciones: directamente con Airbnb, según la política de su reserva.',
    ],
    unidades: [
      { n: '2', nombre: 'Suite #2', cama: 'matrimonial', personas: 2, extras: 'baño privado completo, sofá para dos, escritorio, mininevera', airbnb: '865916915126616151', destaca: '4.83★ con 119 reseñas — Favorito entre huéspedes' },
      { n: '3', nombre: 'Suite #3', cama: 'doble', personas: 2, extras: 'baño privado completo, sofá, escritorio, cafetera', airbnb: '865921467779918007', destaca: '4.83★ con 90 reseñas' },
      { n: '1', nombre: 'Suite #1', cama: 'doble', personas: 2, extras: 'baño privado completo, COCINA dentro de la suite (microondas, parrilla eléctrica, utensilios, mininevera), TV de 55", escritorio, sofá', airbnb: '858170155379617698', destaca: 'la única con cocina propia, ideal para estancias largas' },
      { n: '7', nombre: 'Habitación pequeña #7', cama: 'individual', personas: 1, extras: 'compacta y económica, TV, escritorio; baño compartido a un costado (se limpia y surte diario); sin ventana', airbnb: '865924776443108695', destaca: '4.69★ con 178 reseñas, la más reservada' },
      { n: '8', nombre: 'Habitación pequeña #8', cama: 'individual', personas: 1, extras: 'compacta y económica, TV, escritorio; baño compartido a un costado (se limpia y surte diario); sin ventana', airbnb: '865926407502521833', destaca: 'ubicación 5.0★' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  roma: {
    nombre: 'Barrio Inn Roma (Zona Tec)',
    alias: ['Roma', 'Pirineos', 'Pirineos 1012', 'Zona Tec', 'Tec'],
    sistema: 'belong',
    tipo: 'Departamentos y lofts amueblados en RENTA MENSUAL',
    direccion: 'Pirineos 1012, Roma Sur, Monterrey (Zona Tec), a 8–10 minutos caminando del Tec de Monterrey',
    resumen: 'Edificio premium 100% remodelado, amueblado y equipado con muebles nuevos. Ideal para estudiantes, jóvenes profesionistas e inversionistas. 17 departamentos: en la página se muestran 5 modelos; aquí están 15, los otros son modelos similares (si preguntan por uno que no esté aquí, se ve con el dueño).',
    incluye: 'TODOS los servicios incluidos en la renta: WiFi, agua, luz, gas, lavandería y aire acondicionado. Terraza, lavandería, patio de convivencia y personal 24/7.',
    condiciones: [
      'El precio publicado es POR MES.',
      'Depósito: equivalente a un mes de renta.',
      'Sin aval y sin papeleo: todo el proceso es desde la app de Belong.',
      'No hay plazo mínimo: los periodos son abiertos y el plazo se platica con el dueño. Para estancias cortas (semanas o días) el precio cambia y se cotiza con el dueño.',
      'Mascotas: SÍ se aceptan, platicándolo con el dueño y con un depósito extra que depende de la mascota (pez, ave, perro, gato, etc.).',
    ],
    comoReservar: [
      'Abrir el link de Belong del departamento.',
      'Crear cuenta en Belong (los inquilinos se verifican, es una forma segura de rentar).',
      '"Agendar visita" (sin costo, se coordina la fecha con el anfitrión) o "Enviar mensaje" para preguntar.',
      'Si el que quieren dice "No disponible", pueden mandar mensaje en Belong para enterarse cuando se libere, o elegir un modelo similar.',
    ],
    unidades: [
      { n: '1A', nombre: 'Loft 1A (piso 1)', tipoU: 'individual', personas: 1, renta: 10500, extras: 'recámara privada, baño compartido con 1 persona, cocina comunitaria', belong: 'https://admin.belongmx.com/propiedades/44c696ad-8e89-425d-9997-4b9900921be9' },
      { n: '1B', nombre: 'Loft 1B (piso 1)', tipoU: 'individual', personas: 1, renta: 12500, extras: 'BAÑO PRIVADO, cocina comunitaria' },
      { n: '1C', nombre: 'Loft 1C (piso 1)', tipoU: 'recámara doble', personas: 2, renta: 15000, extras: 'recámara doble con 2 camas, baño compartido, cocina comunitaria, escritorio', belong: 'https://admin.belongmx.com/propiedades/5a978a40-3eb2-476d-bdb1-4328e184d4bd' },
      { n: '1D', nombre: 'Loft 1D (piso 1)', tipoU: 'individual', personas: 1, renta: 12500, extras: 'BAÑO PRIVADO, cocina comunitaria' },
      { n: '2A', nombre: 'Loft 2A (piso 2)', tipoU: 'individual', personas: 1, renta: 10500, extras: 'recámara privada, baño compartido con 1 persona, cocina comunitaria, escritorio, TV', belong: 'https://admin.belongmx.com/propiedades/1cf8f41f-842e-4e9e-a92d-c0ce401e4c6c' },
      { n: '2B', nombre: 'Loft 2B (piso 2)', tipoU: 'individual', personas: 1, renta: 12500, extras: 'baño compartido, cocina comunitaria' },
      { n: '2C', nombre: 'Loft 2C (piso 2)', tipoU: 'individual', personas: 1, renta: 15000, extras: 'BAÑO PRIVADO, cocina comunitaria' },
      { n: '2D', nombre: 'Loft 2D (piso 2)', tipoU: 'individual', personas: 1, renta: 12500, extras: 'BAÑO PRIVADO, cocina comunitaria' },
      { n: 'D2', nombre: 'Departamento 2', tipoU: 'departamento', personas: 1, renta: 14000, extras: 'BAÑO PRIVADO, cocina compartida' },
      { n: 'D3', nombre: 'Departamento 3', tipoU: 'departamento completo', personas: 2, renta: 17000, extras: 'muy amplio: recámara, BAÑO PRIVADO y COCINA PRIVADA — todo propio' },
      { n: '3A', nombre: 'Loft 3A (piso 3)', tipoU: 'individual', personas: 1, renta: 14000, extras: 'cocineta integrada, recámara y BAÑO PRIVADO', belong: 'https://admin.belongmx.com/propiedades/291b2113-a8fd-4845-8e65-9d8ed3d66c2b' },
      { n: '3B', nombre: 'Loft 3B (piso 3)', tipoU: '2 recámaras', personas: 2, renta: 22000, extras: '2 RECÁMARAS, baño compartido entre ellas, cocineta integrada — ideal para 2 amigos o roomies', },
      { n: '3D', nombre: 'Loft 3D (piso 3)', tipoU: 'individual', personas: 1, renta: 14000, extras: 'cocineta integrada, recámara amplia y BAÑO PRIVADO, cama King', belong: 'https://admin.belongmx.com/propiedades/b3b3017d-d6d6-4856-94f3-6fae74dd8662' },
      { n: '4A', nombre: 'Loft 4A (piso 4)', tipoU: 'individual', personas: 1, renta: 11000, extras: 'BAÑO PRIVADO, cocina compartida del piso, TERRAZA CON VISTA' },
      { n: '4B', nombre: 'Loft 4B (piso 4)', tipoU: 'individual', personas: 1, renta: 11000, extras: 'BAÑO PRIVADO, cocina compartida del piso' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════
// INFORMACIÓN GENERAL (aplica a todos los edificios)
// ═══════════════════════════════════════════════════════════════════
export const INFO_GENERAL = `
# BARRIO INN — información general
Hospedaje boutique en Monterrey, N.L. con 5 edificios: 4 en el Barrio Antiguo / Centro (Morelos, Hostal, Padre Mier, Abasolo) para estancias por noche, y 1 en la Roma, Zona Tec (renta mensual).
Página: ${SITIO} (es la presentación; cada edificio se reserva en su propio sistema).
Instagram: https://www.instagram.com/barrioinn
Anfitrión en Airbnb: José ("Pepe") y su equipo de coanfitriones — 4.73★ con más de 1,750 reseñas, responde en menos de una hora.

## Común a los edificios de noche (Morelos, Hostal, Padre Mier, Abasolo)
- Check-in a partir de las 3:00 pm · Check-out antes de las 11:00 am.
- Sin recepción: llegada 100% autónoma a cualquier hora después de las 3 pm, con chapa digital / caja de llaves y código.
- Reservas de Airbnb: las instrucciones y el código llegan por la app de Airbnb el día de llegada alrededor de las 2:00 pm. Reservas directas (Morelos y Padre Mier): las instrucciones llegan por el sistema de reservas / el equipo antes de la llegada.
- Early check-in / late check-out: no se garantizan; lo seguro es reservar la noche anterior o una noche extra. Si insisten, ofrece consultarlo con el equipo.
- Factura (CFDI): SÍ facturamos. Se genera y envía unos días después de terminar la estancia. En Airbnb, los datos fiscales se mandan por el chat de Airbnb.
- Estacionamiento: no hay estacionamiento propio; hay estacionamientos públicos de pago a pocos metros (y en Abasolo, lugares en la calle).
- Mascotas: oficialmente no se aceptan en estos 4 edificios, pero el dueño es abierto: ofrece consultarlo y escala. (En Roma SÍ, ver Roma.)
- Zona: segura y céntrica, a pasos de bares, antros, restaurantes y museos.

## Distancias desde el Barrio Antiguo
Museo MARCO ~500 m · Macroplaza ~600 m · 7-Eleven 10–100 m · Estación de Metro ~1 km · Cintermex 2.9 km · Paseo Santa Lucía 3.3 km · CAS 3.3 km · Tec de Monterrey 3.8 km · Parque Fundidora 4 km (~10 min) · Estadio BBVA 10 km · Consulado de EE.UU. 15.6 km · San Pedro ~10 min en auto.

## Guía rápida para recomendar
- Lo más económico por noche → individuales del Hostal (con alberca) o de Padre Mier; habitaciones pequeñas de Abasolo.
- Baño privado por noche → Morelos (todas), Abasolo Suites #1/#2/#3, Padre Mier Suites King #14/#15/#16.
- Parejas → Morelos Queen/Matrimonial/King, Abasolo Suite #2 (favorita), Hostal #01, Padre Mier matrimoniales o Suite King.
- Viaje de trabajo / home office → Abasolo (escritorio + WiFi verificado), Padre Mier Suite #16 (escritorio), Morelos.
- Estancia de semanas → Abasolo Suite #1 (cocina propia, 28+ días); de meses o estudiantes del Tec → Roma.
- Grupos → varias habitaciones en Morelos o Padre Mier (motor con varias habitaciones en una reserva).
- Ambiente social y alberca → Hostal.
`.trim();

// ═══════════════════════════════════════════════════════════════════
// LINKS
// ═══════════════════════════════════════════════════════════════════
export function limpiarUrl(u) {
  const s = String(u ?? '').trim();
  if (!/^https?:\/\//i.test(s)) return '';
  try {
    const url = new URL(s);
    if (/(^|\.)airbnb\./i.test(url.hostname)) {
      const m = url.pathname.match(/\/rooms\/(\d+)/);
      return m ? `https://www.airbnb.mx/rooms/${m[1]}` : `https://www.airbnb.mx${url.pathname}`;
    }
    if (/(^|\.)direct-book\.com$/i.test(url.hostname)) {
      const m = url.pathname.match(/\/properties\/([^/?#]+)/);
      if (m) return linkDirectBook(m[1]);
    }
    return s;
  } catch {
    return '';
  }
}

// Reparte personas en habitaciones de máx. 2 (los bebés no cuentan)
export function repartirHabitaciones(adultos = 2, ninos = 0, maxPorHab = 2) {
  const total = Math.max(1, adultos + ninos);
  const habs = Array.from({ length: Math.ceil(total / maxPorHab) }, () => ({ adultos: 0, ninos: 0 }));
  let a = adultos, k = ninos;
  for (const h of habs) if (a > 0) { h.adultos++; a--; }
  for (const h of habs) while (h.adultos + h.ninos < maxPorHab && a > 0) { h.adultos++; a--; }
  for (const h of habs) while (h.adultos + h.ninos < maxPorHab && k > 0) { h.ninos++; k--; }
  return habs;
}

export function linkDirectBook(slug, { checkIn, checkOut, adultos, ninos, bebes } = {}) {
  const q = new URLSearchParams({ locale: 'es', currency: 'MXN' });
  if (checkIn && checkOut) {
    repartirHabitaciones(adultos || 2, ninos || 0).forEach((h, i) => {
      q.set(`items[${i}][adults]`, String(h.adultos));
      q.set(`items[${i}][children]`, String(h.ninos));
      q.set(`items[${i}][infants]`, String(i === 0 ? (bebes || 0) : 0));
    });
    q.set('checkInDate', checkIn);
    q.set('checkOutDate', checkOut);
  }
  return `https://direct-book.com/properties/${encodeURIComponent(slug)}?${q.toString()}`;
}

export function linkAirbnb(roomId, { checkIn, checkOut, adultos, ninos, bebes } = {}) {
  const base = `https://www.airbnb.mx/rooms/${roomId}`;
  if (!checkIn || !checkOut) return base;
  const q = new URLSearchParams({ check_in: checkIn, check_out: checkOut, adults: String(adultos || 1) });
  if (ninos) q.set('children', String(ninos));
  if (bebes) q.set('infants', String(bebes));
  return `${base}?${q.toString()}`;
}

// Busca una unidad por edificio + número ("13", "#13", "suite 2", "1a"...)
export function buscarUnidad(edificioId, numero) {
  const e = EDIFICIOS[edificioId];
  if (!e || numero == null) return null;
  const limpio = String(numero).toLowerCase().replace(/suite|habitaci[oó]n|loft|depto|departamento|peque[ñn]a|#|\s/g, '');
  const norm = s => String(s).toLowerCase().replace(/^0+(?=\d)/, '');
  return e.unidades.find(u => norm(u.n) === norm(limpio)) || null;
}

// Identifica el edificio aunque el modelo use un alias ("Aldea", "PM", "Zona Tec"...)
export function idEdificio(texto) {
  const t = String(texto || '').toLowerCase().trim();
  if (EDIFICIOS[t]) return t;
  for (const [id, e] of Object.entries(EDIFICIOS)) {
    if (e.alias.some(a => a.toLowerCase() === t) || e.nombre.toLowerCase().includes(t)) return id;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// TEXTO PARA EL PROMPT (se arma desde los datos de arriba)
// ═══════════════════════════════════════════════════════════════════
const pesos = n => '$' + Number(n).toLocaleString('en-US') + ' MXN';

function textoEdificio(id, e) {
  const L = [];
  L.push(`## ${e.nombre}  [id: ${id}]`);
  L.push(`Sistema de reserva: ${SISTEMAS[e.sistema]}${e.link ? ` — ${e.link}` : ''}${e.slug ? ` — https://direct-book.com/properties/${e.slug}?locale=es&currency=MXN` : ''}`);
  L.push(`Tipo: ${e.tipo}`);
  L.push(`Ubicación: ${e.direccion}`);
  L.push(`Lo mejor: ${e.resumen}`);
  if (e.incluye) L.push(`Incluye: ${e.incluye}`);
  if (e.banos) L.push(`Baños: ${e.banos}`);
  if (e.precioReferencia) L.push(`Precio de referencia: ${e.precioReferencia}`);
  for (const [titulo, lista] of [['Condiciones', e.condiciones], ['Políticas', e.politicas], ['Reglas', e.reglas], ['Cómo reservar', e.comoReservar], ['Notas', e.notas]]) {
    if (lista?.length) L.push(`${titulo}:\n${lista.map((x, i) => `  ${titulo === 'Cómo reservar' ? `${i + 1}.` : '-'} ${x}`).join('\n')}`);
  }
  L.push('Unidades:');
  for (const u of e.unidades) {
    const partes = [u.nombre];
    if (u.cama) partes.push(`cama ${u.cama}`);
    if (u.tipoU) partes.push(u.tipoU);
    partes.push(`${u.personas} persona${u.personas > 1 ? 's' : ''}`);
    if (u.renta) partes.push(`${pesos(u.renta)}/mes`);
    if (u.extras) partes.push(u.extras);
    if (u.destaca) partes.push(`⭐ ${u.destaca}`);
    let link = '';
    if (u.airbnb) link = `link: https://www.airbnb.mx/rooms/${u.airbnb}`;
    else if (u.belong) link = `link Belong: ${u.belong}`;
    else if (e.sistema === 'belong') link = 'sin link publicado → se ve directo con el dueño (escalar)';
    L.push(`  - [unidad: ${id}-${u.n}] ${partes.join(' · ')}${link ? ` · ${link}` : ''}`);
  }
  return L.join('\n');
}

export function textoConocimiento() {
  return [
    INFO_GENERAL,
    '# EDIFICIOS',
    ...Object.entries(EDIFICIOS).map(([id, e]) => textoEdificio(id, e)),
  ].join('\n\n');
}
