/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      colors: {
        canvas: '#0A0710', accent: '#A100FF', accentsoft: 'var(--accent-soft)',
        indigo: '#7500C0', cyan: '#3D6BFF', emerald: '#10B981', ink: 'var(--fg)', mute: 'var(--muted)'
      },
      fontFamily: {
        display: ['"Archivo"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    }
  }
};
