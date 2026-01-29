import { MascotAnimated } from "./MascotAnimated";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Mascote pequeno para páginas
 * Clique: Inicia fluxo de vendas
 * Pressionar e arrastar: Reposiciona o mascote
 */
export function MascotHeader() {
    const navigate = useNavigate();
    const STORAGE_KEY = "mascot-position";

    // Calcular posição padrão imediatamente
    const getDefaultPosition = () => {
        const defaultX = window.innerWidth - 96; // 80px (mascote) + 16px (padding)
        const defaultY = window.innerHeight - 176; // 80px (mascote) + 80px (menu) + 16px (padding)
        return { x: defaultX, y: defaultY };
    };

    // Inicializar com posição salva ou padrão
    const [position, setPosition] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return getDefaultPosition();
            }
        }
        return getDefaultPosition();
    });

    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [mouseDownPos, setMouseDownPos] = useState({ x: 0, y: 0 });
    const [mouseDownTime, setMouseDownTime] = useState(0);
    const mascotRef = useRef<HTMLDivElement>(null);

    // Salvar posição quando mudar
    useEffect(() => {
        if (position.x !== 0 || position.y !== 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
        }
    }, [position]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setMouseDownPos({ x: e.clientX, y: e.clientY });
        setMouseDownTime(Date.now());
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        setMouseDownPos({ x: touch.clientX, y: touch.clientY });
        setMouseDownTime(Date.now());
        setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y,
        });
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        const timeDiff = Date.now() - mouseDownTime;
        const distanceX = Math.abs(e.clientX - mouseDownPos.x);
        const distanceY = Math.abs(e.clientY - mouseDownPos.y);
        const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Se foi um clique rápido (< 200ms) e sem movimento (< 5px), navega
        if (timeDiff < 200 && totalDistance < 5 && !isDragging) {
            navigate("/venda/nova");
        }

        setIsDragging(false);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const timeDiff = Date.now() - mouseDownTime;
        const touch = e.changedTouches[0];
        const distanceX = Math.abs(touch.clientX - mouseDownPos.x);
        const distanceY = Math.abs(touch.clientY - mouseDownPos.y);
        const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Se foi um toque rápido (< 200ms) e sem movimento (< 5px), navega
        if (timeDiff < 200 && totalDistance < 5 && !isDragging) {
            navigate("/venda/nova");
        }

        setIsDragging(false);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const distanceX = Math.abs(e.clientX - mouseDownPos.x);
            const distanceY = Math.abs(e.clientY - mouseDownPos.y);
            const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            // Se moveu mais de 5px, considera como drag
            if (totalDistance > 5) {
                setIsDragging(true);
            }

            if (!isDragging && totalDistance <= 5) return;

            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            // Limitar aos limites da tela
            const maxX = window.innerWidth - 80;
            const maxY = window.innerHeight - 80;

            setPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY)),
            });
        };

        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            const distanceX = Math.abs(touch.clientX - mouseDownPos.x);
            const distanceY = Math.abs(touch.clientY - mouseDownPos.y);
            const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            // Se moveu mais de 5px, considera como drag
            if (totalDistance > 5) {
                setIsDragging(true);
            }

            if (!isDragging && totalDistance <= 5) return;

            const newX = touch.clientX - dragStart.x;
            const newY = touch.clientY - dragStart.y;

            const maxX = window.innerWidth - 80;
            const maxY = window.innerHeight - 80;

            setPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY)),
            });
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("touchmove", handleTouchMove);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("touchmove", handleTouchMove);
        };
    }, [isDragging, dragStart, mouseDownPos]);

    return (
        <div
            ref={mascotRef}
            className={`fixed z-50 ${isDragging ? "cursor-grabbing" : "cursor-grab"} select-none active:scale-95 transition-transform`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className="w-20 h-20">
                <MascotAnimated mode="active" />
            </div>
        </div>
    );
}
