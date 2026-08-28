import { LegalPageLayout } from "@/components/legal-page-layout";

export default function AvisoLegalPage() {
  return (
    <LegalPageLayout title="Aviso legal" lastUpdated="26 de agosto de 2026">
      <h2>1. Datos identificativos</h2>
      <p>
        En cumplimiento del deber de información recogido en la normativa
        vigente, se facilitan los siguientes datos: el titular de este sitio
        web es <strong>[RAZÓN SOCIAL / NOMBRE COMPLETO]</strong>, con NIF/CIF{" "}
        <strong>[NIF/CIF]</strong> y domicilio en{" "}
        <strong>[DOMICILIO FISCAL COMPLETO]</strong>. Puede contactarse a
        través del correo electrónico{" "}
        <strong>carloslopez362000@gmail.com</strong> o el teléfono{" "}
        <strong>+34 604 306 387</strong>.
      </p>

      <h2>2. Objeto</h2>
      <p>
        Manitas El Pana es una plataforma que conecta a personas que
        necesitan servicios de montaje, fontanería, electricidad,
        remodelación y pintura ("clientes") con profesionales
        independientes que ofrecen esos servicios ("manitas"). La
        plataforma actúa como intermediaria y no presta directamente los
        servicios técnicos contratados.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El acceso y uso de este sitio web atribuye la condición de usuario
        e implica la aceptación de las condiciones incluidas en este Aviso
        Legal. El usuario se compromete a hacer un uso adecuado de los
        contenidos y servicios que se ofrecen, y a no emplearlos para
        incurrir en actividades ilícitas o contrarias a la buena fe.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Todos los contenidos del sitio web (textos, imágenes, logotipos,
        diseño, código fuente) son propiedad de{" "}
        <strong>[RAZÓN SOCIAL]</strong> o de terceros que han autorizado su
        uso, y están protegidos por la normativa de propiedad intelectual e
        industrial vigente. Queda prohibida su reproducción o distribución
        sin autorización expresa.
      </p>

      <h2>5. Limitación de responsabilidad</h2>
      <p>
        Manitas El Pana no garantiza la disponibilidad y continuidad del
        funcionamiento del sitio web, ni se hace responsable de los daños
        que puedan derivarse de la falta de disponibilidad. La plataforma
        no es responsable de la calidad final del servicio técnico prestado
        por los manitas, más allá de las garantías expresamente ofrecidas
        en la propia plataforma.
      </p>

      <h2>6. Legislación aplicable</h2>
      <p>
        Las presentes condiciones se rigen por la legislación española.
        Para cualquier controversia derivada del acceso o uso de este sitio
        web, las partes se someten a los juzgados y tribunales de{" "}
        <strong>[CIUDAD / FUERO COMPETENTE]</strong>.
      </p>
    </LegalPageLayout>
  );
}
