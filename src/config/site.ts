/**
 * Site Configuration
 *
 * Customize this file to personalize your Ask My AI assistant.
 * Update these values to reflect your own information.
 */

export const siteConfig = {
  // Personal Information
  name: "Nick", // Change to your name (e.g., "Nick", "Matt", "Lindsey")

  // Site Metadata
  title: "Ask Nick | AI-Powered Chat Assistant",
  description: "Chat with an AI version of Nick. Ask about experience, skills, projects, and more.",

  // Welcome Message (shown when chat is empty)
  welcomeHeading: "Chat with an AI version of Nick",
  welcomeSubheading: "Ask me about my experience, skills, projects.",

  // URLs and Links
  url: "https://asknick.ai",
  linkedInUrl: "https://linkedin.com/in/nicholas-adamou", // Update with your LinkedIn profile

  // OpenGraph / Social Media
  ogImage: "/og-image.png",

  // Email Configuration (for bug reports and suggestions)
  emailSubjectPrefix: "Ask Nick", // Used in email subjects

  // Keywords for SEO
  keywords: ["AI", "Chat", "Assistant", "Portfolio", "Software Engineer"],

  // Resume Files
  // Add your resume files to public/resumes/ and list them here
  // If empty, the "Download Resume" menu option will still appear but show no files
  resumes: [
    {
      title: "Standard Resume",
      subtitle: "Senior Software Engineer",
      description: "Senior Software Engineer Resume",
      filename: "nicholas-adamou-resume.pdf", // File in public/resumes/
    },
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
