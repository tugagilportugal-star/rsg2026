export const ASSETS = {
  HERO_BG: "https://i.postimg.cc/xCHQMjQ4/Tugagil-608.jpg",
  LISBON_BG: "https://i.postimg.cc/wjFytpcV/Lisboa.jpg",
  
  SPONSOR_LOGO: "https://i.postimg.cc/W4kCf9HB/Logo-Horizontal-Full-Color-Scrum-Alliance.png",
  
  // ATUALIZADO: Novo Logo TugÁgil
  TUGAGIL_LOGO: "https://i.postimg.cc/VvvVTxmP/Group-23.png",
  
  SCRUM_ALLIANCE_LOGO: "https://i.postimg.cc/W4kCf9HB/Logo-Horizontal-Full-Color-Scrum-Alliance.png",
  
  // Mantenha o link do seu logo branco do RSG aqui
  RSG_LOGO_2026: "https://i.postimg.cc/wMpSz32V/2026-RSG-Logo-Lisbon-Reversed.png", 

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
  ],
  
  SERVICES: {
    SUPABASE_URL: (import.meta.env?.VITE_SUPABASE_URL as string) || "",
    SUPABASE_ANON_KEY: (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) || "",
    RESEND_API_KEY: (import.meta.env?.VITE_RESEND_API_KEY as string) || "",
    FROM_EMAIL: (import.meta.env?.VITE_FROM_EMAIL as string) || "",
  },
};
