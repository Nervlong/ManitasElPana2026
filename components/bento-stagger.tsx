"use client";

// -----------------------------------------------------------------------------
// BentoStagger / BentoItem — wrapper mínimo para animar la entrada de un
// grupo de cards tipo bento (stagger + fade-up), sin forzar toda la página
// que lo contiene a ser Client Component. El padre (Server Component) solo
// envuelve sus cards reales con estos dos componentes.
// -----------------------------------------------------------------------------

import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export function BentoStagger({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
      {children}
    </motion.div>
  );
}

export function BentoItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
