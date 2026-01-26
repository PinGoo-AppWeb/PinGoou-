import Lottie from "lottie-react";
import { cn } from "@/lib/utils";

// JSON exportado do LottieFiles (512x512)
import animationData from "@/assets/mascote_aceno_animate.json";

type Props = {
  className?: string;
  /** Loop do aceno enquanto o componente estiver montado (default: true) */
  loop?: boolean;
};

export function MascotWaveLottie({ className, loop = true }: Props) {
  return (
    <div className={cn("h-full w-full overflow-visible", className)}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay
        rendererSettings={{
          // Evita o "auto-fit" encolher o corpo por causa do braço fora do shape.
          // `slice` prioriza preencher o quadro, mantendo o corpo com escala consistente.
          preserveAspectRatio: "xMidYMid slice",
        }}
        className="h-full w-full"
      />
    </div>
  );
}
