
import React, { memo, useEffect, useRef } from 'react';
import { VisuallyHidden } from './VisuallyHidden';

// prettier-ignore
const glyphs = [
  'ア', 'イ', 'ウ', 'エ', 'オ',
  'カ', 'キ', 'ク', 'ケ', 'コ',
  'サ', 'シ', 'ス', 'セ', 'ソ',
  'タ', 'チ', 'ツ', 'テ', 'ト',
  'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
  'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
  'マ', 'ミ', 'ム', 'メ', 'モ',
  'ヤ', 'ユ', 'ヨ', 'ー',
  'ラ', 'リ', 'ル', 'レ', 'ロ',
  'ワ', 'ヰ', 'ヱ', 'ヲ', 'ン',
  'ガ', 'ギ', 'グ', 'ゲ', 'ゴ',
  'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ',
  'ダ', 'ヂ', 'ヅ', 'デ', 'ド',
  'バ', 'ビ', 'ブ', 'ベ', 'ボ',
  'パ', 'ピ', 'プ', 'ペ', 'ポ',
];

const CharType = {
  Glyph: 'glyph',
  Value: 'value',
};

function shuffle(content: string[], output: {type: string, value: string}[], position: number) {
  return content.map((value, index) => {
    if (index < position) {
      return { type: CharType.Value, value };
    }

    if (position % 1 < 0.5) {
      const rand = Math.floor(Math.random() * glyphs.length);
      return { type: CharType.Glyph, value: glyphs[rand] };
    }

    return { type: CharType.Glyph, value: output[index]?.value || '' };
  });
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

interface DecoderTextProps {
  text: string;
  start?: boolean;
  delay?: number;
  className?: string;
}

// FIX: The return type of `React.memo` is not compatible with `React.FC`.
// Removed the incorrect `React.FC<DecoderTextProps>` annotation and typed the props inline.
// This is the correct pattern for memoized components and can prevent obscure downstream errors.
export const DecoderText = memo(
  ({ text, start = true, delay: startDelay = 0, className = '', ...rest }: DecoderTextProps) => {
    const output = useRef([{ type: CharType.Glyph, value: '' }]);
    const containerRef = useRef<HTMLSpanElement>(null);
    // FIX: Initialize useRef with null to resolve TypeScript overload error.
    const animationFrame = useRef<number | null>(null);
    
    const isMotionReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      
      const content = text.split('');

      const renderOutput = () => {
        const characterMap = output.current.map((item, index) => {
          if (item.type === CharType.Value) {
              const char = content[index];
              const colorClass = (char === 'A' || char === 'I') ? 'text-lime-400' : '';
              return `<span class="decoder-text-value ${colorClass}">${char}</span>`;
          }
          return `<span class="decoder-text-glyph">${item.value}</span>`;
        }).join('');
        container.innerHTML = characterMap;
      };

      let startTime: number;
      const duration = content.length * 150; // 150ms per character

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const position = progress * content.length;

        output.current = shuffle(content, output.current, position);
        renderOutput();

        if (progress < 1) {
          animationFrame.current = requestAnimationFrame(animate);
        }
      };

      const startAnimation = async () => {
        await delay(startDelay);
        animationFrame.current = requestAnimationFrame(animate);
      };

      if (start && !isMotionReduced) {
        startAnimation();
      }

      if (isMotionReduced) {
        output.current = content.map(value => ({
          type: CharType.Value,
          value,
        }));
        renderOutput();
      }

      return () => {
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
        }
      };
    }, [isMotionReduced, start, startDelay, text]);

    return (
      <span className={`decoder-text ${className}`} {...rest}>
        <VisuallyHidden>{text}</VisuallyHidden>
        <span aria-hidden ref={containerRef} />
      </span>
    );
  }
);
