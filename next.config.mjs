/** @type {import('next').NextConfig} */
const nextConfig = {
  // Redirects 301 (permanentes) desde URLs del sitio legacy
  // (manitaselpana.es, antes en Firebase Hosting) que Google tiene
  // indexadas y ya no existen en este proyecto — sin esto, cualquiera
  // que entre desde esos resultados de búsqueda cae en un 404 y se
  // pierde la señal de SEO acumulada en esa URL.
  async redirects() {
    return [
      {
        source: "/contacto",
        destination: "/presupuesto",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Foto de perfil de cuentas de Google (avatar_url tras login con
        // Google, ver signInWithGoogle en app/auth/actions.ts).
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // Avatares subidos por el usuario a Supabase Storage (bucket
        // "avatars", ver 0013_avatar_storage.sql y updateAvatar en
        // app/auth/actions.ts). Wildcard: cualquier proyecto *.supabase.co,
        // no solo el actual, por si el project ref cambia algún día.
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
