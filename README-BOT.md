# Bot de WhatsApp con IA — Barrio Inn

El bot contesta a los clientes por WhatsApp las 24 horas. Recomienda suites, da los links correctos de Airbnb o de reserva y resuelve dudas (check-in, mascotas, factura, estacionamiento…). Si el cliente da fechas, le arma el link del motor de reservas con fechas y personas ya puestas. Cuando hace falta una persona, avisa al equipo, y se calla solo en cuanto alguien del equipo contesta.

```
Cliente escribe ──► WhatsApp ──► /api/whatsapp (Vercel)
                                   │  guarda el mensaje (Supabase)
                                   │  ¿un humano tomó este chat? → no contesta
                                   │  Claude + catálogo vivo (tablas complejos/propiedades)
                                   └─► responde por WhatsApp
                                       └─ si es urgente/queja/etc. → avisa al equipo
Equipo contesta desde la app WhatsApp Business ─► (eco) ─► bot pausado en ese chat N horas
Equipo también puede usar  www.barrioinn.com/bandeja
```

## Archivos nuevos (se agregan al mismo repo del sitio)

| Archivo | Qué es |
|---|---|
| `api/whatsapp.js` | Webhook que recibe los mensajes de WhatsApp |
| `api/bandeja.js` | API privada de la bandeja |
| `api/_lib/agente.js` | Instrucciones y personalidad del bot + llamada a Claude |
| `api/_lib/conocimiento.js` | Los 5 edificios: habitaciones, links, reglas y políticas |
| `api/_lib/procesar.js` | Lógica de turnos bot ↔ humano |
| `api/_lib/whatsapp.js`, `db.js`, `config.js` | Conexiones |
| `bandeja.html` | Bandeja web para el equipo (`/bandeja`) |
| `supabase-whatsapp-bot.sql` | Crea las tablas de conversaciones |
| `vercel.json` | Reemplaza al actual (agrega `/bandeja` y los tiempos de las funciones) |
| `package.json` | Dependencias |
| `tests/` | Pruebas simuladas (`npm test`) |

`index.html`, `morelos.html` y `administrador.html` no se tocan.

---

## Puesta en marcha

### 1. Supabase
Abre SQL Editor, pega `supabase-whatsapp-bot.sql` y dale Run. Luego copia la llave **service_role** desde Project Settings → API. Esa llave va **solo** en Vercel, nunca en el HTML.

### 2. Número de WhatsApp: elige el camino

**Camino A (recomendado): el mismo número, con coexistencia.**
El número actual (81 1064 5136) se queda en la app WhatsApp Business del celular y además se conecta a la API. El equipo sigue viendo y contestando todo desde la app, y el bot se pausa solo cuando alguien contesta.
- La coexistencia se activa con un proveedor oficial de Meta (BSP). El código ya soporta **360dialog**: `WA_PROVIDER=360dialog`. Ellos cobran una cuota mensual por número; confirma el precio actual.
- En su panel eliges "conectar número existente de WhatsApp Business app", escaneas el QR desde la app y listo.
- Configura el webhook a `https://www.barrioinn.com/api/whatsapp?k=TU_WEBHOOK_KEY`. Asegúrate de que también lleguen los eventos `smb_message_echoes`: son los que avisan cuando una persona contesta desde la app.

**Camino B: número nuevo, directo con Meta (sin intermediario).**
- En developers.facebook.com: crea una app de tipo Business, agrega WhatsApp, registra el número y crea un System User con token permanente.
- Webhook: `https://www.barrioinn.com/api/whatsapp`, con verify token = `WA_VERIFY_TOKEN`, suscrito a `messages`.
- Ese número ya no se puede usar en la app del celular. El equipo contesta desde `/bandeja`.

### 3. Claude
Crea una API key en console.anthropic.com y ponla en `ANTHROPIC_API_KEY`. Si quieres gastar menos, usa `CLAUDE_MODEL=claude-haiku-5-5`.

### 4. Variables en Vercel
Copia `.env.example` en Settings → Environment Variables, llena los valores y haz redeploy.
`ADMIN_TOKEN` es la clave de la bandeja: que sea larga y aleatoria.

### 5. Probar
1. Escríbele al número desde un celular personal: "Hola, busco cuarto para 2 en Barrio Antiguo".
2. Contesta desde la app (o desde `/bandeja`) y vuelve a escribir desde el celular: el bot ya no debe contestar.
3. En `/bandeja`, presiona "Reactivar bot".
4. Escribe "no puedo entrar, el código no funciona": debe llegar una alerta URGENTE a `STAFF_NUMEROS`.

---

## Cómo funciona el traspaso bot ↔ humano

| Situación | Qué hace el bot |
|---|---|
| Cliente escribe | Contesta (si el chat está en modo bot) |
| Alguien del equipo contesta desde la app o la bandeja | Se calla en ese chat `HUMANO_PAUSA_HORAS` (8 h por defecto) |
| "Tomar chat" en la bandeja | Se calla hasta que alguien presione "Reactivar bot" |
| El cliente tiene una urgencia, queja, reembolso, cotización… | Sigue atendiendo, marca el chat "Por atender" y avisa al equipo |
| La IA falla | Manda un mensaje de respaldo y marca el chat "Por atender" |
| `BOT_HORARIO=fuera_de_oficina` | Solo contesta fuera de lun–vie 11:00–18:00 |
| `BOT_ACTIVO=false` | Apagado general |

**Avisos al equipo:** WhatsApp solo deja mandar texto libre a un número que haya escrito al bot en las últimas 24 h. Para que las alertas lleguen siempre, crea en WhatsApp Manager una plantilla de tipo *Utility* con 3 variables, por ejemplo:
`Alerta Barrio Inn: {{1}} · Cliente {{2}} · {{3}}`
Pon su nombre en `STAFF_TEMPLATE`.

## Qué sabe el bot y cómo se actualiza
- **Todo el conocimiento de los 5 edificios** (habitaciones, links, reglas, cómo se reserva en cada sistema, políticas, distancias) vive en `api/_lib/conocimiento.js`. Para cambiar un link, una regla o agregar una habitación se edita ese archivo y se sube a GitHub; Vercel lo publica solo.
- **Sistemas:** Morelos → direct-book · Hostal y Abasolo → Airbnb · Padre Mier → Cloudbeds · Roma → Belong.
- **Links con fechas:** si el cliente da fechas y personas, el bot manda el link ya llenado (direct-book con varias habitaciones para grupos, Airbnb con fechas y huéspedes). En Cloudbeds manda el link y le dice qué fechas poner.
- **Personalidad y reglas de venta:** en `api/_lib/agente.js` (constante `INSTRUCCIONES`): tono humano, modo venta, todo lo que no sabe → "platícalo con el dueño" y avisa al equipo.

## Costos aproximados
- **Claude:** centavos de dólar por conversación. La parte grande del prompt (instrucciones y catálogo) se cachea, así que sale más barata.
- **Meta:** desde octubre de 2026 las respuestas dentro de la ventana de 24 h también se cobran por mensaje. Revisa la tarifa vigente para México.
- **Vercel / Supabase:** con este volumen cabe en los planes actuales.
- **360dialog** (solo en el camino A): su cuota mensual.

## ⚠️ Seguridad del sitio actual (independiente del bot, pero urgente)
1. `supabase-rls-fix.sql` dio a **anon** permiso de INSERT/UPDATE/DELETE en `complejos`, `propiedades`, `galeria` y en el bucket `fotos`. La llave anon es pública (está en el HTML), así que **cualquiera puede borrar o cambiar todas las suites y fotos** sin entrar al admin.
2. La contraseña del administrador está escrita en `administrador.html`: cualquiera la ve con "ver código fuente".
3. Solución recomendada: login real con Supabase Auth en el admin, policies de escritura solo para usuarios `authenticated` y dejar a `anon` únicamente con SELECT. Las tablas del bot (`wa_*`) ya nacen cerradas.
