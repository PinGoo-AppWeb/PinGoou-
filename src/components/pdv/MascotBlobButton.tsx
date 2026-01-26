import { cn } from "@/lib/utils";

// Renderizamos inline para garantir que animações internas do SVG (CSS/keyframes)
// funcionem consistentemente (em alguns browsers, via <img> pode não animar).
import mascotHappy from "@/assets/mascote-blob-happy.svg?raw";
import mascotNeutral from "@/assets/mascote-blob-neutral.svg?raw";
import mascotWorried from "@/assets/mascote-blob-worried.svg?raw";
import mascotWave from "@/assets/mascote-blob-wave.svg?raw";

type Props = {
  className?: string;
  title?: string;
  expression?: "happy" | "neutral" | "sad" | "wave";
};

/**
 * Mascote (SVG do usuário) escalável como “blob”.
 * Observação: as cores vêm do próprio SVG.
 */
export function MascotBlobButton({
  className,
  title = "Nova venda",
  expression = "happy",
}: Props) {
  const svg =
    expression === "wave"
      ? mascotWave
      : expression === "neutral"
        ? mascotNeutral
        : expression === "sad"
          ? mascotWorried
          : mascotHappy;

  return (
    <span
      aria-label={title}
      role="img"
      className={cn("block h-full w-full select-none", className)}
    >
      {/*
        Bounce fica no “miolo” pra não conflitar com translate/scale do container
        (ex.: o mascote na Home usa translateX/translateY/scale na prop className).
      */}
      <span
        className={cn(
          "block h-full w-full motion-reduce:animate-none animate-mascot-bounce [&>svg]:h-full [&>svg]:w-full [&>svg]:block",
        )}
        // SVG é do bundle (assets do app) — confiável.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </span>
  );
}