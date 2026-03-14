-- ==============================================================================
-- ACTUALIZACIÓN DE SECUENCIAS DE NURTURING
-- ==============================================================================
-- Reescribe las 3 secuencias para usar templates existentes en Meta Business
-- y texto libre (dentro de ventana 24h de WhatsApp).
--
-- Templates disponibles en Meta:
-- - lead_descubre_empezar (welcome + CTA "Ver Horarios")
-- - reprogramacion_no_show (reschedule con link)
--
-- INSTRUCCIONES:
-- 1. Ejecutar en Supabase SQL Editor
-- 2. Verificar que las 3 secuencias se actualizaron
-- 3. Las secuencias se activan (active = true) — el feature flag
--    NURTURE_ENABLED en Redis controla si el cron las ejecuta
-- ==============================================================================

-- ============================================================================
-- SCHEMA: Add nurture_opt_out column to leads
-- ============================================================================
-- Modelo opt-out: leads reciben nurture por defecto (interés legítimo RGPD).
-- Si piden no recibir, se marca nurture_opt_out = true.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS nurture_opt_out BOOLEAN DEFAULT false;
COMMENT ON COLUMN leads.nurture_opt_out IS 'Opt-out de secuencias de nurturing automatizadas';

-- ============================================================================
-- SECUENCIA 1: Bienvenida Lead (new_lead)
-- ============================================================================
-- Cadencia: Template welcome inmediato → texto personalizado 24h →
-- template recordatorio 72h
-- Objetivo: Convertir primer contacto en reserva de prueba

UPDATE nurture_sequences
SET
  name = 'Bienvenida Lead WhatsApp',
  description = 'Secuencia de bienvenida para leads nuevos. Usa template aprobado + texto libre dentro de ventana 24h.',
  trigger_conditions = '{"channels": ["whatsapp", "web"]}',
  steps = '[
    {
      "step": 0,
      "delay_hours": 1,
      "channel": "whatsapp",
      "action": "send_welcome",
      "template_name": "lead_descubre_empezar",
      "description": "Template bienvenida con CTA Ver Horarios y Reservar"
    },
    {
      "step": 1,
      "delay_hours": 24,
      "channel": "whatsapp",
      "action": "send_text",
      "message_text": "Hola {{firstName}} 👋 ¿Pudiste echar un vistazo a nuestros horarios? Si tienes alguna duda sobre qué clase elegir, cuéntame un poco sobre tu experiencia bailando y te recomiendo la mejor opción para ti 💃",
      "description": "Follow-up personalizado 24h (dentro de ventana WhatsApp)"
    },
    {
      "step": 2,
      "delay_hours": 72,
      "channel": "whatsapp",
      "action": "send_template",
      "template_name": "lead_descubre_empezar",
      "template_params": ["{{firstName}}"],
      "description": "Recordatorio con CTA a 72h (template por si venció ventana)"
    },
    {
      "step": 3,
      "delay_hours": 168,
      "channel": "whatsapp",
      "action": "send_template",
      "template_name": "lead_descubre_empezar",
      "template_params": ["{{firstName}}"],
      "description": "Último recordatorio a 7 días"
    }
  ]'::jsonb,
  active = true,
  priority = 10,
  updated_at = NOW()
WHERE trigger_type = 'new_lead';

-- ============================================================================
-- SECUENCIA 2: Recuperación No-Show
-- ============================================================================
-- Cadencia: Template reprogramación 2h → texto empático 48h →
-- template genérico 120h
-- Objetivo: Recuperar lead que no asistió a su clase de prueba

UPDATE nurture_sequences
SET
  name = 'Recuperación No-Show',
  description = 'Secuencia para leads que no asistieron a su clase de prueba. Empática y orientada a reprogramar.',
  trigger_conditions = '{}',
  steps = '[
    {
      "step": 0,
      "delay_hours": 2,
      "channel": "whatsapp",
      "action": "send_text",
      "message_text": "Hola {{firstName}} 👋 Vimos que no pudiste venir a tu clase hoy. ¡No pasa nada! Entendemos que surgen imprevistos. ¿Te gustaría reservar otro día? Puedo ayudarte a encontrar el mejor horario 😊",
      "description": "Mensaje empático 2h post-clase (dentro de ventana por reminder previo)"
    },
    {
      "step": 1,
      "delay_hours": 48,
      "channel": "whatsapp",
      "action": "send_template",
      "template_name": "lead_descubre_empezar",
      "template_params": ["{{firstName}}"],
      "description": "Template con CTA a 48h (por si la ventana expiró)"
    },
    {
      "step": 2,
      "delay_hours": 120,
      "channel": "whatsapp",
      "action": "send_template",
      "template_name": "lead_descubre_empezar",
      "template_params": ["{{firstName}}"],
      "description": "Último intento a 5 días"
    }
  ]'::jsonb,
  active = true,
  priority = 20,
  updated_at = NOW()
WHERE trigger_type = 'no_show';

-- ============================================================================
-- SECUENCIA 3: Post Clase de Prueba
-- ============================================================================
-- Cadencia: Texto feedback 2h → texto oferta 48h → template recordatorio 120h
-- Objetivo: Convertir asistente de prueba en alumno de pago

UPDATE nurture_sequences
SET
  name = 'Post Clase de Prueba',
  description = 'Secuencia para leads que asistieron a su clase de prueba pero no se han inscrito. Orientada a conversión.',
  trigger_conditions = '{}',
  steps = '[
    {
      "step": 0,
      "delay_hours": 2,
      "channel": "whatsapp",
      "action": "send_text",
      "message_text": "¡Hola {{firstName}}! 🎉 ¿Qué tal tu primera clase? Espero que la hayas disfrutado muchísimo. Si te gustó y quieres seguir, tenemos bonos desde 45€/mes con acceso a todas las clases. ¿Te cuento las opciones? 💃",
      "description": "Feedback + oferta 2h post-clase (ventana abierta por check-in)"
    },
    {
      "step": 1,
      "delay_hours": 48,
      "channel": "whatsapp",
      "action": "send_text",
      "message_text": "Hola {{firstName}} 👋 ¿Has tenido tiempo de pensarlo? El bono mensual te permite venir a todas las clases que quieras, es la forma más rápida de progresar 🚀\n\n📋 Ver precios y horarios: https://www.farrayscenter.com/es/horarios-precios",
      "description": "Push suave con link directo a 48h"
    },
    {
      "step": 2,
      "delay_hours": 120,
      "channel": "whatsapp",
      "action": "send_template",
      "template_name": "lead_descubre_empezar",
      "template_params": ["{{firstName}}"],
      "description": "Último recordatorio a 5 días con CTA"
    }
  ]'::jsonb,
  active = true,
  priority = 30,
  updated_at = NOW()
WHERE trigger_type = 'post_trial';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
  seq_count INTEGER;
  active_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO seq_count FROM nurture_sequences;
  SELECT COUNT(*) INTO active_count FROM nurture_sequences WHERE active = true;

  RAISE NOTICE '✅ Secuencias totales: %', seq_count;
  RAISE NOTICE '🟢 Secuencias activas: %', active_count;

  IF active_count < 3 THEN
    RAISE WARNING '⚠️  Se esperaban 3 secuencias activas, hay %', active_count;
  END IF;
END $$;
