
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface CardProps {
  onExitAnimationComplete: () => void;
}

const Card: React.FC<CardProps> = ({ onExitAnimationComplete }) => {
  const [animationState, setAnimationState] = useState('entering');
  const [currentDate] = useState(new Date());

  useEffect(() => {
    // Sequence the animations: enter -> hold -> exit.
    const holdTimer = setTimeout(() => {
      setAnimationState('exiting');
    }, 4000); // Hold for 4 seconds (2.5s for print + 1.5s for float)

    return () => clearTimeout(holdTimer);
  }, []);

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
                        <div className="ticket-flip-container">
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
                                <div className="number">#001</div>
                                <div className="qrcode">
                                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlAAAAJQCAYAAABB4lpFAAAABmJLR0QA/wD/AP+gvaeTAAAgAElEQVR4nO3dW8x2Z1kn8P/L9xUsmwofIhuVTQsVFKrQugEsFEmkSJDoHIzJRA/G6BxM4jgnM3NgMugcaGaMBsaJiJNUB1SIIggIjEaqOIgIRKOAZVOsDJtBIcLXItrva985WDRU7ea73/t+nmvdz/r9knW41n3d11rPuv/vejZvAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAhOqouoMjpJE9OclWSJyV5TJLHJjmT5MFJ7pfk/lXF3Y1bknz+i9tnknw0yQeTfCDJ+5L8aZLzZdWd3HHn/tXXcG/91Xr7t/XzV11/Nf1rZ/05EFu6eC9P8sIkL0jyrUkuri1nuJuTvC3J9Ul+K8kNteVcsNlvwAJU7fi9Zq+/mv5dGOsP03lYkh9J8mdZXuhb2v44yQ9/sQdr1jvPatXnubp/1eP3mr3+avp396w/619/uAtPTPKLSf4h9RdS9fb3SV6e5LKehu5Q7/yqVZ/f6v5Vj99r9vqr6d8/Z/350rb29Yc7uSzJq5PclvoLZ23b+SS/nPVdyL3zqlZ9Xqv7Vz1+r9nrr6Z/X2L9ufttresPSR6U5CezpN3qC2Xt2xeSvDjreQ++dz7Vqs9ndf+qx+81e/3V9M/607Ktbf3ZvGuS3JT6C2O27cYk397c7fF651Gt+jxW9696/F6z119t6/27Jtafk2xrWX8266IkPxWPS3u225L8eJJTjb0fqXcO1arPYXX/qsfvNXv91bbaP+tP/7aG9WeTvjLLVyarL4BD2X4/ySOazsA4vbVXqz531f2rHr/X7PVX22L/rD9jt8r1Z3OuSPJXqT/ph7Z9JMkTGs7DKL11V6s+b9X9qx6/1+z1V9ta/6w/u9mq1p9NuSrJp1N/sg91+0ySZ1zw2Rijt+Zq1eesun/V4/eavf5qW+qf9We3W8X6sxlXJzmb+pN86NvZJN90gedkhN56q1Wfr+r+VY/fa/b6q22lf9af/Wz7Xn+6zPIz+k/O8p7zQ6oL2YhPJ3lWkr/Yw1i9N9Hqa3imReCu+Fcufarrr7aF/ll/9muf60+XGS7exyT5wySPqi5kY/5vlsepH9vxOLPfgAWo2vF7zV5/tUPvn/Wnxr7Wny73qS7gXtwvyWvi4q3wNVl6f9/qQgAKWH/qTLH+rD1AvSTJldVFbNg3J/mJ6iIAClh/aq1+/Vnz49PvyZJA9+1zWd6D/WzB2PfkgUkekOThWX7EbV+Ok3x3kt/c45gtZn8LbXZrvodciOrrZ/b+HSrrzz9m/bkLa33xnknyvuz+x7X+Kslbk/xBlve5b8zyTw/X7HSSxyV5apZ/I/CdWd6n36VPJHlSlm9IrE31Arh1a72HXKjq62f2/h0i68/ds/5M4Lrs7muSt2b5y+J5Wf9bmBfiKMs3Fn4lybnsrm8v3deEGlV/7Xbr2+z0j3/quuzufFt/Tratdf1ZnSuT3J7dnITXJ3n8/qayd5cmeVV207vzSZ62v6lcsOoFcOvb7PSPO7P+nNwW15/V+e2Mb/5NSZ6/xzlUe26Sj2Z8H9+0z0lcoOoFcOvb7PSPO7P+9NvS+rMq12R809+c5KF7nMNanEnyxozv51X7nMQFqF4At77NTv+4wzUZf36tP2O3ta0/q/L6jG32z+cw3mc+qVNZejCyp6/b6wzuXfUCuPVtdvrHHaw/Y21h/VmNJyS5LeMa/bPxDZc7/FzG9fX2LO91r0X1Arj1bXb6R2L92aVDXn9W46cyrsm/mW0n/3/qPkl+I+P6++K9Vn/PqhfArW+z0z8S688uHfL6swpHGfehs/cnedB+y5/CJUk+mDE9vjHr+euqegHc+jY7/cP6s3uHuv6swrdlTGNvS/L0Pdc+k2/JuMfUz9xz7XenegHc+jY7/cP6sx8Ht/6s5THjiwYd52VJ3jHoWIfonVk+1DfCtYOOA1DJ+rMf1p8d+ZP0J9IvJHnkvguf0MOTfD79/X77vgu/G9VPELa+zU7/sP7sz6GtP+XOZMxjvf++78In9pL09/tclve1q1UvgFvfZqd/22b92b9DWn/KPTdjbkRP3HfhE3tyxvT8ufsu/C5UL4Bb32anf9tm/dm/g1l/1vAZqKcOOMafJ7lhwHG24r1ZHlv3ctMAZmb92b+DWX9OVxeQ5GsHHOO1HfvO/lfgSb/O+Zb03zxGnLtevV9n7T3/Wx9/9tfP7Ga/fqq/jm796bPp9WcNT6AePeAY7xxwjK25fsAxyv8CAOhg/alxEOvPoQSoEY8Dt+a9A47hWyfAzKw/NQ5i/VlDgDrTuf/NST45opCN+WSSs53H8Iu7wMysPzUOYv1ZQ4C6f+d+fzukim36TOf+5RcwQAfrT53p1581BKiLO/f/3JAqtunmzv39DgcwM+tPnenXnzUEqFOd+986pIptOte5/xq+xQlwUtafOtOvP2sIUAAAUxGgAAAaCVAAAI0EKACARgIUAEAjAQoAoJEABQDQSIACAGgkQAEANCr/JU8277h4/KPO/avr79U7/17V/auef7Xe/m+9f2yYJ1AAAI0EKACARgIUAEAjAQoAoJEABQDQSIACAGgkQAEANBKgAAAaCVAAAI0EKACARgIUAEAjAQoAoJEABQDQSIACAGgkQAEANDpdXQBM7qi6AEodd+7v+oFJeQIFANBIgAIAaCRAAQA0EqAAABoJUAAAjQQoAIBGAhQAQCMBCgCgkQAFANBoDQHqfOf+fk395C7q3P/ckCoAalh/6ky//qwhQN3Suf+DhlSxTZd07n/zkCoAalh/6ky//qwhQJ3t3P+hQ6rYpjOd+5dfwAAdrD91pl9/1hCgev8C+PIkDx9RyMY8Kv1/AfTefAAqWX9qHMT6s4YA9YkBx7hiwDG25ikDjvHJAccAqGL9qXEQ688aAtQHBhzj2QOOsTXPGXCMGwYcA6CK9afGQaw/awhQI5pwbce+R5NvJ9XTszuMuPlUO+7cZh+/V2/9Vdf/KL31b/38V8/f+mP9ObFDCVBXJvn6AcfZiqck+YYBxyn/CwCgg/Vn/w5m/VlDgPrj9P8WR5L80IBjbMWIXp1L8q4BxwGoYv3ZP+vPYO9I/6PcLyR55L4Ln9Ajkvxd+vv9fwbVU/0WQPVbCNXj96quv3r8XtXX7+zbCNaf/Vnb+tNlDU+gkuR3Bxzjy5L86IDjHLofS3LxgOOMOGcA1aw/+2P92YGrM+avkduSfMuea5/JM7L0aESvnz6opuq/YKv/Aq4ev1d1/dXj96q+fmffRrD+7Mca15+DcJTkxoxp7Iey/LgZ/9iDk3w443o86htQ1Tfg6ht49fi9quuvHr9X9fU7+zaC9Wf31rr+dFnLW3jHSV456FiPT3JdklODjncITiX5pSSXDTreK7KOxQegl/Vnt6w/e3BZktsz7i+Tl2UlKbXYUZKXZ1xfb0/yuIH1Vf8FW/0XcPX4varrrx6/V/X1O/s2ivVnN9a+/hyU12Xsi+u6JBftdQbrcirLC3lkT18zuMbqG3D1Dbx6/F7V9VeP36v6+p19G8n6M9YM689BuSrjX2BvTvIV+5zESjwsyVsytpe3J3na4Dqrb8DVN/Dq8XtV1189fq/q63f2bSTrzzizrD8H500ZfxF/LMl37HMSxa5N8vGM7+MbdlBr9Q24+gZePX6v6vqrx+9Vff3Ovo1m/ek30/pzcJ6W5Zdhd/Fi+7UkT9jfVPbu8iS/kd307lySb9xBzdU34N6tev7VquuvHr9X9fU7+zaa9efkZlx/DtJLs7sX3Pkkr0pyTdbzLcQe90ny7UlenXG/sXFX28/sqP7qG3DvVj3/atX1V4/fq/r6nX3bBevPhZt9/emy1m8JXJLlHwXu+qfxP5blPerfS/KeJH+Z5NYdj9nrvkkuzfIPLK9J8vwkX7XjMT+e5ElJbt7BsdewiPXofQ31zr/6NVxdf/X4vWa//qvt4vxZf+7eoa0/XapvHvfkRUlem/3WeD7J3yS5JcnZPY57IS5J8sAsH847vcdxj5N8V5I37vD4MxMA+ugfPXZ1/qw//9ihrj8H7adT/4h469t/vdez1Ke3PuMb3/jG3wXrT/226/WnS/VfX/fmoiTXJ3lmdSEb9UdJnp3dPlbuvQnO/gTD+MY3ft3498T6U2sf60+XtQeoJPnqJG9P8ujqQjbmpiw3jk/seJzqG6jxjW/87Y5/b6w/NW7KftafLjN8C+BjSZ6b5FPVhWzIp7N8OHDVFy/Ajll/9m+a9WeGAJUs/8X5hVnhp/AP0NksP4R2Q3UhACtg/dmfqdafWQJUkrwry+9N/HV1IQfsU1l6/J7qQgBWxPqze9OtPzMFqCR5d5KnJ/lQdSEH6CNJrs5EFy/AHll/dmfK9We2AJV8qdG/X13IAXlr3BgA7o31ZzzrT4H7JPmP2d3/LdrCdj7Ji5Ocamv9UL1zML7xjW/8fbP+9G9rWH827zlZPuRXfTHMtn0oybNO0O/ReudhfOMb3/hVrD8n29ay/pDl//P8uyw/gV99Yax9+7ssqf/LTtLoHeidj/GNb3zjV7L+XPi2tvWHO7k0ySuSnEv9hbK27VySX0ry2JM2d0d652V84xvf+Gtg/bn7ba3rD3fhsUlekiXtVl841ds/JPlfSZ7Q09Ad6p2f8Y1vfOOvyWNj/bljW/v6wz14SJLvT/I7SW5P/cW0z+3dWR4rf2V3F3erd57GN77xjb9G1p/1rz9dZvhfeKM8PskLsvxQ17OSPLi2nOE+m+WrtdcneWOSG2vLuWC9N8HZ/xeX8Y1v/Lrx98X6c4BmufhGO5XkiiRfl+SJSS7P8tj1IUkekOSBSS6pKu5unM3yIcVbslysNyX5YJafvH9/kj9LcltVcR2qb6DGN77xtzt+BevPgZjx4uOwzH4DVX+ttb+Ns3azn7/q+tmwGX+JHACglAAFANBIgAIAaCRAAQA0EqAAABoJUAAAjQQoAIBGAhQAQCMBCgCgkQAFANBIgAIAaCRAAQA0EqAAABoJUAAAjQQoAIBGR9UFJDnu3H8Nc+hRPf/e8atVz3/28XtV1189fq/ZX3+9qs//1s1+/ZfW7wkUAEAjAQoAoJEABQDQSIACAGgkQAEANBKgAAAaCVAAAI0EKACARgIUAEAjAQoAoJEABQDQSIACAGgkQAEANBKgAAAaCVAAAI2OqgsY4Lhz/9l7UD3/6vF79dbfq3r+var7V636/M3e/63ff3pVn/9Nnz9PoAAAGglQAACNBCgAgEYCFABAIwEKAKCRAAUA0EiAAgBoJEABADQSoAAAGglQAACNBCgAgEYCFABAIwEKAKCRAAUA0EiAAgBodLq6gCTHnfsfbXz8XrOP39v/3v2rVZ+/XtX9178+s/dv66rXr+rrt4snUAAAjQQoAIBGAhQAQCMBCgCgkQAFANBIgAIAaCRAAQA0EqAAABoJUAAAjQQoAIBGAhQAQCMBCgCgkQAFANBIgAIAaCRAAQA0OqouYAWOO/fv7WH1+L3UXzt+r633v9fs56+6/9X961V9/VHIEygAgEYCFABAIwEKAKCRAAUA0EiAAgBoJEABADQSoAAAGglQAACNBCgAgEYCFABAIwEKAKCRAAUA0EiAAgBoJEABADQSoAAAGp2uLiDJcef+R0OqODn1zz0+9Nj69df7+u1Vff+pvn9Vj99r6vo9gQIAaCRAAQA0EqAAABoJUAAAjQQoAIBGAhQAQCMBCgCgkQAFANBIgAIAaCRAAQA0EqAAABoJUAAAjQQoAIBGAhQAQCMBCgCg0VF1AUmOO/fvnUPv+LOr7l/1NVh9/mef/+z1z666/72qz5/7X5/q+kt5AgUA0EiAAgBoJEABADQSoAAAGglQAACNBCgAgEYCFABAIwEKAKCRAAUA0EiAAgBoJEABADQSoAAAGglQAACNBCgAgEYCFABAo6PqAlbguHP/3h72jl9t9mto6/2vnr/6a81ef7Xq/lXff2evv4snUAAAjQQoAIBGAhQAQCMBCgCgkQAFANBIgAIAaCRAAQA0EqAAABoJUAAAjQQoAIBGAhQAQCMBCgCgkQAFANBIgAIAaCRAAQA0OqouIMlxdQGTqz6Hvedv9vp79c6/uv6tm/36rb7+qsevVn390METKACARgIUAEAjAQoAoJEABQDQSIACAGgkQAEANBKgAAAaCVAAAI0EKACARgIUAEAjAQoAoJEABQDQSIACAGgkQAEANBKgAAAaHVUXkOS4ePzeHlTXX232/lW/BnrnX11/terrZ+uqX/9bH79Xdf1T3788gQIAaCRAAQA0EqAAABoJUAAAjQQoAIBGAhQAQCMBCgCgkQAFANBIgAIAaCRAAQA0EqAAABoJUAAAjQQoAIBGAhQAQCMBCgCg0VF1AUmOi8ev7sHs86+uv1r19VOt+vxXX79bH7+a19/cpj5/nkABADQSoAAAGglQAACNBCgAgEYCFABAIwEKAKCRAAUA0EiAAgBoJEABADQSoAAAGglQAACNBCgAgEYCFABAIwEKAKCRAAUA0Oh0dQEDHHXufzykijqzz7+3/l7V868ev7r/vXr7t/X5z676/FeP36t6/lPzBAoAoJEABQDQSIACAGgkQAEANBKgAAAaCVAAAI0EKACARgIUAEAjAQoAoJEABQDQSIACAGgkQAEANBKgAAAaCVAAAI0EKACARqerC0hy1Ln/8ZAqTk79cHLV11/v/r31V6uuv/r+UT1+r+rzt2meQAEANBKgAAAaCVAAAI0EKACARgIUAEAjAQoAoJEABQDQSIACAGgkQAEANBKgAAAaCVAAAI0EKACARgIUAEAjAQoAoJEABQDQ6Ki6gCTHnfv3zqF6/F699Veb/fzNPn6v6uu/V3X/es3e/2qzn/9erp8OnkABADQSoAAAGglQAACNBCgAgEYCFABAIwEKAKCRAAUA0EiAAgBoJEABADQSoAAAGglQAACNBCgAgEYCFABAIwEKAKCRAAUA0OiouoAkx537V8+huv7q8emz9fPXO/9eW3/9zV5/r9nnX/366VXdvy6eQAEANBKgAAAaCVAAAI0EKACARgIUAEAjAQoAoJEABQDQSIACAGgkQAEANBKgAAAaCVAAAI0EKACARgIUAEAjAQoAoJEABQDQ6Ki6AHJcXUCx2a/B6vPX27/e+rc+fq/q+qvHrzb7/adX9fmbuv+eQAEANBKgAAAaCVAAAI0EKACARgIUAEAjAQoAoJEABQDQSIACAGgkQAEANBKgAAAaCVAAAI0EKACARgIUAEAjAQoAoJEABQDQ6Ki6gANwXF1Ap95roHr+1fVXv4Zmr79X9fW3ddXXT/X5r77/9Np6/V08gQIAaCRAAQA0EqAAABoJUAAAjQQoAIBGAhQAQCMBCgCgkQAFANBIgAIAaCRAAQA0EqAAABoJUAAAjQQoAIBGAhQAQCMBCgCg0enqApIcVxfQ6ahz/975V4/fq7f+atXnr1f1+a+m/7Vmn//s9Verfv118QQKAKCRAAUA0EiAAgBoJEABADQSoAAAGglQAACNBCgAgEYCFABAIwEKAKCRAAUA0EiAAgBoJEABADQSoAAAGglQAACNBCgAgEZH1QWweced+/dew73j95q9/tnNfg/c+vnf+vmrvn/M3v8unkABADQSoAAAGglQAACNBCgAgEYCFABAIwEKAKCRAAUA0EiAAgBoJEABADQSoAAAGglQAACNBCgAgEYCFABAIwEKAKCRAAUA0OiouoAip5M8OclVSZ6U5DFJHpvkTJIHJ7lfkvtXFXc3bkny+S9un0ny0SQfTPKBJO9L8qdJzpdVd3LH1QV0mv01VN3/6v71zr+6/tlV93/28Xu5fjtsqXmXJ3lhkhck+dYkF9eWM9zNSd6W5Pokv5XkhtpyLlj1DaTX7K+h6v5X9696Ad266v7PPn4v12+HQ2/ew5L8qyT/OslTimvZt3cleWWSX03yN8W13JPqG0iv2V9D1f2v7l/1Arp11f2fffxerl/+mScm+cUk/5DlAt3y9vdJXp7ksp6G7lB1f3q32W29f7PXP7vq/s8+fnX9HJDLkrw6yW2pvzDXtp1P8stZX5Cq7svWb0Bb79/s9c+uuv+zj19dPwfgQUl+MsvTluoLcu3bF5K8OOv5DFh1P7Z+A9p6/2avf3bV/Z99/Or6N+0Q3v+8JsvbdY+pLWM6H0nyg0neWlzH7C/i2V9D1f2v7l/v/Kvrn111/2cfv5frt8PMvwN1UZKfSvK7EZ5O4tIkv5Pkx5OcKq4FAKYya/r8yiS/nuTq6kIOxNuS/Msk/69g7Oq/wHrN+hq6Q3X/q/tX/QRi66r7P/v4vVy/HWZs3hVJ3pDk0dWFHJi/TPK8JB/a87jVN5BeM76G7qy6/9X9q15At666/7OP38v122G2t/CuyvKZHeFpvMcl+aMkz6guBADWbqYAdXWW8PTQ6kIO2Jkkb0nyTdWFAMCazfL47slZPqfzkOpCNuLTSZ6V5C/2MFb1I+xes7yG7k51/6v7V/0WztZV93/28Xu5fjvM8ATqMUn+d4SnffqKLD3/6upCAGCN1h6g7pfkNUkeVV3IBn1Nlt7ft7oQAFibtQeolyS5srqIDfvmJD9RXQQArM2a3//8nixPQPbtc1k+A/TZgrHvyQOTPCDJw7P8iOi+HCf57iS/uccxZ1L9GYpe1Z/B6DV7/7Zef/X41cy/T+n819r8M0nel+QROx7nr7J8s+8Pkvxhkhuz/NPdNTud5ScHnprl39h8Z3b/S+yfSPKkJGd3PM6Mpr4BRIDqtfXzL0D1Mf8+s89/J67L7v554q1Znmw9L+t/C/NCHGX5xtyvJDmX3fXtpfua0GRm/2eeu/xHpfvYqql/7vGrmf+25z/clUluz25utq9P8vj9TWXvLk3yquymd+eTPG1/U5nG7DeAXVwr+9yqqX/u8auZ/7bnP9xvZ/xN9qYkz9/jHKo9N8lHM76Pb9rnJCYx+w1g9DWy762a+ucev5r5b3v+Q12T8TfYN2ebv15+JskbM76fV+1zEhOY/QYw+vrY91ZN/XOPX838tz3/oV6fsTfXn89hfM7ppE5l6cHInr5urzNYv9lvACOvjYqtmvrnHr+a+W97/sM8IcltGXdj/dn4hP4dfi7j+np7ls9asZj9BjDquqjaqql/7vGrmf/E81/T05l/k3H1vD7JD2cFDV6Jf5vktYOOdZTk+wcdCwDocJRxH3p+f5IH7bf8KVyS5IMZ0+Mb4+neHab+CypjrofKrZr65x6/mvlPPP+1PIF6Zpb/vdbr9iQ/kOTmAcc6NGeTfF+WHvW6NMkzBhwHAKa0lgD1okHHeVmSdww61iF6Z5YPlY9w7aDjAAAn9Cfpf5T3hSSP3HfhE3p4ks+nv99v33fhKzX1I+j011+9VVP/3ONXM/+J57+GJ1Bnklwx4Dj/M8knBxzn0H0qS696fXOWz1UBwOasIUA9NWPq+B8DjrEVvzDgGKeTfNOA4wDAdNYSoHr9eZIbBhxnK96b5W3TXk8ccAwAmM7p6gKSfO2AY/T8xlH5+6idTvpzAm9Jf3gdce56+z/7zyls9fq7w+zzp9bWr5+t3z9LreEJ1KMHHOOdA46xNdcPOIYnUABs0qEEqBFvR23Newccw7ceAdikNQSoM5373xzfvjuJT2b5cc0efvEdgE1aQ4C6f+d+fzukim36TOf+AhQAm7SGAHVx5/6fG1LFNvX+yxu/AwXAJq0hQJ3q3P/WIVVs07nO/dfwLU4A2Ls1BCgAgKkIUAAAjQQoAIBGAhQAQCMBCgCgkQAFANBIgAIAaCRAAQA0EqAAABr5JWmqHXXufzykipPbev2zj1/d/97xe/tXff1u/fxXq55/9fnv4gkUAEAjAQoAoJEABQDQSIACAGgkQAEANBKgAAAaCVAAAI0EKACARgIUAEAjAQoAoJEABQDQSIACAGgkQAEANBKgAAAaCVAAAI1OVxcAxY6qC+jUW//xkCpOTv9r9++tv/r8VV+/s6s+f1PzBAoAoJEABQDQSIACAGgkQAEANBKgAAAaCVAAAI0EKACARgIUAEAjAQoAoNEaAtT5zv39mvrJXdS5/7khVQDAZNYQoG7p3P9BQ6rYpks69795SBUAMJk1BKiznfs/dEgV23Smc38BCoBNWkOA6n0C9eVJHj6ikI15VPqfQPWGXwCY0hoC1CcGHOOKAcfYmqcMOMYnBxwDAKazhgD1gQHHePaAY2zNcwYc44YBxwCA6azhG2wjFuFrk/zoCfc9GjD+jK4dcIwR4bdX9fk7nnz83v71jl/dv2rV/e9VPX51/6rvPxRawxOoEQHqyiRfP+A4W/GUJN8w4DieQAGwSWsIUH+c/t+CSpIfGnCMrRjRq3NJ3jXgOAAwnbU8fnxHkm/tPMbfJ7k0Pth8bx6R5CNJLu48ztuTfFt/OdOrfgujV/VbILOrvodWvwVVff6r668+/xRawxOoJPndAcf4spz8c1Bb8mPpD0/JmHMGAHS4OstfAr3bbUm+Zc+1z+QZWXo0otdP33PtazWil5Xb1udf3b9e1fXP3v/q8ZnYWh4/HiX5cJa34Hp9OMlVST434FiH5BFJnp3ksgHH+nCSy+MGkszfg+q3QGZXfQ/t7f/s57+6/urzT6G1vIV3nOSVg471+CTXJTk16HiH4FSSX8qY8JQkr0j9jRMAyLK4355xj3ZfFn8dJEsPXp5xfb09yeP2OoN1q34Lo/otiOr6q7dq1fXP3v/q8WGY12Xsi+u6JBftdQbrcipLkBzZ09fsdQbrV72AVC8A1fVXb9Wq65+9/9XjwzBXZfwL7M1JvmKfk1iJhyV5S8b28vYkT9vnJCZQvYBULwDV9Vdv1arrn73/1ePDUG/K+BfZx5J8xz4nUezaJB/P+D6+YZ+TmET1AlK9AFTXX71Vq65/9v5Xj5NzM/YAAAOuSURBVA9DPS3LL5Pv4sX2a0mesL+p7N3lSX4ju+nduSTfuL+pTKN6AaleAKrrr96qVdc/e/+rx4fhXprdveDOJ3lVkmuynm8h9rhPkm9P8uqM+42nu9p+Zl8Tmkz1AlK9AFTXX71Vq65/9v5Xj8/E1vottUuy/KPaR+54nI9l+YzU7yV5T5K/THLrjsfsdd8sv5d1ZZYQ+PwkX7XjMT+e5ElJbt7xODOa/SZa/Ts6s6u+h/b2f/bzX11/9fmn0JpP/ouSvDb7rfF8kr9JckuSs3sc90JckuSBWT4cfnqP4x4n+a4kb9zjmDOpXkB6VS9As6u+h1YHgOrzX11/9fmn0NpP/k8n+ffVRWzcf0vyH3Z4/OobWPX49Kk+f9UBglrVr//q67/X1PVXN+/eXJTk+iTPrC5ko/4oybOz27c1q19A1ePTp/r8CVDbVv36r77+e01d/9o/RH0uyfcm+Wh1IRt0U5J/kfV/JgwA9m7tASpZPuj93CSfqi5kQz6d5cPpn6guBADWaIYAlSQfTvLC+BbYPpzN8kOcN1QXAgBrNUuASpJ3Zfm9o7+uLuSAfSpLj99TXQgArNlMASpJ3p3k6Uk+VF3IAfpIkqsjPAHAvZotQCVfWuh/v7qQA/LWCKYAcMFmDFDJl95q+k9Z/n0JJ3Nbkh/L8o+WvTUKABeo+jcgRnhOkl9Icll1IZP5cJIfSPK24jqqfwekenz6VJ8/vwO1bdWv/+rrv9fU9c/6BOrOrk/ydUl+JMnni2uZwReyPHV6SurDEwBMqTp9jnZplnDwvdnv/4ubwfkkv5LkP2f5kcy1qP4LpHp8+lSfP0+gtq369V99/feauv7q5u3KY7P8D70fTHJxbSnlbk3y6iT/Jev8kHj1C6h6fPpUnz8BatuqX//V13+vqeuvbt6uPSTLD3B+X5ZfMz/0+d7Ze5K8IsmvZt0fEK9+AVWPT5/q8ydAbVv167/6+u81df3Vzdunxyd5QZZv7z0ryYNryxnus1l+2uH6JG9McmNtORes+gVUPT59qs+fALVt1a//6uu/19T1VzevyqkkV2T58PkTk1ye5W2/hyR5QJIHJrmkqri7cTbJLV/cPpvlc0wfzPIvV96f5M8y5086VL+AqsenT/X5E6C2rfr1X33995q9fgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAO0P8HJcilu877KxIAAAAASUVORK5CYII=" />
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
                                    <img src="data:image/png;base64,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" />
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
      transform: translateY(0) rotateX(0deg) scale(1);
      opacity: 1;
    }
    to {
      transform: translateY(110vh) rotateX(70deg) scale(0.8);
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
    animation: exit-ticket 1.5s cubic-bezier(0.6, 0, 0.8, 0) forwards;
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

  .ticket:hover .ticket-flip-container {
    transform: rotateY(180deg);
  }

  .ticket-flip-container {
    transition: 0.6s;
    transform-style: preserve-3d;
    position: relative;
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
        bottom: -6px;
        font-size: 2em;
        color: #b5ddff;
        font-weight: bolder;
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
  .ticket:hover .back header span {
    opacity: 0;
    animation: appear 0.5s var(--ease-elastic) forwards
      calc(var(--i) * 20ms + 400ms);
  }

  .ticket:hover .front header span {
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
  .float:hover .reflex::before {
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
