import { useMemo } from "react";
import { cn } from "@/lib/utils";
import mascotSvgRaw from "@/assets/mascote_normal.svg?raw";
import mascotSleepSvgRaw from "@/assets/mascote_sleep.svg?raw";

type Props = {
  className?: string;
  title?: string;
  mode?: "active" | "sleep" | "happy";
};

/**
 * Mascote animável (inline SVG):
 * - Idle: bounce + blink
 */
export function MascotAnimated({
  className,
  title = "Nova venda",
  mode = "active",
}: Props) {
  const ariaLabel = useMemo(() => title, [title]);

  const svgMarkup = useMemo(() => {
    let svg = mode === "sleep" ? mascotSleepSvgRaw : mascotSvgRaw;

    const addClass = (re: RegExp, cls: string) => {
      svg = svg.replace(re, (full) => {
        if (full.includes('class="')) {
          return full.replace('class="', `class="${cls} `);
        }
        return full.replace("<path", `<path class="${cls}"`);
      });
    };

    // Injetar classes para animação baseada no modo
    if (mode === "active") {
      svg = svg.replace("<svg", '<svg class="bounce"');
      // Olhos
      const eyePaths = ["M2238 956.567", "M1102 956.567", "M1051 927.567", "M2171 927.567"];
      eyePaths.forEach(path => {
        addClass(new RegExp(`<path[^>]*d="${path}[^>]*/>`), "blink");
      });
    }

    if (mode === "happy") {
      const eyePaths = ["M2238 956.567", "M1102 956.567", "M1051 927.567", "M2171 927.567"];
      eyePaths.forEach(path => {
        addClass(new RegExp(`<path[^>]*d="${path}[^>]*/>`), "blink");
      });
    }

    // Forçar 100% de tamanho
    svg = svg.replace(/width="[^"]*"/, 'width="100%"').replace(/height="[^"]*"/, 'height="100%"');

    return svg;
  }, [mode]);

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      data-mode={mode}
      className={cn(
        "block h-full w-full select-none mascot-animated-root",
        className,
      )}
    >
      <span
        className={cn(
          "relative block h-full w-full [&_svg]:h-full [&_svg]:w-full [&_svg]:block transition-all duration-700 ease-in-out scale-[1.35] origin-bottom -mb-2",
          mode === "active" && "bounce",
          mode === "happy" && "happy-bounce happy-tilt",
          mode === "sleep" && "sleep-bounce",
        )}
      >
        {/* Glow effect under the mascot */}
        <div className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-4 bg-primary/20 blur-xl rounded-full transition-opacity duration-1000",
          mode === "sleep" ? "opacity-30" : "opacity-100",
          mode === "happy" && "bg-highlight/40"
        )} />

        <span dangerouslySetInnerHTML={{ __html: svgMarkup }} />
      </span>
    </span>
  );
}
