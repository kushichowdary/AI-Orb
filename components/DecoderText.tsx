import React, { useState, useEffect, useRef, memo } from 'react';

// A simple hook to check for reduced motion preference.
const useReducedMotion = () => {
    const [reducedMotion, setReducedMotion] = React.useState(false);
    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const getInitial = () => mediaQuery.matches;
        setReducedMotion(getInitial());

        const listener = (event: MediaQueryListEvent) => {
            setReducedMotion(event.matches);
        };
        
        // In some older browsers, addEventListener is not supported on media queries.
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', listener);
        } else {
            // Deprecated but necessary for backward compatibility.
            mediaQuery.addListener(listener);
        }

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', listener);
            } else {
                mediaQuery.removeListener(listener);
            }
        };
    }, []);
    return reducedMotion;
};

// prettier-ignore
const glyphs = [
  'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ',
  'サ', 'シ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト',
  'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
  'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ー', 'ラ',
  'リ', 'ル', 'レ', 'ロ', 'ワ', 'ヰ', 'ヱ', 'ヲ', 'ン', 'ガ',
  'ギ', 'グ', 'ゲ', 'ゴ', 'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ', 'ダ',
  'ヂ', 'ヅ', 'デ', 'ド', 'バ', 'ビ', 'ブ', 'ベ', 'ボ', 'パ',
  'ピ', 'プ', 'ペ', 'ポ', '0', '1', '2', '3', '4', '5', '6',
  '7', '8', '9', '#', '$', '%', '&', '*', '(', ')', '_', '+',
];

const CharType = {
  Glyph: 'glyph',
  Value: 'value',
};

type Char = {
    type: string;
    value: string;
};

function shuffle(content: string[], output: Char[], position: number): Char[] {
  return content.map((value, index) => {
    if (index < position) {
      return { type: CharType.Value, value };
    }
    if (Math.random() < 0.95 && output[index]?.value) {
        return { type: CharType.Glyph, value: output[index].value };
    }
    const rand = Math.floor(Math.random() * glyphs.length);
    return { type: CharType.Glyph, value: glyphs[rand] };
  });
}

interface DecoderTextProps {
    text: string;
    delay?: number;
    className?: string;
    onComplete?: () => void;
}

export const DecoderText: React.FC<DecoderTextProps> = memo(({ text, delay = 0, className, onComplete }) => {
    const [output, setOutput] = useState<Char[]>([{ type: CharType.Glyph, value: '' }]);
    const animationFrameId = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const onCompleteRef = useRef(onComplete);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        const content = text.split('');
        
        if (reduceMotion) {
            setOutput(content.map(char => ({ type: CharType.Value, value: char })));
            onCompleteRef.current?.();
            return;
        }

        const startAnimation = () => {
            setOutput(content.map(() => ({ type: CharType.Glyph, value: '' })));
            
            const characterRevealDuration = 100; // Slower for the Jarvis effect
            const totalDuration = content.length * characterRevealDuration;
            
            const animate = (timestamp: number) => {
                if (!startTimeRef.current) {
                    startTimeRef.current = timestamp;
                }
                const elapsedTime = timestamp - startTimeRef.current;
                const progress = Math.min(elapsedTime / totalDuration, 1);
                const position = Math.floor(progress * content.length);

                setOutput(prevOutput => shuffle(content, prevOutput, position));

                if (progress < 1) {
                    animationFrameId.current = requestAnimationFrame(animate);
                } else {
                    setOutput(content.map(char => ({ type: CharType.Value, value: char })));
                    onCompleteRef.current?.();
                }
            };
            
            animationFrameId.current = requestAnimationFrame(animate);
        };
        
        const timeoutId = setTimeout(startAnimation, delay);

        return () => {
            clearTimeout(timeoutId);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            startTimeRef.current = null;
        };

    }, [text, delay, reduceMotion]);

    return (
        <span className={`decoder-text ${className || ''}`} aria-label={text}>
             <span aria-hidden="true">
                {output.map((char, index) => (
                    <span key={index} className={`decoder-char ${char.type === CharType.Glyph ? 'glyph' : 'value'}`}>
                        {char.value}
                    </span>
                ))}
             </span>
        </span>
    );
});