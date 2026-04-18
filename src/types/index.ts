// These interfaces mirror the JSON responses from the Flask API exactly.
// TypeScript uses them to catch mistakes at compile time — if you try to access
// a field that doesn't exist, the editor will warn you before you even run the code.

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface Resource {
  id: number;
  name: string;
  description: string | null; // null means the API may return null for this field
  capacity: number;
  is_active: boolean;
}

export interface Booking {
  id: number;
  user_id: number;
  resource_id: number;
  resource_name: string | null; // null means the API may return null for this field
  start_time: string; // ISO string e.g. "2026-04-01T09:00:00"
  end_time: string;
  notes: string | null;
  guests: number;
  status: "confirmed" | "cancelled" | "pending"; // union type — only these three values allowed
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface AvailabilityResponse {
  resource_id: number;
  available: boolean;
  start_time: string;
  end_time: string;
}

export interface ApiError {
  error: string;
}

// Generic paginated response envelope — matches the backend pagination utility
// T is the type of each item e.g. PaginatedResponse<Booking>
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}