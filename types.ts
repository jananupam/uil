export enum RequestStatus {
  New = 'New',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
  Closed = 'Closed',
}

export interface ITRequest {
  id: string;
  requesterId: string;
  firstName: string;
  lastName: string;
  department: string;
  email: string;
  contactNumber: string;
  problemCategories: string[];
  otherCategoryDetail: string;
  details: string;
  comments: string;
  status: RequestStatus;
  submittedAt: Date;
  imageUrl?: string;
  resolvedBy?: string;
  closedAt?: Date;
  remarks?: string;
}