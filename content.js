/* =====================================================================
   JOE LAREDO – INHALTE
   Hier alles eintragen, was sich ändert. Kein HTML-Wissen nötig.
   youtubeId = der Teil nach "watch?v=" im YouTube-Link
   poster    = Pfad zu einem Standbild, z. B. "assets/film1.jpg" (optional)
   preview   = kurzer stummer Clip (3–5 s, mp4) für Hover, z. B. "assets/previews/film1.mp4" (optional)
   ===================================================================== */
window.SITE = {
  email: "joe.laredo@outlook.com",
  socials: [
    { label: "Instagram", url: "https://www.instagram.com/joelaredo_/" },
    { label: "YouTube",   url: "https://www.youtube.com/@Joelaredo_m" },
    { label: "TikTok",    url: "https://www.tiktok.com/@joelaredo_" }
  ],

  films: [
    {
      featured: true,
      title: "Smoke Break",
      year: "",                              // TODO: Jahr
      runtime: "",                           // TODO: Länge, z. B. "9 min"
      role: "Short Film",                    // TODO: z. B. "Written & Directed"
      logline: "",                           // TODO: ein Satz zum Film
      youtubeId: "CdCyzSpCz6s",
      poster: "assets/smoke-break.jpg",
      preview: "assets/previews/smoke-break.mp4"
    },
    {
      title: "Viral Unforgettable Trend",
      year: "",                              // TODO: Jahr
      runtime: "",
      role: "Music Video — PSGOTRICH",       // TODO: deine Rolle, z. B. "Directed & Shot"
      logline: "",
      youtubeId: "uBKS6CMSPg0",
      poster: "assets/psgotrich.jpg",
      preview: ""                            // TODO: 3–5 s Clip nach assets/previews/
    }
    // weitere Filme: Block oben kopieren, mit Komma trennen
  ]
};
