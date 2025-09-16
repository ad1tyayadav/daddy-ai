export interface ParsedResume {
  name: string | null;
  contact: {
    email: string | null;
    phone: string | null;
  };
  summary: string | null;
  skills: string[];
  experience: {
    title: string;
    company: string | null;
    dates: string | null;
    bullets: string[];
  }[];
  education: string[];
  techKeywords: string[];
}
