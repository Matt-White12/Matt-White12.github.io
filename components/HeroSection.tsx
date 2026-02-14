import Image from "next/image";

export default function HeroSection() {
  const links = [
    { label: "GitHub", href: "https://github.com/Matt-White12" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/matthew-white-58482ab7",
    },
    { label: "CodePen", href: "https://codepen.io/Matt-White12/" },
  ];

  return (
    <section className="bg-primary text-primary-content px-4 py-12 lg:py-16 border-b-4 border-base-content relative overflow-hidden">
      {/* Animated SVG Background */}
      <div className="absolute inset-0 z-0">
        {/* Waves */}
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-[65%]"
          style={{ animation: "wave-drift 20s ease-in-out infinite" }}
          viewBox="0 0 2400 200"
          preserveAspectRatio="none"
        >
          <path
            d="M0,120 C200,180 400,60 600,120 C800,180 1000,60 1200,120 C1400,180 1600,60 1800,120 C2000,180 2200,60 2400,120 L2400,200 L0,200 Z"
            fill="white"
            opacity="0.1"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-[55%]"
          style={{ animation: "wave-drift 15s ease-in-out infinite reverse" }}
          viewBox="0 0 2400 200"
          preserveAspectRatio="none"
        >
          <path
            d="M0,140 C300,100 500,180 800,140 C1100,100 1300,180 1600,140 C1900,100 2100,180 2400,140 L2400,200 L0,200 Z"
            fill="white"
            opacity="0.07"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-[45%]"
          style={{ animation: "wave-drift 25s ease-in-out infinite" }}
          viewBox="0 0 2400 200"
          preserveAspectRatio="none"
        >
          <path
            d="M0,160 C150,130 350,190 600,160 C850,130 1050,190 1200,160 C1450,130 1650,190 1800,160 C2050,130 2250,190 2400,160 L2400,200 L0,200 Z"
            fill="white"
            opacity="0.12"
          />
        </svg>

        {/* Bubbles */}
        <svg className="absolute inset-0 w-full h-full">
          <circle
            cx="10%"
            cy="80%"
            r="8"
            fill="white"
            opacity="0.08"
            style={{ animation: "bubble-float 12s ease-in-out infinite" }}
          />
          <circle
            cx="25%"
            cy="90%"
            r="14"
            fill="white"
            opacity="0.06"
            style={{ animation: "bubble-float 18s ease-in-out 2s infinite" }}
          />
          <circle
            cx="45%"
            cy="85%"
            r="6"
            fill="white"
            opacity="0.1"
            style={{ animation: "bubble-float 14s ease-in-out 5s infinite" }}
          />
          <circle
            cx="60%"
            cy="95%"
            r="20"
            fill="white"
            opacity="0.04"
            style={{ animation: "bubble-float 22s ease-in-out 1s infinite" }}
          />
          <circle
            cx="75%"
            cy="88%"
            r="10"
            fill="white"
            opacity="0.07"
            style={{ animation: "bubble-float 16s ease-in-out 8s infinite" }}
          />
          <circle
            cx="90%"
            cy="92%"
            r="12"
            fill="white"
            opacity="0.05"
            style={{ animation: "bubble-float 20s ease-in-out 4s infinite" }}
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 relative z-10">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-60 mb-2">
            Software Developer
          </p>
          <div className="flex items-end gap-4">
            <Image
              src="/logo-trimmed.png"
              alt="MW Logo"
              width={144}
              height={138}
              className="w-10 h-10 lg:w-12 lg:h-12 brightness-0 invert"
            />
            <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tight">
              Matt White
            </h1>
          </div>
          <p className="mt-4 text-sm font-mono leading-relaxed text-primary-content/70 max-w-xl">
            Building things on the web. Welcome to my corner of the internet.
          </p>
        </div>
        <nav className="flex flex-row gap-2 flex-wrap lg:justify-end">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-primary-content/40 px-5 py-2 text-sm font-mono font-bold uppercase tracking-wider hover:bg-primary-content hover:text-primary transition-all"
            >
              {link.label} &rarr;
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
