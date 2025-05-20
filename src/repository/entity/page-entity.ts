export interface PageEntity {
  id: string;
  title: string;
  content: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  metadata?: Record<string, any>;
} 