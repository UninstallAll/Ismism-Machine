// 艺术品类型定义
export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  style: string;
  description: string;
}

// 时间线项目类型定义
export interface TimelineItem {
  id: string;
  title: string;
  year: number;
  description: string;
  imageUrl: string;
  artists: string[];
  styleMovement: string;
  influences: string[];
  influencedBy: string[];
}

// 类别类型定义
export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

// 统计数据类型
export interface ArtistStat {
  name: string;
  count: number;
  period: string;
}

export interface StyleStat {
  name: string;
  count: number;
  period: string;
}

export interface DecadeData {
  decade: string;
  count: number;
  dominantStyles: string[];
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
} 