/**
 * Site Configuration
 *
 * Customize this file to personalize your Ask My AI assistant.
 * Update these values to reflect your own information.
 */

export const siteConfig = {
  // Personal Information
  name: "My AI", // Change to your name (e.g., "Nick", "Matt", "Lindsey")

  // Site Metadata
  title: "Ask My AI | AI-Powered Chat Assistant",
  description: "Chat with an AI assistant. Ask about experience, skills, projects, and more.",

  // Welcome Message (shown when chat is empty)
  welcomeHeading: "Chat with an AI assistant",
  welcomeSubheading: "Ask me about my experience, skills, projects.",

  // URLs and Links
  url: "https://askmyai.vercel.app",
  linkedInUrl: "https://linkedin.com/in/your-profile", // Update with your LinkedIn profile

  // OpenGraph / Social Media
  ogImage: "/og-image.png",

  // Email Configuration (for bug reports and suggestions)
  emailSubjectPrefix: "Ask My AI", // Used in email subjects

  // Keywords for SEO
  keywords: ["AI", "Chat", "Assistant", "Portfolio", "Software Engineer"],
  
  // Resume Files
  // Add your resume files to public/resumes/ and list them here
  // If empty, the "Download Resume" menu option will still appear but show no files
  resumes: [
    {
      title: "Standard Resume",
      subtitle: "Software Engineer",
      description: "Full stack software engineer resume",
      filename: "resume.pdf", // File in public/resumes/
    },
    // Add more resume variants:
    // {
    //   title: "Extended Resume",
    //   subtitle: "Detailed Experience",
    //   description: "Comprehensive resume with all projects",
    //   filename: "resume-extended.pdf",
    // },
  ],
} as const;

/**
 * Easy access helpers
 */
export const getFullTitle = () => siteConfig.title;
export const getWelcomeMessage = () => ({
  heading: siteConfig.welcomeHeading,
  subheading: siteConfig.welcomeSubheading,
});
