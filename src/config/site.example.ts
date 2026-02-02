/**
 * Site Configuration - Example
 * 
 * This is an example showing how to customize the site for different people.
 * Copy this to site.ts and modify with your own information.
 */

// Example 1: Ask Nick
export const siteConfigNick = {
  name: "Nick",
  title: "Ask Nick | AI-Powered Chat Assistant",
  description: "Chat with an AI version of Nick. Ask about experience, skills, projects, and more.",
  welcomeHeading: "Chat with an AI version of Nick",
  welcomeSubheading: "Ask me about my experience, skills, projects.",
  url: "https://asknick.vercel.app",
  linkedInUrl: "https://linkedin.com/in/nicholas-adamou",
  ogImage: "/og-image.png",
  emailSubjectPrefix: "Ask Nick",
  keywords: ["AI", "Chat", "Assistant", "Portfolio", "Nick", "Software Engineer"],
  resumes: [
    {
      title: "Software Engineer Resume",
      subtitle: "Full Stack Developer",
      description: "Comprehensive software engineering resume",
      filename: "nick-adamou-resume.pdf",
    },
    {
      title: "Tech Lead Resume",
      subtitle: "Leadership & Architecture",
      description: "Resume focused on technical leadership",
      filename: "nick-adamou-tech-lead.pdf",
    },
  ],
} as const;

// Example 2: Ask Matt
export const siteConfigMatt = {
  name: "Matt",
  title: "Ask Matt | AI Career Coach",
  description: "Chat with Matt's AI assistant. Get career advice, insights, and guidance.",
  welcomeHeading: "Chat with Matt's AI",
  welcomeSubheading: "Ask me about career development, leadership, and growth.",
  url: "https://askmatt.com",
  linkedInUrl: "https://linkedin.com/in/matt-example",
  ogImage: "/og-image.png",
  emailSubjectPrefix: "Ask Matt",
  keywords: ["AI", "Chat", "Career Coach", "Leadership", "Matt"],
  resumes: [
    {
      title: "Career Coach Bio",
      subtitle: "Professional Background",
      description: "Career coaching experience and credentials",
      filename: "matt-career-coach.pdf",
    },
  ],
} as const;

// Example 3: Ask Lindsey
export const siteConfigLindsey = {
  name: "Lindsey",
  title: "Ask Lindsey | Product Designer",
  description: "Chat with Lindsey's AI. Learn about product design, UX, and creative work.",
  welcomeHeading: "Chat with Lindsey",
  welcomeSubheading: "Ask me about product design, UX research, and my creative process.",
  url: "https://asklindsey.design",
  linkedInUrl: "https://linkedin.com/in/lindsey-designer",
  ogImage: "/og-image.png",
  emailSubjectPrefix: "Ask Lindsey",
  keywords: ["AI", "Chat", "Product Design", "UX", "Lindsey"],
  resumes: [
    {
      title: "Design Portfolio",
      subtitle: "UX/UI Projects",
      description: "Portfolio of product design work",
      filename: "lindsey-portfolio.pdf",
    },
    {
      title: "Resume",
      subtitle: "Product Designer",
      description: "Traditional resume format",
      filename: "lindsey-resume.pdf",
    },
  ],
} as const;
