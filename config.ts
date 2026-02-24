export const ASSETS = {
  HERO_BG: "/assets/Lisbon-hero-banner.jpg",
  GROUP_PHOTO_BG: "/assest/Tugagil-608.jpg",
  LISBON_BG: "/assets/Lisboa.jpg",
  
  SPONSOR_LOGO: "/assets/Logo-Horizontal-Full-Color-Scrum-Alliance.png",
  TUGAGIL_LOGO: "/assets/Group-23.png",
  SCRUM_ALLIANCE_LOGO: "/assets/Logo-Horizontal-Full-Color-Scrum-Alliance.png",
  
  RSG_LOGO_2026: "/assets/LISBON-Navigation-bar-logo-Reversed.png", 

  ATELIE_LOGO: "/assets/Logo-Atelie-Software-Transparente.png", 

  RECAP_VIDEO: "https://youtu.be/DK0RsE584S4",
  RECAP_VIDEO_POSTER: "https://img.youtube.com/vi/DK0RsE584S4/maxresdefault.jpg",
  
  GALLERY_IMAGES: [
    "https://i.postimg.cc/CxX1nH6r/Tugagil-18.jpg",
    "https://i.postimg.cc/Y2RCzwsz/Tugagil-32.jpg",
    "https://i.postimg.cc/TPj62V8J/Tugagil-186.jpg",
    "https://i.postimg.cc/pT03yksV/Tugagil-282.jpg",
    "https://i.postimg.cc/7LxCg888/Tugagil-447.jpg",
    "https://i.postimg.cc/qMqH61ZK/Tugagil-51.jpg",
    "https://i.postimg.cc/qq7Sn7QN/Tugagil-58.jpg",
    "https://i.postimg.cc/qvcwJTXW/Tugagil-610.jpg",
    "https://i.postimg.cc/br20Kcwk/Tugagil-618.jpg",
  ], // <--- A vírgula aqui é essencial!
  
  SERVICES: {
    SUPABASE_URL: (import.meta.env?.VITE_SUPABASE_URL as string) || "",
    SUPABASE_ANON_KEY: (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) || "",
    RESEND_API_KEY: (import.meta.env?.VITE_RESEND_API_KEY as string) || "",
    FROM_EMAIL: (import.meta.env?.VITE_FROM_EMAIL as string) || "",
  },
};
