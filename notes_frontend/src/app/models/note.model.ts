export interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  pinned?: boolean;
}
