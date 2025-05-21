// 艺术主义类型定义
export interface IArtStyle {
  id: string;
  title: string;
  year: number;
  description: string;
  imageUrl?: string;
  images?: string[];
  artists: string[];
  styleMovement: string;
  influences: string[];
  influencedBy: string[];
  tags?: string[];
}

// 艺术品类型定义
export interface IArtwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  style: string;
  description: string;
} 