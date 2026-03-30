export interface IUserForm {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone: string;
  dob: Date;
  role_id: string;
}

export interface IUserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  dob: Date;
  role : {
    role: {
      id: number,
      name: string,
      description: string;
    }
  }
  createdAt: Date;
  updatedAt: Date;
}