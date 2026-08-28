import { LegalPageLayout } from "@/components/legal-page-layout";

const faqGroups: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Para clientes",
    items: [
      {
        q: "¿Cómo pido un servicio?",
        a: "Desde \"Pedir presupuesto\" eliges el tipo de servicio, describes el trabajo y dejas tu dirección. Un manita disponible en tu zona revisa la solicitud y coordina contigo el precio final y el horario.",
      },
      {
        q: "¿Cómo se paga?",
        a: "En efectivo, directamente con el manita al finalizar el trabajo. La plataforma todavía no procesa pagos online — los precios que ves antes de contratar son estimaciones, el monto final se acuerda entre las partes.",
      },
      {
        q: "¿Puedo calificar el servicio?",
        a: "Sí. Una vez que el trabajo se marca como completado, puedes dejar una calificación de 1 a 5 estrellas y un comentario opcional desde \"Mi cuenta\". Las calificaciones son públicas y no se pueden editar ni borrar después de publicarlas.",
      },
      {
        q: "¿Qué pasa si no quedo conforme con el trabajo?",
        a: "Lo primero es hablarlo directamente con el manita que hizo el trabajo. Si necesitas escalarlo, escríbenos a carloslopez362000@gmail.com contándonos qué pasó.",
      },
    ],
  },
  {
    title: "Para manitas",
    items: [
      {
        q: "¿Cómo me registro como manita?",
        a: "Crea tu cuenta normalmente (queda como cliente) y desde \"Mi cuenta\" elige \"Quiero ser manita\". Eso envía una solicitud.",
      },
      {
        q: "¿Por qué no puedo empezar a trabajar apenas me registro?",
        a: "Porque el pase de cliente a manita no es automático: un administrador de la plataforma revisa cada solicitud manualmente antes de aprobarla. Mientras tanto vas a ver tu solicitud como \"Pendiente de revisión\" en Mi cuenta.",
      },
      {
        q: "¿Qué pasa si rechazan mi solicitud?",
        a: "Vas a poder volver a solicitarlo desde Mi cuenta. Si quieres entender por qué, escríbenos a carloslopez362000@gmail.com.",
      },
      {
        q: "¿Tengo que darle de alta como empleado o firmar contrato laboral?",
        a: "No. Los manitas usan la plataforma como profesionales independientes (autónomos) para promocionarse y conseguir clientes — la plataforma no es tu empleador ni interviene en tu relación fiscal o laboral. Cada manita es responsable de estar dado de alta como autónomo y de cumplir sus propias obligaciones fiscales y de seguridad social según la normativa vigente.",
      },
      {
        q: "¿Cómo cobro los trabajos?",
        a: "Directamente del cliente, en efectivo, al finalizar. La plataforma no retiene comisión sobre el pago en esta etapa ni participa en la transacción de dinero.",
      },
    ],
  },
  {
    title: "Cuenta y datos",
    items: [
      {
        q: "¿Cómo cambio mi contraseña o mis datos?",
        a: "Desde \"Mi cuenta\" → \"Inicio de sesión y seguridad\" puedes actualizar tu contraseña y tus datos de perfil.",
      },
      {
        q: "¿Puedo borrar mi cuenta?",
        a: "Todavía no hay un botón de autoservicio para esto. Escríbenos a carloslopez362000@gmail.com y lo gestionamos manualmente.",
      },
      {
        q: "¿Qué hacen con mis datos?",
        a: "Ver la Política de privacidad para el detalle completo de qué recopilamos y para qué se usa.",
      },
    ],
  },
];

export default function AyudaPage() {
  return (
    <LegalPageLayout title="Centro de ayuda" lastUpdated="26 de agosto de 2026">
      <p className="text-content-secondary">
        Preguntas frecuentes sobre cómo funciona Manitas El Pana hoy. Si no
        encuentras lo que buscas, escríbenos a{" "}
        <a
          href="mailto:carloslopez362000@gmail.com"
          className="font-semibold text-brand underline underline-offset-2"
        >
          carloslopez362000@gmail.com
        </a>{" "}
        o llama al{" "}
        <a href="tel:+34604306387" className="font-semibold text-brand underline underline-offset-2">
          +34 604 306 387
        </a>
        .
      </p>

      {faqGroups.map((group) => (
        <div key={group.title} className="mt-8 first:mt-8">
          <h2>{group.title}</h2>
          <div className="space-y-5">
            {group.items.map((item) => (
              <div key={item.q}>
                <p className="font-semibold text-content-primary">{item.q}</p>
                <p className="mt-1 text-content-secondary">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </LegalPageLayout>
  );
}
