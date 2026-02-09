export interface IUserForm {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone: string;
  dob: Date;
}

export interface IUserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  dob: Date;
  createdAt: Date;
  updatedAt: Date;
}