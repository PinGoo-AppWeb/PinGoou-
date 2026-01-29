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
    // Mantém o SVG inteiro (corpo/rosto sempre visíveis) e apenas injeta classes
    // nos elementos que queremos animar.

    let svg = mode === "sleep" ? mascotSleepSvgRaw : mascotSvgRaw;

    const addClassToFirstMatch = (re: RegExp, classToAdd: string) => {
      svg = svg.replace(re, (full) => {
        if (/\bclass=/.test(full)) {
          return full.replace(/class="([^"]*)"/, (m, cls) => {
            const next = cls.split(/\s+/).includes(classToAdd)
              ? cls
              : `${cls} ${classToAdd}`;
            return `class="${next}"`;
          });
        }
        // Não escape aspas aqui: isso vai direto para o HTML do SVG.
        return full.replace("<path", `<path class="${classToAdd}"`);
      });
    };

    // 1) Bounce no SVG inteiro (somente no modo ativo)
    if (mode === "active") {
      svg = svg.replace(/<svg\b([^>]*?)>/, (full, attrs) => {
        if (/\bclass=/.test(full)) {
          return full.replace(/class="([^"]*)"/, (m, cls) => {
            const next = cls.split(/\s+/).includes("bounce") ? cls : `${cls} bounce`;
            return `class="${next}"`;
          });
        }
        return `<svg${attrs} class="bounce">`;
      });
    }

    // 2) Olhos: blink só no modo ativo e só no SVG "normal"
    if (mode === "active") {
      const eyePaths = [
        "M2238 956.567",
        "M1102 956.567",
        "M1051 927.567",
        "M2171 927.567",
      ];
      for (const start of eyePaths) {
        addClassToFirstMatch(
          new RegExp(`<path\\b[^>]*d="${start}[\\s\\S]*?"[^>]*\\/>`),
          "blink",
        );
      }
    }

    if (mode === "happy") {
      const eyePaths = [
        "M2238 956.567",
        "M1102 956.567",
        "M1051 927.567",
        "M2171 927.567",
      ];
      for (const start of eyePaths) {
        addClassToFirstMatch(
          new RegExp(`<path\\b[^>]*d="${start}[\\s\\S]*?"[^>]*\\/>`),
          "blink",
        );
      }
    }


    // 3) Ajusta ViewBox para dar "zoom" (removendo margens vazias se houver)
    // O original é 0 0 2978 2442. Vamos tentar focar mais no centro/rosto se parecer pequeno.
    // Mas o usuário pediu "aumentar o tamanho", o que pode ser CSS ou viewBox.
    // Se o SVG tem muita borda vazia, viewBox resolve.
    // O SVG atual parece preencher bem (circle 2978x2442?? não é circle, é path ovalado).
    // O path do corpo é: M2978 1489... C... 1489 2442...
    // Com base nos paths, o SVG ocupa quase tudo.
    // Então para "aumentar", vamos garantir que o CSS ocupe 100% e talvez
    // escalar um pouco via transform se necessário.

    // O usuário disse "aumentar o tamanho do mascote: feliz e o dormindo".
    // Provavelmente quer que ele ocupe mais espaço no container.
    // Vamos ajustar o replace do <svg> para garantir width/height 100%.

    svg = svg.replace(/width="[^"]*"/, 'width="100%"').replace(/height="[^"]*"/, 'height="100%"');

    // Se o usuário quer ZOOM (rosto maior), precisaríamos alterar o viewBox. 
    // Vamos assumir que ele quer apenas que o componente seja responsivo e grande.
    // MAS, comparando com o pedido "feliz e o dormindo", talvez o 'dormindo' esteja pequeno.
    // Vamos aplicar um scale(1.15) no CSS do container para dar um "pump" geral.

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
      <style>
        {`
          /* Smooth Transitions for internal paths */
          .mascot-animated-root path {
            transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease;
          }

          /* Idle (somente no modo ativo) */
          .mascot-animated-root[data-mode="active"] .bounce {
            transform-origin: center;
            transform-box: fill-box;
            animation: mascotBounce 1.95s ease-in-out infinite;
          }

          /* Blink (somente no modo ativo ou feliz) */
          .mascot-animated-root[data-mode="active"] .blink,
          .mascot-animated-root[data-mode="happy"] .blink {
            transform-origin: center;
            transform-box: fill-box;
            animation: eyeBlink 4.1s ease-in-out infinite;
          }

          /* Sleep: bounce bem suave e lento */
          .mascot-animated-root[data-mode="sleep"] .sleep-bounce {
            transform-origin: center;
            transform-box: fill-box;
            animation: mascotSleepBounce 5.8s ease-in-out infinite;
          }

          /* Sleep: boca respirando/roncando */
          .mascot-animated-root[data-mode="sleep"] .sleep-mouth {
            transform-origin: center;
            transform-box: fill-box;
            animation: sleepMouthSnore 2.6s ease-in-out infinite;
          }

          @keyframes mascotBounce {
            0%, 100% { transform: translateY(0) scaleY(1); }
            50% { transform: translateY(-12px) scaleY(1.02); }
          }

          @keyframes eyeBlink {
            0%, 92%, 100% { transform: scaleY(1); }
            94% { transform: scaleY(0.08); }
            96% { transform: scaleY(1); }
          }

          @keyframes mascotSleepBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }

          @keyframes sleepMouthSnore {
            0%, 100% { transform: translateY(0) scaleX(1); opacity: 1; }
            50% { transform: translateY(2px) scaleX(0.92); opacity: 0.95; }
          }

          /* Happy: Bounce mais rápido e inclinação */
          .mascot-animated-root[data-mode="happy"] .happy-bounce {
            transform-origin: center;
            transform-box: fill-box;
            animation: mascotHappyBounce 0.8s ease-in-out infinite;
          }

          .mascot-animated-root[data-mode="happy"] .happy-tilt {
            animation: mascotHappyTilt 1.6s ease-in-out infinite;
          }

          @keyframes mascotHappyBounce {
            0%, 100% { transform: translateY(0) scaleY(1); }
            50% { transform: translateY(-30px) scaleY(1.05); }
          }

          @keyframes mascotHappyTilt {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
          }
        `}
      </style>

      <span
        // Aplica bounce no container para garantir salto contínuo do mascote inteiro,
        // independente de como o SVG venha (com/sem class no <svg>).
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
