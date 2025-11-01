
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { playPrintingSound } from '../utils/audioCues';

interface CardProps {
  onExitAnimationComplete: () => void;
}

const PLACEHOLDER_QR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQMAAACXljzdAAAABlBMVEX///8AAABVwtN+AAABaklEQVR42u3WMW7DMAwEUJjU0iZpA6UDoAQ0UqTNkC6QO1A6AOzY8QaKNLEzI1mJ/2R8Fz+sSCylgkdV5Y5Z7pjlzlgBwN/z5o+Z745Z7pjlzlh3zHJLzPdscc8sc8css8wyyxwh4/Lmx+bmsjlmuWOWO2cF5O5Y5m5zzHLLLHN8O2b5Y/M9Y5Y7Z7ljljtjBbJ7rpllljn+z3JHZLPMMscss8wyS8wLyL1jlplljjn+zHLLLHMs4e5Y5jlmuWOWO2cFMueOWe6Y5Q4A/h3O8sckd8wyS8wyyxwh4/Lmsjn+zDLLO+OWWWaZZZZZ5o7ZPSuQ2TPLHLPMMsscsdwxyx2zzDLLLDOsO2aZZeaO2TPLHLPMMscss8wyyxwh4/Lmh80ds8wyS8wyyxyx3DLLnLHcMcsds8wyS8wyyxwh4/Lmh80ds8wyS8wyyxyx3DLLnLHcMcsds8wyS8wyyxwh4/Lmh80ds8wyS8wyyxwnmfsL5w9U3v5dAAAAAElFTSuQmCC";

const Card: React.FC<CardProps> = ({ onExitAnimationComplete }) => {
  const [animationState, setAnimationState] = useState('entering');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentDate] = useState(new Date());
  const [userName, setUserName] = useState('AGENT');
  const [qrCodeUrlFront, setQrCodeUrlFront] = useState(PLACEHOLDER_QR);
  const [qrCodeUrlBack, setQrCodeUrlBack] = useState(PLACEHOLDER_QR);

  useEffect(() => {
    // Play the printing sound and vibration as soon as the component mounts.
    playPrintingSound();
    if ('vibrate' in navigator) {
      // A pattern to simulate a printer's mechanical movements.
      navigator.vibrate([100, 30, 100, 30, 100, 30, 200, 30, 200, 30, 200, 30, 400]);
    }

    // retrieve user name from local storage
    const storedName = localStorage.getItem('jarvis-user-name');
    if (storedName) {
      setUserName(storedName.toUpperCase());
    }

    // Generate dynamic QR code
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const qrData = JSON.stringify({ 
        user: storedName || 'AGENT', 
        issued: dateStr,
        passId: `JARVIS-${Math.random().toString(36).substring(2, 10).toUpperCase()}` 
    });
    const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/?data=';
    setQrCodeUrlBack(`${baseUrl}${encodeURIComponent(qrData)}&size=140x140&bgcolor=ffffff&color=000000&qzone=1`);
    setQrCodeUrlFront(`${baseUrl}${encodeURIComponent(qrData)}&size=70x70&bgcolor=ffffff&color=000000&qzone=1`);

    // Sequence the animations:
    // 1. The 'entering' animation (print) is 2.5s.
    // 2. After printing is done, trigger the flip.
    const flipTimer = setTimeout(() => {
      setIsFlipped(true);
    }, 2500);

    // 3. After flipping and holding, trigger the exit animation.
    const exitTimer = setTimeout(() => {
      setAnimationState('exiting');
    }, 4500); // 2.5s (print) + 0.6s (flip transition) + ~1.4s (hold)

    return () => {
        clearTimeout(flipTimer);
        clearTimeout(exitTimer);
    };
  }, [currentDate]);

  const handleAnimationEnd = () => {
    if (animationState === 'exiting') {
      onExitAnimationComplete();
    }
  };
  
  // Helper to format the current date and prepare it for animated display
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return {
      day,
      month,
      year,
      full: `${year}-${month}-${day}`, // For the dateTime attribute
      parts: `${day}/${month}/${year}`.split(''), // For individual span animation
    };
  };

  const formattedDate = formatDate(currentDate);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <StyledWrapper>
            <div>
                <div className="output">
                <div className="wrap-colors-1"><div className="bg-colors" /></div>
                <div className="wrap-colors-2"><div className="bg-colors" /></div>
                <div className="cover" />
                </div>
                <div className="area">
                <div className="area-wrapper">
                    <div className="ticket-mask">
                    <div 
                      className={`ticket ${animationState}`}
                      onAnimationEnd={handleAnimationEnd}
                    >
                        <div className={`ticket-flip-container ${isFlipped ? 'flipped' : ''}`}>
                        <div className="float">
                            <div className="front">
                            <div className="ticket-body">
                                <div className="reflex" />
                                <svg className="icon-cube" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path style={{'--i': 1} as React.CSSProperties} className="path-center" d="M12 12.75L14.25 11.437M12 12.75L9.75 11.437M12 12.75V15" stroke="black" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                                <path style={{'--i': 2} as React.CSSProperties} className="path-t" d="M9.75 3.562L12 2.25L14.25 3.563" stroke="black" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                                <path style={{'--i': 3} as React.CSSProperties} className="path-tr" d="M21 7.5L18.75 6.187M21 7.5V9.75M21 7.5L18.75 8.813" stroke="black" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                                <path style={{'--i': 4} as React.CSSProperties} className="path-br" d="M21 14.25V16.5L18.75 17.813" stroke="black" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                                <path style={{'--i': 5} as React.CSSProperties} className="path-b" d="M12 21.75L14.25 20.437M12 21.75V19.5M12 21.75L9.75 20.437" stroke="black" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                                <path style={{'--i': 6} as React.CSSProperties} className="path-bl" d="M5.25 17.813L3 16.5V14.25" stroke="black" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                                <path style={{'--i': 7} as React.CSSProperties} className="path-tl" d="M3 7.5L5.25 6.187M3 7.5L5.25 8.813M3 7.5V9.75" stroke="black" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <header>
                                <div className="ticket-name">
                                    <div>
                                    <span style={{'--i': 1} as React.CSSProperties}>D</span>
                                    <span style={{'--i': 2} as React.CSSProperties}>I</span>
                                    <span style={{'--i': 3} as React.CSSProperties}>G</span>
                                    <span style={{'--i': 4} as React.CSSProperties}>I</span>
                                    <span style={{'--i': 5} as React.CSSProperties}>T</span>
                                    <span style={{'--i': 6} as React.CSSProperties}>A</span>
                                    <span style={{'--i': 7} as React.CSSProperties}>L</span>
                                    </div>
                                    <div>
                                    <span className="bold" style={{'--i': 8} as React.CSSProperties}>P</span>
                                    <span className="bold" style={{'--i': 9} as React.CSSProperties}>A</span>
                                    <span className="bold" style={{'--i': 10} as React.CSSProperties}>S</span>
                                    <span className="bold" style={{'--i': 11} as React.CSSProperties}>S</span>
                                    </div>
                                </div>
                                <div className="barcode" />
                                </header>
                                <div className="contents">
                                <div className="event">
                                    <div>
                                    <span className="bold">AI</span>
                                    <span>verse</span>
                                    </div>
                                    <div>CONFERENCE</div>
                                </div>
                                <div className="number">
                                    <div>AGENT</div>
                                    <div className="name">{userName}</div>
                                </div>
                                <div className="qrcode">
                                    <img src={qrCodeUrlFront} alt="QR Code for Digital Pass" />
                                </div>
                                </div>
                            </div>
                            </div>
                            <div className="back">
                            <div className="ticket-body">
                                <div className="reflex" />
                                <header>
                                <div className="ticket-name">
                                    <div>
                                    <span style={{'--i': 1} as React.CSSProperties}>D</span>
                                    <span style={{'--i': 2} as React.CSSProperties}>I</span>
                                    <span style={{'--i': 3} as React.CSSProperties}>G</span>
                                    <span style={{'--i': 4} as React.CSSProperties}>I</span>
                                    <span style={{'--i': 5} as React.CSSProperties}>T</span>
                                    <span style={{'--i': 6} as React.CSSProperties}>A</span>
                                    <span style={{'--i': 7} as React.CSSProperties}>L</span>
                                    </div>
                                    <div>
                                    <span className="bold" style={{'--i': 8} as React.CSSProperties}>P</span>
                                    <span className="bold" style={{'--i': 9} as React.CSSProperties}>A</span>
                                    <span className="bold" style={{'--i': 10} as React.CSSProperties}>S</span>
                                    <span className="bold" style={{'--i': 11} as React.CSSProperties}>S</span>
                                    </div>
                                </div>
                                <time dateTime={`${formattedDate.full}T00:00:00Z`}>
                                   {formattedDate.parts.map((char, index) => {
                                      const isSlash = char === '/';
                                      // Stagger animation from existing indices
                                      const animationIndex = 11 + index; 
                                      return (
                                        <span 
                                          key={index}
                                          style={{'--i': animationIndex} as React.CSSProperties} 
                                          className={isSlash ? 'slash' : 'bold'}
                                        >
                                          {char}
                                        </span>
                                      );
                                  })}
                                </time>
                                </header>
                                <div className="contents">
                                <div className="qrcode">
                                    <img src={qrCodeUrlBack} alt="QR Code for Digital Pass" />
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                <div className="noise">
                <svg height="100%" width="100%">
                    <defs>
                    <pattern height={500} width={500} patternUnits="userSpaceOnUse" id="noise-pattern">
                        <filter y={0} x={0} id="noise">
                        <feTurbulence stitchTiles="stitch" numOctaves={3} baseFrequency="0.65" type="fractalNoise" />
                        <feBlend mode="screen" />
                        </filter>
                        <rect filter="url(#noise)" height={500} width={500} />
                    </pattern>
                    </defs>
                    <rect fill="url(#noise-pattern)" height="100%" width="100%" />
                </svg>
                </div>
            </div>
        </StyledWrapper>
    </div>
  );
}

const StyledWrapper = styled.div`
  
  transform-style: preserve-3d;
  perspective: 1000px;
  
  @keyframes print-ticket {
    from {
      /* Start translated up by its own height, making it invisible */
      transform: translateY(-100%);
    }
    to {
      /* Slide down into its final position */
      transform: translateY(0);
    }
  }

  @keyframes exit-ticket {
    from {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    to {
      transform: translateY(110vh) scale(0.9);
      opacity: 0;
    }
  }

  .ticket.entering {
    animation: print-ticket 2.5s cubic-bezier(0.4, 0.9, 0.5, 1) forwards;
  }
  
  .ticket.entering .float {
    animation: float 3s ease-in-out 2.5s infinite;
  }

  .ticket.exiting {
    animation: exit-ticket 1.2s cubic-bezier(0.6, 0.05, 0.8, 0) forwards;
  }
  
  .ticket.exiting .float {
    animation: none;
  }

  .output {
    align-self: center;
    background: inherit;
    border-radius: 100px;
    padding: 0 12px 0 10px;
    height: 36px;
    min-width: 350px;
    position: relative;
    top: -140px;
    z-index: 5;

    .cover {
      position: absolute;
      top: 2px;
      right: 2px;
      bottom: 2px;
      left: 2px;
      border-radius: 100px;
      clip-path: inset(0 0 0 0 round 100px);
      background: #101216;
      transition: filter 1000ms cubic-bezier(0, 0, 0, 1);
      filter: blur(5px);
    }
    .cover::after {
      content: "";
      top: -10px;
      right: -10px;
      bottom: -10px;
      left: -10px;
      border-radius: 100px;
      position: absolute;
      background: inherit;
      opacity: 0.5;
    }

    .wrap-colors-1,
    .wrap-colors-2 {
      overflow: hidden;
      border-radius: 100px;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      pointer-events: none;
    }
    .wrap-colors-1 {
      opacity: 0.35;
      filter: blur(3px);
    }
    .bg-colors {
      background: conic-gradient(
        transparent 0deg,
        #8400ff 65deg,
        #00ccff 144deg,
        #1356b4 180deg,
        transparent 324deg,
        transparent 360deg
      );
      position: absolute;
      width: 400px;
      height: 400px;
      margin: auto;
      inset: 0;
      left: 50%;
      transform: translateX(-50%) rotate(220deg);
      border-radius: 50%;
      animation: cycle-rotate 3s ease-in-out infinite;
    }
  }
  .output::before {
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: inherit;
    position: absolute;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: #ffffff14;
    opacity: 0.4;
    transition:
      opacity 400ms linear,
      background-color 400ms linear;
  }
  .output::after {
    content: "";
    position: absolute;
    left: 12px;
    right: 12px;
    top: 14px;
    background: linear-gradient(0deg, transparent, black);
    height: 9px;
    mix-blend-mode: soft-light;
    border-radius: 100px;
  }

  @keyframes cycle-opacity {
    0% {
      opacity: 0;
    }
    30% {
      opacity: 1;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  @keyframes cycle-rotate {
    from {
      transform: translateX(-50%) rotate(0deg);
    }
    to {
      transform: translateX(-50%) rotate(360deg);
    }
  }

  .area {
    --ease-elastic: cubic-bezier(0.5, 2, 0.3, 0.8);

    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    inset: 0;

    .area-wrapper {
      &:hover .wrapper {
        transform: translateY(0) scale(1);
        box-shadow: 0 20px 50px -5px black;
      }
    }
  }

  .area::after {
    pointer-events: none;
    content: "";
    position: absolute;
    top: 66%;
    left: 0;
    right: 0;
    height: 100px;
    width: 30%;
    margin: auto;
    background-color: #648cc630;
    filter: blur(2em);
    opacity: 0.7;
    transform: perspective(10px) rotateX(5deg) scale(1, 0.5);
    z-index: 0;
  }

  .ticket-mask {
    overflow: hidden;
    display: flex;
    justify-content: center;
    perspective: 1000px;
    /* This padding ensures the top of the ticket doesn't get clipped by the mask */
    padding-top: 40px;
    /* Mask creates a soft edge at the top, hiding the ticket before it prints */
    mask-image: linear-gradient(to bottom, transparent 0%, black 40px);
  }

  .ticket {
    transform-style: preserve-3d;
    transform: translateY(-100%); /* Start position for the printing animation */
  }
  

  .ticket:nth-child(2) .ticket-body {
    transition-delay: 0.7s;
  }

  .ticket-flip-container {
    transition: 0.6s;
    transform-style: preserve-3d;
    position: relative;
  }
  
  .ticket-flip-container.flipped {
    transform: rotateY(180deg);
  }


  .float {
    transform-style: preserve-3d;
    pointer-events: none;
  }

  .front,
  .back {
    display: inline-block;
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }

  .front {
    z-index: 1;
  }

  .back {
    position: absolute;
    top: 0;
    left: 0;
    transform: rotateY(-180deg);
  }

  @keyframes float {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
    100% {
      transform: translateY(0);
    }
  }

  .icon-cube {
    position: absolute;
    height: 110%;
    z-index: 1;
    top: -3px;
    left: 0;
    right: 0;
    margin: auto;
    mix-blend-mode: soft-light;
    opacity: 0.6;
  }

  .icon-cube path {
    animation-delay: calc(var(--i) * 100ms) !important;
    transform-origin: center;
  }

  .icon-cube .path-center {
    animation: path-center 3s ease-in-out infinite;
  }
  @keyframes path-center {
    50% {
      transform: scale(1.3);
    }
  }

  .icon-cube .path-t {
    animation: path-t 1.6s ease-in-out infinite;
  }
  @keyframes path-t {
    50% {
      transform: translateY(1px);
    }
  }

  .icon-cube .path-tl {
    animation: path-tl 1.6s ease-in-out infinite;
  }
  @keyframes path-tl {
    50% {
      transform: translateX(1px) translateY(1px);
    }
  }

  .icon-cube .path-tr {
    animation: path-tr 1.6s ease-in-out infinite;
  }
  @keyframes path-tr {
    50% {
      transform: translateX(-1px) translateY(1px);
    }
  }

  .icon-cube .path-br {
    animation: path-br 1.6s ease-in-out infinite;
  }
  @keyframes path-br {
    50% {
      transform: translateX(-1px) translateY(-1px);
    }
  }

  .icon-cube .path-bl {
    animation: path-bl 1.6s ease-in-out infinite;
  }
  @keyframes path-bl {
    50% {
      transform: translateX(1px) translateY(-1px);
    }
  }

  .icon-cube .path-b {
    animation: path-b 1.6s ease-in-out infinite;
  }
  @keyframes path-b {
    50% {
      transform: translateY(-1px);
    }
  }

  .ticket-body {
    display: block;
    position: relative;
    width: 320px;
    margin-bottom: 20px;
    padding: 0;
    border-radius: 7px 7px 0px 0px;
    background-color: white;
    text-align: center;
    background: linear-gradient(to bottom, white, #dcfffd);
    color: black;

    svg,
    img {
      pointer-events: none;
    }

    .bold {
      font-weight: 800;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      padding: 15px;
      border-bottom: 1px dashed rgba(0, 0, 0, 0.4);
      text-align: left;
      height: 54px;

      .ticket-name {
        font-weight: 300;
        font-size: 1.05em;
        line-height: normal;
        align-items: center;
        display: flex;
        gap: 4px;
        letter-spacing: -2px;
      }

      span {
        display: inline-block;
      }

      time {
        display: flex;
      }

      .slash {
        padding: 0 1px;
        color: rgba(0, 0, 0, 0.4);
      }
    }
    header::after,
    header::before {
      content: "";
      display: block;
      width: 13px;
      height: 13px;
      background-color: #0f1114;
      position: absolute;
      right: -8px;
      border-radius: 50%;
      z-index: 11;
      bottom: -7px;
    }
    header:after {
      left: -8px;
    }
    .contents {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      min-height: 180px;
      position: relative;
      pointer-events: all;

      .event {
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
        margin-top: -30px;
        font-weight: 600;

        span {
          display: inline-block;
          height: 15px;
          font-size: 3rem;
          font-weight: 400;
          line-height: 1;
        }
        span.bold {
          font-size: 2.18rem;
          font-weight: 800;
          margin-right: -3px;
        }

        div:nth-child(2) {
          font-size: 13px;
          letter-spacing: 0.45em;
          margin-left: 6px;
          color: #2f4c8b62;
        }
      }

      .number {
        position: absolute;
        left: 15px;
        bottom: 5px;
        text-align: left;
        font-size: 0.75rem;
        color: rgba(0, 0, 0, 0.4);
        font-weight: 700;
        letter-spacing: 0.05em;
        
        .name {
            font-size: 1.5rem;
            font-weight: 800;
            color: #000;
            letter-spacing: normal;
            line-height: 1;
        }
      }
    }
  }
  .ticket-body:after {
    content: "";
    display: block;
    position: absolute;
    bottom: -16px;
    left: 0;
    background:
      -webkit-linear-gradient(-135deg, #dcfffd 50%, transparent 50%) 0 50%,
      -webkit-linear-gradient(-45deg, #dcfffd 50%, transparent 50%) 0 50%,
      transparent;
    background-repeat: repeat-x;
    background-size:
      16px 16px,
      16px 16px,
      cover,
      cover;
    height: 16px;
    width: 100%;
    pointer-events: none;
  }

  .barcode {
    box-shadow:
      1px 0 0 1px,
      5px 0 0 1px,
      10px 0 0 1px,
      11px 0 0 1px,
      15px 0 0 1px,
      18px 0 0 1px,
      22px 0 0 1px,
      23px 0 0 1px,
      26px 0 0 1px,
      30px 0 0 1px,
      35px 0 0 1px,
      37px 0 0 1px,
      41px 0 0 1px,
      44px 0 0 1px,
      47px 0 0 1px,
      51px 0 0 1px,
      56px 0 0 1px,
      59px 0 0 1px,
      64px 0 0 1px,
      68px 0 0 1px,
      72px 0 0 1px,
      74px 0 0 1px,
      77px 0 0 1px,
      81px 0 0 1px,
      85px 0 0 1px,
      88px 0 0 1px,
      92px 0 0 1px,
      95px 0 0 1px,
      96px 0 0 1px,
      97px 0 0 1px;
    display: inline-block;
    height: 30px;
    width: 0;
    left: 65%;
    position: absolute;
    top: 12px;
  }

  @keyframes appear {
    0% {
      opacity: 0;
      transform: translateX(100%);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes appear2 {
    0% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateX(100%);
    }
  }

  .back header span {
    animation: none;
  }
  .ticket-flip-container.flipped .back header span {
    opacity: 0;
    animation: appear 0.5s var(--ease-elastic) forwards
      calc(var(--i) * 20ms + 400ms);
  }

  .ticket-flip-container.flipped .front header span {
    opacity: 1;
    animation: appear2;
  }
  .front header span {
    opacity: 0;
    animation: appear 0.5s var(--ease-elastic) forwards
      calc(var(--i) * 20ms + 400ms);
  }

  .qrcode {
    position: absolute;
    z-index: 1;
    color: #a5b7eb;

    img {
      display: block;
      height: 140px;
    }
  }
  .back .qrcode {
    margin-top: 8px;
  }
  .back .qrcode::after {
    --stroke-width: 0.2rem;
    --corner-size: 1rem;

    position: absolute;
    content: "";
    background:
      linear-gradient(
          to right,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        0 0,
      linear-gradient(
          to right,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        0 100%,
      linear-gradient(
          to left,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        100% 0,
      linear-gradient(
          to left,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        100% 100%,
      linear-gradient(
          to bottom,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        0 0,
      linear-gradient(
          to bottom,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        100% 0,
      linear-gradient(
          to top,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        0 100%,
      linear-gradient(
          to top,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        100% 100%;
    background-size: var(--corner-size) var(--corner-size);
    inset: 0;
    background-repeat: no-repeat;
  }
  .back .qrcode::after {
    animation: breath 3s var(--ease-elastic) infinite;
  }

  @keyframes breath {
    0% {
      transform: scale(1.05);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.15);
      opacity: 1;
    }
    100% {
      transform: scale(1.05);
      opacity: 0.3;
    }
  }

  .front .qrcode {
    right: 5px;
    bottom: -5px;

    img {
      height: 70px;
    }
  }

  .reflex {
    pointer-events: none;
    position: absolute;
    inset: 0;
    bottom: -5px;
    z-index: 10;
    overflow: hidden;
  }
  .reflex::before {
    content: "";
    position: absolute;
    width: 300px;
    background-color: rgba(255, 255, 255, 0.4);
    background: linear-gradient(
      to right,
      rgba(221, 249, 255, 0.4) 10%,
      rgba(221, 245, 255, 0.7) 60%,
      rgba(221, 246, 255, 0.6) 60%,
      rgba(221, 255, 254, 0.4) 90%
    );
    top: -10%;
    bottom: -10%;
    left: -132%;
    transform: translateX(0) skew(-30deg);
    transition: all 0.7s ease;
  }
  .float:hover .reflex::before, .ticket-flip-container.flipped .reflex::before {
    transform: translate(280%, 0) skew(-30deg);
  }
  .float .front .reflex::before {
    transition-delay: 0.3s;
  }

  .ticket-body::before {
    content: "";
    position: absolute;
    inset: 0;
    mask-image: linear-gradient(white 50%, transparent 100%);
    border-radius: 7px 7px 0px 0px;
    background: radial-gradient(
        at 30% -5%,
        #90f1f1,
        #d3ccf0,
        rgba(255, 255, 255, 0) 25%
      ),
      radial-gradient(at 30% 40%, #aad1f0, rgba(255, 255, 255, 0) 20%),
      radial-gradient(at 50% 70%, #c4f2e5, rgba(255, 255, 255, 0) 30%),
      radial-gradient(at 70% 0%, #d3ccf0, rgba(255, 255, 255, 0) 20%),
      linear-gradient(
        75deg,
        #90f1f1 5%,
        rgba(255, 255, 255, 0),
        #aad1f0,
        rgba(255, 255, 255, 0),
        #e9d0ed,
        rgba(255, 255, 255, 0),
        #d3ccf0,
        rgba(255, 255, 255, 0),
        #c4f2e5 90%
      ),
      radial-gradient(at 30% 50%, #90f1f1, rgba(255, 255, 255, 0) 30%),
      radial-gradient(at 30% 50%, #9cb9fc, rgba(255, 255, 255, 0) 30%),
      radial-gradient(at 100% 50%, #90f1f1, #c2dcf2, rgba(255, 255, 255, 0) 50%),
      linear-gradient(
        115deg,
        #90f1f1 5%,
        #aad1f0 10%,
        #d3ccf0,
        #e9d0ed 20%,
        #aad1f0,
        #aad1f0 30%,
        #d3ccf0,
        #c2dcf2 40%,
        #90f1f1,
        #aad1f0 70%
      );
  }

  .noise {
    position: absolute;
    top: -25px;
    bottom: -20px;
    left: 0;
    right: 0;
    opacity: 0.07;
    mask-image: linear-gradient(
      transparent 5%,
      white 30%,
      white 70%,
      transparent 95%
    );
    filter: grayscale(1);
    pointer-events: none;
    z-index: 1;
  }
`;

export default Card;
