import { LegalPageLayout } from "@/components/legal-page-layout";

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Política de cookies" lastUpdated="26 de agosto de 2026">
      <h2>1. ¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos que un sitio web guarda en tu
        navegador para recordar información entre visitas, como si
        iniciaste sesión o no.
      </p>

      <h2>2. Qué cookies usamos hoy</h2>
      <p>
        Actualmente esta plataforma solo utiliza{" "}
        <strong>cookies técnicas de sesión</strong>, necesarias para el
        funcionamiento de la cuenta:
      </p>
      <ul>
        <li>
          Cookies de autenticación (gestionadas por Supabase Auth):
          mantienen tu sesión iniciada mientras navegas por la plataforma.
          Sin ellas, no podrías permanecer logueado.
        </li>
      </ul>
      <p>
        Estas cookies son estrictamente necesarias para prestar el
        servicio que solicitaste (iniciar sesión), por lo que no requieren
        consentimiento previo según la normativa vigente.
      </p>

      <h2>3. Lo que no usamos (por ahora)</h2>
      <p>
        No utilizamos cookies de analítica de terceros (como Google
        Analytics), ni cookies publicitarias o de seguimiento entre
        sitios. Si en el futuro se incorporan, esta política se actualizará
        y se pedirá el consentimiento correspondiente antes de activarlas.
      </p>

      <h2>4. Cómo gestionar las cookies</h2>
      <p>
        Puedes eliminar o bloquear las cookies desde la configuración de tu
        navegador. Ten en cuenta que bloquear las cookies de sesión puede
        impedir que puedas iniciar sesión correctamente en la plataforma.
      </p>
    </LegalPageLayout>
  );
}
