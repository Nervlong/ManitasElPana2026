import { LegalPageLayout } from "@/components/legal-page-layout";

export default function TerminosPage() {
  return (
    <LegalPageLayout
      title="Términos y condiciones"
      lastUpdated="26 de agosto de 2026"
    >
      <h2>1. Naturaleza de la plataforma</h2>
      <p>
        Manitas El Pana es una plataforma que pone en contacto a personas
        que necesitan servicios técnicos a domicilio ("clientes") con
        profesionales independientes ("manitas") que ofrecen esos
        servicios. <strong>La plataforma actúa únicamente como
        intermediaria</strong>: no emplea a los manitas, no presta
        directamente los servicios técnicos, y no es parte del contrato de
        prestación de servicio entre cliente y manita.
      </p>

      <h2>2. Registro de cuentas</h2>
      <p>
        Para usar la plataforma es necesario registrarse como cliente o
        manita. Toda cuenta nueva se crea con rol de cliente por defecto.
        Pasar de cliente a manita requiere completar una solicitud que{" "}
        <strong>debe ser revisada y aprobada manualmente</strong> por un
        administrador de la plataforma — no es un proceso automático.
      </p>

      <h2>3. Pago del servicio</h2>
      <p>
        El pago de los servicios se realiza <strong>en efectivo</strong>,
        de forma directa y coordinada entre el cliente y el manita al
        finalizar el trabajo.{" "}
        <strong>La plataforma no procesa ni intermedia pagos</strong> en
        esta etapa. Los precios mostrados en la plataforma son
        estimaciones y pueden ajustarse según el alcance real del trabajo,
        siempre acordado previamente entre las partes.
      </p>

      <h2>4. Calificaciones y reputación</h2>
      <p>
        Al finalizar un trabajo marcado como completado, el cliente puede
        calificar al manita con una puntuación de 1 a 5 estrellas y un
        comentario opcional. Estas calificaciones son públicas y no pueden
        editarse ni eliminarse una vez publicadas, para preservar la
        integridad del sistema de reputación.
      </p>

      <h2>5. Naturaleza de la relación con los manitas</h2>
      <p>
        Los manitas actúan en todo momento como{" "}
        <strong>profesionales autónomos independientes</strong>, no como
        empleados, representantes ni agentes de la plataforma. En
        particular:
      </p>
      <ul>
        <li>
          Cada manita decide libremente qué solicitudes acepta, cuándo
          trabaja y cómo organiza su actividad. La plataforma no impone
          horarios, turnos ni exclusividad.
        </li>
        <li>
          La plataforma no supervisa ni dirige la ejecución técnica del
          trabajo — es responsabilidad exclusiva del manita.
        </li>
        <li>
          Cada manita es responsable de estar dado de alta como autónomo
          (RETA u organismo equivalente) y de cumplir sus propias
          obligaciones fiscales y de seguridad social conforme a la
          normativa aplicable. La plataforma no es su empleador y no
          gestiona esas obligaciones en su nombre.
        </li>
        <li>
          Al solicitar el pase a manita, la persona confirma expresamente
          haber leído y aceptado esta sección (queda registrado con fecha
          junto a su solicitud).
        </li>
      </ul>

      <h2>6. Cancelaciones</h2>
      <p>
        Cliente y manita pueden acordar la cancelación de un servicio antes
        de su inicio. <strong>[COMPLETAR: política de cancelación —
        plazos, penalizaciones si las hubiera]</strong>.
      </p>

      <h2>7. Limitación de responsabilidad</h2>
      <p>
        Manitas El Pana no garantiza la disponibilidad continua de la
        plataforma ni la calidad final del servicio prestado por un
        manita, más allá de la garantía de 30 días mencionada en la
        landing (que debe ser gestionada directamente con el manita que
        realizó el trabajo, salvo que se indique lo contrario).
      </p>

      <h2>8. Modificaciones</h2>
      <p>
        Estos términos pueden actualizarse. Los cambios relevantes se
        anunciarán en la plataforma antes de entrar en vigor.
      </p>

      <h2>9. Legislación aplicable</h2>
      <p>
        Estos términos se rigen por la legislación española. Cualquier
        disputa se someterá a los juzgados y tribunales de{" "}
        <strong>[CIUDAD / FUERO COMPETENTE]</strong>.
      </p>
    </LegalPageLayout>
  );
}
