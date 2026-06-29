import { useMotionTemplate, motion } from 'motion/react';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789{}[]<>/*-+=';

export function generateRandomString(length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * CardPattern — the encrypted-reveal layer for an Evervault-style card.
 * Drop inside a `group/card relative overflow-hidden` container; pass the
 * card-local mouse motion values + a random string. On hover a green→blue
 * gradient and a scrambling character field are revealed in a radial spotlight
 * that follows the cursor.
 */
export function CardPattern({ mouseX, mouseY, randomString }) {
  const maskImage = useMotionTemplate`radial-gradient(260px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 rounded-[inherit] [mask-image:linear-gradient(white,transparent)] opacity-0 transition duration-500 group-hover/card:opacity-50" />
      <motion.div
        className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-emerald-500 to-blue-700 opacity-0 backdrop-blur-xl transition duration-500 group-hover/card:opacity-100"
        style={style}
      />
      <motion.div
        className="absolute inset-0 rounded-[inherit] opacity-0 mix-blend-overlay transition duration-500 group-hover/card:opacity-100"
        style={style}
      >
        <p className="absolute inset-0 whitespace-pre-wrap break-words p-3 font-mono text-[10px] font-bold leading-[1.35] text-white">
          {randomString}
        </p>
      </motion.div>
    </div>
  );
}

export function Icon({ className, ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
}
