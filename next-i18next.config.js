module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "hi"],
    localeDetection: false,
  },
  fallbackLng: {
    default: ["en"],
  },
  debug: process.env.NODE_ENV === "development",
  reloadOnPrerender: process.env.NODE_ENV === "development",
  interpolation: {
    escapeValue: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
