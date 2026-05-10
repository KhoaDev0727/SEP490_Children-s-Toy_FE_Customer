export interface Child {
  childId: number;
  fullName: string;
  nickName: string | null;
  dob: string; // ISO format from API
  sexId: number | null;
  sexName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateChildPayload {
  fullName: string;
  nickName?: string | null;
  dob: string; // ISO format
  sexId?: number | null;
}

export interface UpdateChildPayload {
  fullName?: string | null;
  nickName?: string | null;
  dob?: string | null; // ISO format
  sexId?: number | null;
}
