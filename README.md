# Ask Nick - AI-Powered Chat Assistant 🤖

![Next.js](https://img.shields.io/badge/-Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/-Framer%20Motion-0081C9?style=flat-square&logo=framer&logoColor=white)
![OpenAI](https://img.shields.io/badge/-OpenAI-412991?style=flat-square&logo=openai&logoColor=white)
![React Markdown](https://img.shields.io/badge/-React%20Markdown-61DAFB?style=flat-square&logo=react&logoColor=black)

![image](public/og-image.png)

A personalized AI-powered chat assistant based on [askmyai](https://github.com/nicholasadamou/askmyai). Chat with an AI version of Nick to learn about his experience, skills, and projects.

## 📚 Documentation

For complete documentation including setup, customization, deployment, and architecture details, please see the main repository:

**[https://github.com/nicholasadamou/askmyai](https://github.com/nicholasadamou/askmyai)**

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ASSISTANT_ID=your_assistant_id_here

# Resend Configuration (for bug reports)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=bugs@yourdomain.com
NOTIFICATION_EMAIL=your-email@example.com

# For development, you can use:
# RESEND_FROM_EMAIL=onboarding@resend.dev

# Calendly Configuration (optional - update directly in component)
NEXT_PUBLIC_CALENDLY_USERNAME=your-calendly-username
```

### 3. Run the development server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenAI](https://openai.com/)
- UI components inspired by modern chat interfaces
