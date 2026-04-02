# ElyraOS - Virtual Environment Operating System

A modern, web-based operating system interface built with Next.js, featuring an integrated file explorer for showcasing creative work including vertical stories, cinematic cuts, and various media links.

## Features

- **Desktop Interface**: Windows-style OS with taskbar, windows, and desktop icons
- **File Explorer**: Browse through different folders and view media galleries
- **Internal Browser**: Open links in integrated browser windows with fallback for blocked content
- **Responsive Design**: Built with Tailwind CSS for a sleek, futuristic look

## Showcase Your Work

This app is designed to showcase your portfolio/work through the file explorer. Add your links (Instagram reels, YouTube videos, Google Drive files, etc.) to the data files:

- `src/data/verticalLinks.js` - For vertical aspect ratio content (reels, stories)
- `src/data/horizontalLinks.js` - For horizontal aspect ratio content (videos, cuts)

Each link entry supports:
- `url`: The full URL to your work
- `thumbnail`: Path to a preview image (place in `public/Images/thumbnails/`)
- `title`: Display title for the item

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production
1. Build the app:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Deploy automatically

### Other Platforms
- Netlify
- Railway
- Heroku

## Adding Content

### Manual Addition
Use the in-app form in the File Explorer to add links manually.

### Code Addition
Edit the data files directly:

```javascript
// src/data/verticalLinks.js
export const verticalLinks = [
  {
    url: 'https://www.instagram.com/reel/...',
    thumbnail: '/Images/thumbnails/my-work.jpg',
    title: 'My Amazing Reel',
  },
  // Add more...
];
```

## Browser Compatibility

For best experience:
- Instagram/Facebook links open in new tabs (due to platform iframe restrictions)
- YouTube videos embed directly
- Google Drive links open in new tabs

## Technologies Used

- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Context** - State management

## License

This project is private and for personal use.
