type LogoProps = {
  className?: string;
  colors?: {
    light: string;
    mid: string;
    dark: string;
  };
};

export default function Logo({
  className = "",
  colors = {
    light: "#7C1630",
    mid: "#7C1630",
    dark: "#4B0B1B",
  },
}: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="854"
      height="565"
      viewBox="0 0 854 565"
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0)">
        <path d="M599.203 117.475H700.169V365.215L599.203 231.657V117.475Z" fill="url(#g0)" />
        <path d="M112.266 417L426.581 0L528.387 134.257L317.001 417H112.266Z" fill="url(#g1)" />
        <path d="M114.007 414.66H539.501L653.386 564.301L0 565L114.007 414.66Z" fill="url(#g2)" />
        <path d="M426 269L527.667 133.344L853.018 564.301H650.386L538.193 416.651L426 269Z" fill="url(#g3)" />
      </g>

      <defs>
        {[0, 1, 2, 3].map((i) => (
          <linearGradient id={`g${i}`} key={i} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={colors.light} />
            <stop offset="0.6" stopColor={colors.mid} />
            <stop offset="0.92" stopColor={colors.dark} />
          </linearGradient>
        ))}

        <clipPath id="clip0">
          <rect width="854" height="565" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
