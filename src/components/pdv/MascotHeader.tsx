import { MascotAnimated } from "./MascotAnimated";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMascotMood } from "@/contexts/MascotContext";

// Constantes
const STORAGE_KEY = "mascot-position";
const MASCOT_SIZE = 80;
const MASCOT_PADDING = 16;
const MENU_HEIGHT = 80;
const DRAG_THRESHOLD = 5; // pixels
const CLICK_TIME_THRESHOLD = 200; // ms

/**
 * Mascote interativo flutuante
 * - Clique rápido: Navega para nova venda
 * - Pressionar e arrastar: Reposiciona o mascote
 * - Posição persistida no localStorage
 */
export function MascotHeader() {
    const navigate = useNavigate();
    const mascotRef = useRef<HTMLDivElement>(null);
    const { mood } = useMascotMood(); // Obter mood compartilhado

    // Estados
    const [position, setPosition] = useState(() => getInitialPosition());
    const [isDragging, setIsDragging] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [mouseDownPos, setMouseDownPos] = useState({ x: 0, y: 0 });
    const [mouseDownTime, setMouseDownTime] = useState(0);

    // Salvar posição no localStorage quando mudar
    useEffect(() => {
        if (position.x !== 0 || position.y !== 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
        }
    }, [position]);

    // Event handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        startDrag(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation();
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!isMouseDown) return;
        endDrag(e.clientX, e.clientY);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!isMouseDown) return;
        const touch = e.changedTouches[0];
        endDrag(touch.clientX, touch.clientY);
    };

    // Gerenciar eventos de movimento (mouse e touch)
    useEffect(() => {
        if (!isMouseDown) return;

        const handleMouseMove = (e: MouseEvent) => {
            handleMove(e.clientX, e.clientY);
        };

        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            const shouldDrag = handleMove(touch.clientX, touch.clientY);
            if (shouldDrag) {
                e.preventDefault();
            }
        };

        const handleGlobalEnd = () => {
            setIsDragging(false);
            setIsMouseDown(false);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleGlobalEnd);
        document.addEventListener("touchmove", handleTouchMove, { passive: false });
        document.addEventListener("touchend", handleGlobalEnd);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleGlobalEnd);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleGlobalEnd);
        };
    }, [isMouseDown, isDragging, dragStart, mouseDownPos]);

    // Funções auxiliares
    function getInitialPosition() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return getDefaultPosition();
            }
        }
        return getDefaultPosition();
    }

    function getDefaultPosition() {
        return {
            x: window.innerWidth - MASCOT_SIZE - MASCOT_PADDING,
            y: window.innerHeight - MASCOT_SIZE - MENU_HEIGHT - MASCOT_PADDING,
        };
    }

    function startDrag(clientX: number, clientY: number) {
        setIsMouseDown(true);
        setMouseDownPos({ x: clientX, y: clientY });
        setMouseDownTime(Date.now());
        setDragStart({
            x: clientX - position.x,
            y: clientY - position.y,
        });
    }

    function endDrag(clientX: number, clientY: number) {
        const timeDiff = Date.now() - mouseDownTime;
        const distance = calculateDistance(clientX, clientY, mouseDownPos.x, mouseDownPos.y);

        // Clique rápido sem movimento = navegar
        if (timeDiff < CLICK_TIME_THRESHOLD && distance < DRAG_THRESHOLD && !isDragging) {
            navigate("/venda/nova");
        }

        setIsDragging(false);
        setIsMouseDown(false);
    }

    function handleMove(clientX: number, clientY: number): boolean {
        const distance = calculateDistance(clientX, clientY, mouseDownPos.x, mouseDownPos.y);

        // Ativar modo drag se moveu mais que o threshold
        if (distance > DRAG_THRESHOLD) {
            setIsDragging(true);
        }

        // Só move se estiver em modo drag
        if (!isDragging && distance <= DRAG_THRESHOLD) {
            return false;
        }

        // Calcular nova posição com limites
        const newX = clientX - dragStart.x;
        const newY = clientY - dragStart.y;
        const maxX = window.innerWidth - MASCOT_SIZE;
        const maxY = window.innerHeight - MASCOT_SIZE;

        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY)),
        });

        return true; // Indica que deve prevenir default
    }

    function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    return (
        <div
            ref={mascotRef}
            className={`fixed z-50 ${isDragging ? "cursor-grabbing" : "cursor-grab"} select-none active:scale-95 transition-transform`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className="w-20 h-20" style={{ pointerEvents: 'none' }}>
                <MascotAnimated mode={mood} />
            </div>
        </div>
    );
}
