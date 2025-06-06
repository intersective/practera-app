export interface ApiResponse<T> {
  success: boolean;
  status: string;
  cache: boolean;
  data: T;
}
