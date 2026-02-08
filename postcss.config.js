// Function form so PostCSS receives a proper `from` (can reduce "from option" warning from plugins)
export default (ctx) => ({
  from: ctx.file?.path ?? ctx.from,
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
});
