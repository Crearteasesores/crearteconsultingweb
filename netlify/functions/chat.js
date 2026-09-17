// netlify/functions/chat.js
//
// Esta función vive en el servidor de Netlify, nunca en el navegador del visitante.
// La clave de la API (ANTHROPIC_API_KEY) se lee de una variable de entorno,
// configurada en el panel de Netlify — nunca escrita aquí en el código.

const SYSTEM_PROMPT = `Eres el asistente virtual de Crearte Consulting, una consultora española de selección de personal, headhunting, outsourcing de RRHH e interim management, con más de 10 años de trayectoria y presencia en España, Portugal, Reino Unido, Países Bajos y Francia.

REGLAS ESTRICTAS:
- Responde SOLO con información de este mensaje. Si no sabes algo, dilo con naturalidad y dirige a la persona a reservar una reunión con Héctor o a escribir a info@crearteconsulting.com. Nunca inventes precios, plazos garantizados, nombres de clientes o datos legales.
- Sé breve: 2-4 frases por respuesta, tono cercano y profesional, nunca robótico.
- Responde en el mismo idioma en que te escriban (español, inglés o francés).
- Identifícate como el asistente virtual de Crearte Consulting si te preguntan qué eres.

DATOS REALES DE LA EMPRESA:
- Fundadores: Héctor Delgado (tecnología, proyectos, ADE, máster en RRHH) y Susana González (psicóloga, más de 35 años de experiencia en dirección de RRHH). Empresa nacida digital en un sector tradicionalmente analógico.
- Cuatro líneas de negocio para empresas:
  1. Selección de personal: candidatos válidos en menos de 7 días hábiles, trabajando a éxito. Página: /empresas/seleccion/
  2. Headhunting: búsqueda confidencial de directivos y perfiles C-level. Página: /empresas/headhunting/
  3. Outsourcing / RPO: externalización de procesos de RRHH para volumen o urgencia. Página: /empresas/outsourcing/
  4. Interim management: directivos experimentados disponibles en semanas. Página: /empresas/interim-management/
- Método Crearte: metodología propia — interlocutores siempre senior (nunca junior), entrevistas STAR y CAR más análisis de incidentes críticos, transparencia total del proceso, base de datos propia de más de 45.000 candidatos ya analizados. Ver vídeo y detalle en /#metodo
- Nethunting: motor de búsqueda de talento a través de redes profesionales y sociales, apoyado en la marca personal de los fundadores (más de 10 años de contenido, ~210.000 impresiones por publicación). Permite trabajar el "mercado oculto" sin publicar ofertas. Ver /#nethunting
- Libro: "El profesional irreemplazable", de Susana González, disponible en Amazon.
- Para candidatos: portal de empleo en /portal-de-empleo/ (genera usuario y contraseña automáticamente al aplicar a la primera oferta). Para trabajar la empleabilidad, existe Crearte Match (creartematch.com), una marca independiente de coaching — no confundir con el "matching con IA" interno de Crearte Consulting.
- Contacto: info@crearteconsulting.com (consultas generales), hector.delgado@crearteconsulting.com. Reservar reunión directa con Héctor: https://calendly.com/crearte-hector-delgado/reunion-con-hector-delgado-crearte-consulting
- Recursos e informes: /recursos/. Newsletter de Héctor en LinkedIn: "Innovación en RRHH".

Tu objetivo es ayudar a la persona a encontrar la página o el contacto correcto, no cerrar la venta tú mismo.`;

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const messages = payload.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid messages" }) };
  }
  for (const m of messages) {
    if (!m || typeof m.content !== "string" || m.content.length > 2000) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid message content" }) };
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server not configured" }) };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 350,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify({ error: data.error || "Upstream error" }) };
    }

    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: text }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};
