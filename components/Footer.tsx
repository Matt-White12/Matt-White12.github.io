export default function Footer() {
  return (
    <footer className="border-t-3 border-base-content bg-base-content text-base-100 px-4 py-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm font-bold uppercase tracking-wider opacity-60">
          Matt White &mdash; 2026
        </p>
        <nav className="flex gap-5">
          <a
            href="https://github.com/Matt-White12"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="opacity-60 hover:opacity-100 hover:text-primary transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/matthew-white-58482ab7"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="opacity-60 hover:opacity-100 hover:text-primary transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
          <a
            href="https://codepen.io/Matt-White12/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="CodePen"
            className="opacity-60 hover:opacity-100 hover:text-primary transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M24 8.182l-.018-.087-.017-.05c-.01-.024-.018-.05-.03-.075-.003-.018-.015-.034-.02-.05l-.035-.067-.03-.05-.044-.06-.046-.045-.06-.045-.046-.03-.06-.044-.044-.04-.015-.02L12.58.19c-.347-.232-.796-.232-1.142 0L.453 7.502l-.015.015-.044.035-.06.05-.038.04-.05.056-.037.045-.05.06c-.02.017-.03.03-.03.046l-.05.06-.02.06c-.02.01-.02.04-.03.07l-.01.05c-.01.03-.02.06-.02.09v7.998c0 .04.01.056.01.09l.02.06.02.05.03.08.02.05.035.06.04.07.028.04.05.06.04.04.063.05.04.03.06.04.02.02 10.96 7.33c.172.12.374.174.57.174.2 0 .396-.058.57-.174l10.96-7.33.02-.02.06-.04.04-.03.065-.05.04-.04.05-.06.03-.04.07-.07.035-.06.02-.05.03-.08.02-.05.02-.06.01-.09V8.272c0-.03-.01-.06-.01-.09zm-12.58 10.2L5.03 14.38l6.39-4.006 6.39 4.006-6.39 4.002zm.58-9.504V2.876l8.39 5.612-3.75 2.35-4.64-2.96zm-1.16 0l-4.64 2.96-3.75-2.35 8.39-5.612v6.002zm-5.81 4.31l-2.67 1.674V12.49l2.67 1.698zm1.17.734l4.64 2.96v6.002l-8.39-5.612 3.75-2.35zm5.81 2.96l4.64-2.96 3.75 2.35-8.39 5.612v-6.002zm5.81-3.694l2.67-1.674v3.372l-2.67-1.698z" />
            </svg>
          </a>
        </nav>
      </div>
    </footer>
  );
}
