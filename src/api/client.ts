import type { AvailabilityResponse, Booking, PaginatedResponse, Resource, User } from "../types";

// Read the API base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

// A custom error class for 401 responses so we can handle token expiry separately
// from other errors like validation failures or server errors
export class UnauthorizedError extends Error {
  constructor() {
    super("Session expired. Please log in again.");
    this.name = "UnauthorizedError";
  }
}

class ApiClient {
  private token: string | null = null;
  private refreshToken: string | null = null;

  // Callback invoked when both tokens have expired — triggers logout in the auth context
  private onUnauthorized: (() => void) | null = null;

  setToken(token: string | null): void {
    this.token = token;
  }

  setRefreshToken(token: string | null): void {
    this.refreshToken = token;
  }

  setOnUnauthorized(callback: () => void): void {
    this.onUnauthorized = callback;
  }

  private async request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    let data: any;

    try {
      data = await res.json();
    } catch (e) {
      // Response wasn't valid JSON (e.g., HTML error page)
      console.error(`Failed to parse response from ${path}:`, res.status, await res.text());
      throw new Error(
        `Server error (${res.status}): Unable to parse response. Check backend logs.`
      );
    }

    if (!res.ok) {
      // If we get a 401 and have a refresh token, try to get a new access token
      // retry=true prevents infinite loops — we only attempt one refresh
      if (res.status === 401 && this.refreshToken && retry) {
        const refreshed = await this.attemptRefresh();
        if (refreshed) {
          // Retry the original request with the new access token
          return this.request<T>(path, options, false);
        }
      }

      // No refresh token or refresh failed — trigger logout
      if (res.status === 401 && this.onUnauthorized) {
        this.onUnauthorized();
        throw new UnauthorizedError();
      }

      // Handle different error response formats from the backend
      let errorMessage = "Request failed";

      if (typeof data === "object" && data !== null) {
        // Try common error field names
        if ("error" in data && typeof data.error === "string") {
          errorMessage = data.error;
        } else if ("message" in data && typeof data.message === "string") {
          errorMessage = data.message;
        } else if ("detail" in data) {
          // FastAPI/Pydantic validation error format
          if (Array.isArray(data.detail)) {
            errorMessage = data.detail
              .map((err: any) => {
                if (typeof err === "object" && "msg" in err && "loc" in err) {
                  return `${err.loc[err.loc.length - 1]}: ${err.msg}`;
                }
                return String(err);
              })
              .join("; ");
          } else if (typeof data.detail === "string") {
            errorMessage = data.detail;
          }
        }
      }

      // Log full response for debugging
      console.error(`API Error ${res.status} on ${path}:`, {
        status: res.status,
        path,
        fullResponse: data,
        errorMessage,
      });

      throw new Error(errorMessage);
    }

    return data as T;
  }

  // Attempt to get a new access token using the refresh token
  // Returns true if successful, false if the refresh token has also expired
  private async attemptRefresh(): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.refreshToken}`,
        },
      });

      if (!res.ok) return false;

      const data = await res.json();
      this.token = data.access_token;
      return true;
    } catch {
      return false;
    }
  }

  // --- Auth ---

  login(email: string, password: string) {
    return this.request<{ access_token: string; refresh_token: string; user: User }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
  }

  register(name: string, email: string, password: string) {
    return this.request<{ access_token: string; refresh_token: string; user: User }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify({ name, email, password }) }
    );
  }

  // --- Resources ---

  // Returns a paginated response — access items via data.items
  getResources(page = 1, perPage = 20) {
    return this.request<PaginatedResponse<Resource>>(`/resources?page=${page}&per_page=${perPage}`);
  }

  createResource(data: { name: string; description?: string; capacity?: number }) {
    return this.request<Resource>("/resources", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Partial<Resource> means any subset of Resource fields — used for PATCH requests
  updateResource(id: number, data: Partial<Resource>) {
    return this.request<Resource>(`/resources/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // --- Bookings ---

  // Returns a paginated response — access items via data.items
  getBookings(page = 1, perPage = 20) {
    return this.request<PaginatedResponse<Booking>>(`/bookings?page=${page}&per_page=${perPage}`);
  }

  // For admins to get all bookings
  getAllBookings(page = 1, perPage = 20) {
    return this.request<PaginatedResponse<Booking>>(
      `/admin/bookings?page=${page}&per_page=${perPage}`
    );
  }

  createBooking(data: {
    resource_id: number;
    start_time: string;
    end_time: string;
    notes?: string;
    guests?: number;
  }) {
    return this.request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  cancelBooking(id: number) {
    return this.request<Booking>(`/bookings/${id}`, {
      method: "DELETE",
    });
  }

  getBooking(id: number) {
    return this.request<Booking>(`/bookings/${id}`);
  }

  checkAvailability(resourceId: number, startTime: string, endTime: string) {
    return this.request<AvailabilityResponse>(
      `/bookings/availability/${resourceId}?start_time=${startTime}&end_time=${endTime}`
    );
  }
}

// Export a single shared instance — every file that imports api gets the same object
// This is important because the token state is stored on the instance
export const api = new ApiClient();
