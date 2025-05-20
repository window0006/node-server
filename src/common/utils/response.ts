export class ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code: number;

  private constructor(success: boolean, code: number, data?: T, error?: string) {
    this.success = success;
    this.code = code;
    if (success && data !== undefined) {
      this.data = data;
    }
    if (!success && error) {
      this.error = error;
    }
  }

  static success<T>(data?: T, code: number = 200): ApiResponse<T> {
    return new ApiResponse<T>(true, code, data);
  }

  static error<T>(error: string, code: number = 500): ApiResponse<T> {
    return new ApiResponse<T>(false, code, undefined, error);
  }
} 