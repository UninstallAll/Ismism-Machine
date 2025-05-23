interface ArtMovement {
  _id: string;
  name: string;
  startYear: number;
  endYear: number;
  description: string;
  keyArtists: string[];
  characteristics: string[];
  tags: string[];
  imageUrl?: string;
  images?: string[];
  position?: { x: number; y: number };
  influences?: string[];
  influencedBy?: string[];
}

export interface ArtMovementApi {
  getAllMovements: () => Promise<ArtMovement[]>;
  getMovementById: (id: string) => Promise<ArtMovement>;
  getMovementsByTimeline: () => Promise<ArtMovement[]>;
  getMovementsByTags: (tags: string[]) => Promise<ArtMovement[]>;
  updateMovement: (id: string, data: Partial<ArtMovement>) => Promise<ArtMovement>;
  createMovement: (data: Partial<ArtMovement>) => Promise<ArtMovement>;
  deleteMovement: (id: string) => Promise<void>;
}

export const artMovementApi: ArtMovementApi; 