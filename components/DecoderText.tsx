import React, { useEffect, useRef } from 'react';
import { useSpring } from 'framer-motion';

// Katakana-like glyphs for the decoding animation
const glyphs = [
  'ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ',
  'サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト',
  'ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ',
  'マ','ミ','ム','メ','モ','ヤ','ユ','ヨ','ー','ラ',
  'リ','ル','レ','ロ','ワ','ヰ','ヱ','ヲ','ン','ガ',
  'ギ','グ','ゲ','ゴ','ザ','ジ','ズ','ゼ','ゾ','ダ',
  'ヂ','ヅ','デ','ド','バ','ビ','ブ','ベ','ボ','パ',
  'ピ','プ','ペ','ポ',
];

interface DecoderTextProps {
  text: string;
  className?: string;
  delay?: number; // ms
  speed?: number; // (not used directly for timing here, kept for API parity)
  highlightIndexes?: number[]; // indexes that should be highlighted (lime, no glow)
}

/**
 * DecoderText
 * - slowly reveals `text` from random glyphs
 * - highlightIndexes: characters at these positions will be rendered with lime color AND without glow
 * - other resolved characters will be white (and will show the animate-text-glow class)
 *
 * Note: this component writes innerHTML to a span for performance during rapid updates.
 */
export const DecoderText: React.FC<DecoderTextProps> = ({
  text,
  className = '',
  delay = 0,
  speed = 10,
  highlightIndexes = [],
}) => {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const outputRef = useRef<{ type: 'glyph' | 'value'; value: string }[]>([]);
  // simple spring to drive 0 -> text.length (frames)
  const spring = useSpring(0, { stiffness: 6, damping: 6 });

  const shuffle = (content: string[], output: any[], position: number) => {
    return content.map((value, index) => {
      if (index < position) {
        return { type: 'value' as const, value };
      }
      // show glyphs randomly before locked in
      const rand = Math.floor(Math.random() * glyphs.length);
      return { type: 'glyph' as const, value: glyphs[rand] };
    });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const content = text.split('');
    // initialize with empty glyphs
    outputRef.current = content.map(() => ({ type: 'glyph', value: '' }));

    const render = () => {
      // Build HTML where:
      // - resolved characters (type === 'value'):
      //     - if index is highlighted: lime color, NO glow (no animate-text-glow)
      //     - else: white + animate-text-glow
      // - glyph characters: dim limeish glyph color
      const html = outputRef.current
        .map((item, i) => {
          if (item.type === 'glyph') {
            // glyph styling (dim, small opacity)
            return `<span aria-hidden="true" class="opacity-70 text-lime-300 select-none">${item.value}</span>`;
          } else {
            const isHighlight = highlightIndexes.includes(i);
            if (isHighlight) {
              // highlighted (lime) WITHOUT glow
              return `<span aria-hidden="true" class="text-lime-400 select-none" style="text-shadow: none;">${item.value}</span>`;
            } else {
              // white with glow class applied to this span (so glow doesn't affect highlighted spans)
              return `<span aria-hidden="true" class="text-white select-none animate-text-glow">${item.value}</span>`;
            }
          }
        })
        .join('');
      el.innerHTML = html;
    };

    const unsub = spring.on('change', (value) => {
      // spring value will be numeric between 0 and content.length
      outputRef.current = shuffle(content, outputRef.current, value);
      render();
    });

    // start after optional delay
    const start = async () => {
      if (delay > 0) await new Promise((r) => setTimeout(r, delay));
      // set to content length to drive reveal — final duration depends on spring config
      spring.set(content.length);
    };
    start().catch(() => {});

    return () => {
      unsub?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, delay, speed, JSON.stringify(highlightIndexes)]); // re-run if text or highlights change

  return (
    <span
      ref={containerRef}
      className={`inline-block font-jarvis tracking-wider ${className}`}
      aria-label={text}
      role="img"
    />
  );
};

export default DecoderText;
