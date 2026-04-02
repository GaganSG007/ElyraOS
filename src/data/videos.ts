export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  link?: string;
  orientation: 'vertical' | 'horizontal';
}

export const videos = {
  vertical: [
    {
      id: 'v1',
      title: 'Vertical Story 1',
      description: 'A compelling vertical video story',
      thumbnail: 'https://images.unsplash.com/photo-1577720643272-265f434884f5?w=400&h=600&fit=crop',
      url: 'https://www.instagram.com/reel/DVoHSp1j1jx/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
      link: '#',
      orientation: 'vertical',
    },
    {
      id: 'v2',
      title: 'Vertical Story 2',
      description: 'Another stunning vertical production',
      thumbnail: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
      link: '#',
      orientation: 'vertical',
    },
  ] as Video[],
  horizontal: [
    {
      id: 'h1',
      title: 'Cinematic Cut 1',
      description: 'Professional cinematic footage',
      thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4',
      link: '#',
      orientation: 'horizontal',
    },
    {
      id: 'h2',
      title: 'Cinematic Cut 2',
      description: 'Stunning cinematic production',
      thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600&h=400&fit=crop',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4',
      link: '#',
      orientation: 'horizontal',
    },
  ] as Video[],
};
