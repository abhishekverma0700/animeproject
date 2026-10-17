export interface SocialLink {
  id: string;
  name: string;
  url: string;
  handle: string;
  note: string;
  isDownload?: boolean;
}

export interface ContactData {
  email: string;
  scheduleCallUrl: string;
  availability: string;
  location: string;
  coordinates: string;
  timezone: string;
  socials: SocialLink[];
}

export const CONTACT_DATA: ContactData = {
  email: "contact@abhishek.dev",
  scheduleCallUrl: "https://cal.com/abhishek/intro-call",
  availability: "AVAILABLE FOR FREELANCE & FULL-TIME",
  location: "NEW DELHI, INDIA",
  coordinates: "28.6139° N, 77.2090° E",
  timezone: "Asia/Kolkata",
  socials: [
    {
      id: "github",
      name: "GITHUB",
      url: "https://github.com",
      handle: "@abhishek",
      note: "01 // OPEN SOURCE & REPOSITORIES",
    },
    {
      id: "linkedin",
      name: "LINKEDIN",
      url: "https://linkedin.com",
      handle: "in/abhishek",
      note: "02 // PROFESSIONAL NETWORK",
    },
    {
      id: "x",
      name: "X",
      url: "https://x.com",
      handle: "@abhishek",
      note: "03 // THOUGHTS & DISPATCHES",
    },
    {
      id: "resume",
      name: "RESUME",
      url: "/resume.pdf",
      handle: "PDF // 2026",
      note: "04 // CURRICULUM VITAE",
      isDownload: true,
    },
  ],
};
