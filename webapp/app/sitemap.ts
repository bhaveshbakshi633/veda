import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://webapp-self-rho.vercel.app";

const HERBS = [
  "ashwagandha", "tulsi", "turmeric", "brahmi", "triphala",
  "amla", "shatavari", "guduchi", "arjuna", "mulethi",
  "neem", "moringa", "ginger", "cinnamon", "fenugreek",
  "aloe-vera", "shilajit", "guggulu", "gokshura", "punarnava",
  "kutki", "bhringaraj", "shankhapushpi", "vidanga", "vacha",
  "pippali", "black-pepper", "cardamom", "clove", "kalmegh",
  "manjistha", "chitrak", "bala", "jatamansi", "tagar",
  "musta", "haritaki", "bibhitaki", "sariva", "chirata",
  "ajwain", "cumin", "kalonji", "isabgol", "senna",
  "safed-musli", "kapikacchu", "rasna", "lodhra", "nagkesar",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/herbs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/check`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/chat`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tracker`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/kits`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/easy`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/saved`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  const herbPages: MetadataRoute.Sitemap = HERBS.map((herb) => ({
    url: `${BASE_URL}/herbs/${herb}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...herbPages];
}
