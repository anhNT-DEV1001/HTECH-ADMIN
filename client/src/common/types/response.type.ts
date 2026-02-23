export type BaseResponse<T> = {
  status: "success" | "error";
  message: string;
  data: T | null;
};

export type ErrorResponse = {
  statusCode: number;
  message: string;
  field: Record<string, string> | null;
};
