import React, { useRef, useEffect, useCallback } from 'react';

export const BubbleVisualizer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const drawBackground = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) {
            return;
        }
        
        const { width, height } = canvas;
        
        // Dark, simple background
        const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 1.5);
        bgGradient.addColorStop(0, '#101018'); // Dark purplish grey
        bgGradient.addColorStop(1, '#050508'); // Near black
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);
    }, []);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawBackground(); 
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [drawBackground]);
    
    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />;
};
