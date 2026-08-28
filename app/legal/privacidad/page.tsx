import { LegalPageLayout } from "@/components/legal-page-layout";

export default function PrivacidadPage() {
  return (
    <LegalPageLayout
      title="Política de privacidad"
      lastUpdated="26 de agosto de 2026"
    >
      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de los datos personales recogidos a
        través de este sitio web es{" "}
        <strong>[RAZÓN SOCIAL / NOMBRE COMPLETO]</strong>, con NIF/CIF{" "}
        <strong>[NIF/CIF]</strong>, contactable en{" "}
        <strong>carloslopez362000@gmail.com</strong>.
      </p>

      <h2>2. Datos que recopilamos</h2>
      <p>Según cómo uses la plataforma, podemos tratar:</p>
      <ul>
        <li>
          Datos de registro: nombre, email, contraseña (cifrada) o cuenta
          de Google si inicias sesión con ese proveedor.
        </li>
        <li>
          Datos de perfil: especialidad, zona de cobertura y descripción,
          si te registras como manita.
        </li>
        <li>
          Datos de contacto y dirección al solicitar un presupuesto o
          servicio.
        </li>
        <li>
          Datos de uso técnico (cookies, ver Política de Cookies).
        </li>
      </ul>

      <h2>3. Finalidad del tratamiento</h2>
      <p>
        Usamos tus datos para gestionar tu cuenta, conectar clientes con
        manitas, procesar solicitudes de presupuesto, calcular
        calificaciones/reputación, y comunicarnos contigo sobre el estado
        de tus servicios.
      </p>

      <h2>4. Base legal</h2>
      <p>
        El tratamiento se basa en la ejecución del contrato de prestación
        del servicio (registrarte y usar la plataforma) y, en su caso, en
        el consentimiento que otorgas al aceptar esta política.
      </p>

      <h2>5. Conservación de los datos</h2>
      <p>
        Conservamos tus datos mientras mantengas tu cuenta activa, y
        durante los plazos legalmente exigidos tras su baja para atender
        posibles responsabilidades.
      </p>

      <h2>6. Destinatarios y encargados de tratamiento</h2>
      <p>
        Tus datos se almacenan en Supabase (infraestructura en la nube) y
        pueden tratarse mediante servicios de autenticación de terceros
        (Google) si eliges ese método de inicio de sesión. No vendemos ni
        cedemos tus datos a terceros con fines comerciales.
      </p>

      <h2>7. Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión,
        oposición, limitación y portabilidad escribiendo a{" "}
        <strong>carloslopez362000@gmail.com</strong>. También puedes
        editar tu nombre y datos de perfil directamente desde{" "}
        <strong>Mi cuenta</strong> dentro de la plataforma.
      </p>
    </LegalPageLayout>
  );
}
