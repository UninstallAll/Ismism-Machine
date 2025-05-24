// 艺术主义类型定义
export interface IArtist {
  id: string;
  name: string;
  birthYear?: number;
  deathYear?: number;
  nationality?: string;
  biography?: string;
}

export interface IArtwork {
  id: string;
  title: string;
  year: number;
  artist: string;
  imageUrl: string;
  description?: string;
  medium?: string;
  location?: string;
}

export interface IArtStyle {
  id: string;
  title: string;
  year: number;
  description: string;
  characteristics: string[];
  artists: string[];
  images?: string[];
  period?: {
    start: number;
    end: number;
  };
  artworks?: IArtwork[];
  keyArtists?: IArtist[];
} 