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
        <linearGradient
          id="g0"
          x1="732.501"
          x2="611.001"
          y1="129"
          y2="292"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={colors.dark} />
          <stop offset="0.599" stopColor={colors.mid} />
          <stop offset="0.928" stopColor={colors.light} />
        </linearGradient>
        <linearGradient
          id="g1"
          x1="263.001"
          x2="261.501"
          y1="22"
          y2="415"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={colors.dark} />
          <stop offset="0.682" stopColor={colors.mid} />
          <stop offset="0.928" stopColor={colors.light} />
        </linearGradient>
        <linearGradient
          id="g2"
          x1="0"
          x2="650.386"
          y1="489.83"
          y2="489.83"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={colors.dark} />
          <stop offset="0.682" stopColor={colors.mid} />
          <stop offset="0.928" stopColor={colors.light} />
        </linearGradient>
        <linearGradient
          id="g3"
          x1="905"
          x2="426"
          y1="514"
          y2="174.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={colors.dark} />
          <stop offset="0.682" stopColor={colors.mid} />
          <stop offset="0.928" stopColor={colors.light} />
        </linearGradient>

        <clipPath id="clip0">
          <rect width="854" height="565" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

