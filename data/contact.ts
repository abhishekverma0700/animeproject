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
  phone: string;
  whatsappUrl: string;
  scheduleCallUrl: string;
  availability: string;
  location: string;
  heroLocation: string;
  coordinates: string;
  timezone: string;
  credlyUrl: string;
  credlyUsername: string;
  githubUrl: string;
  linkedinUrl: string;
  emailParts: readonly [string, string];
  phoneParts: readonly [string, string];
  whatsappParts: readonly [string, string];
  socials: SocialLink[];
}

// Split strings for basic scraper protection
export const EMAIL_PARTS = ["abhishekverma3781", "gmail.com"] as const;
export const PHONE_PARTS = ["+91", "9452601372"] as const;
export const WHATSAPP_PARTS = ["91", "9452601372"] as const;

export function getDecryptedEmail(): string {
  return `${EMAIL_PARTS[0]}@${EMAIL_PARTS[1]}`;
}

export function getDecryptedPhone(): string {
  return `${PHONE_PARTS[0]}${PHONE_PARTS[1]}`;
}

export function getMailtoLink(): string {
  return `mailto:${EMAIL_PARTS[0]}@${EMAIL_PARTS[1]}`;
}

export function getTelLink(): string {
  return `tel:${PHONE_PARTS[0]}${PHONE_PARTS[1]}`;
}

export function getWhatsAppLink(): string {
  return `https://wa.me/${WHATSAPP_PARTS[0]}${WHATSAPP_PARTS[1]}`;
}

export const CONTACT_DATA: ContactData = {
  get email() {
    return getDecryptedEmail();
  },
  get phone() {
    return getDecryptedPhone();
  },
  get whatsappUrl() {
    return getWhatsAppLink();
  },
  scheduleCallUrl: "https://cal.com/abhishek/intro-call",
  availability: "AVAILABLE FOR FREELANCE & FULL-TIME",
  location: "Noida, India",
  heroLocation: "BASED IN NOIDA, INDIA",
  coordinates: "N 28.5° / E 77.4°",
  timezone: "Asia/Kolkata",
  credlyUrl: "https://www.credly.com/users/abhishek-verma.fcc70cae",
  credlyUsername: "abhishek-verma.fcc70cae",
  githubUrl: "https://github.com/abhishekverma0700",
  linkedinUrl: "https://www.linkedin.com/in/abhishek-verma-sde/",
  emailParts: EMAIL_PARTS,
  phoneParts: PHONE_PARTS,
  whatsappParts: WHATSAPP_PARTS,
  socials: [
    {
      id: "linkedin",
      name: "LINKEDIN",
      url: "https://www.linkedin.com/in/abhishek-verma-sde/",
      handle: "in/abhishek-verma-sde",
      note: "01 // PROFESSIONAL NETWORK",
    },
    {
      id: "github",
      name: "GITHUB",
      url: "https://github.com/abhishekverma0700",
      handle: "@abhishekverma0700",
      note: "02 // OPEN SOURCE & REPOSITORIES",
    },
    {
      id: "credly",
      name: "CREDLY",
      url: "https://www.credly.com/users/abhishek-verma.fcc70cae",
      handle: "abhishek-verma.fcc70cae",
      note: "03 // VERIFIED CREDENTIALS",
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
