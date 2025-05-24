// 艺术主义类型定义
export interface IArtist {
  id: string;
  name: string;
  birthYear?: number;
  deathYear?: number;
  nationality?: string;
  biography?: string;
}

export interface IArtworkImage {
  url: string;
  title?: string;
  caption?: string;
  photographer?: string;
  date_taken?: string;
  resolution?: string;
  color_space?: string;
  copyright?: string;
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
  fullImages?: IArtworkImage[];
}

export interface IArtStyle {
  id: string;
  title: string;
  year: number;
  description: string;
  characteristics: string[];
  artists: string[];
  images?: (string | IArtworkImage)[];
  period?: {
    start: number;
    end: number;
  };
  artworks?: IArtwork[];
  keyArtists?: IArtist[];
  styleMovement?: string;
  influences?: string[];
  influencedBy?: string[];
  tags?: string[];
} 