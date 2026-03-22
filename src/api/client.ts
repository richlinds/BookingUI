// Read the API base URL from environment variables
// process.env.REACT_APP_* is how Create React App exposes .env values to the browser
// The ?? operator means "use the right side if the left side is null or undefined"
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

class ApiClient {
  // The JWT token is stored here after login and attached to every request
  // Private means it can only be accessed inside this class
  private token: string | null = null;

  // Called after login/register to store the token for subsequent requests
  setToken(token: string | null): void {
    this.token = token;
  }

  // Generic private method that all API calls go through
  // <T> is a TypeScript generic — the caller tells us what type to expect back
  // e.g. request<User[]>(...) means "I expect this to return an array of Users"
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Attach the JWT token if we have one
    // The API requires this header on all protected routes
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

    // Parse the response body as JSON regardless of success or failure
    // The API always returns JSON, even for errors
    const data = await res.json();

    // res.ok is true for 2xx status codes, false for 4xx/5xx
    if (!res.ok) {
      // Cast data to the error shape and throw so callers can catch it
      throw new Error((data as { error: string }).error ?? "Request failed");
    }

    // Cast the response to the expected type T and return it
    return data as T;
  }

  // --- Auth ---

  login(email: string, password: string) {
    return this.request<{ access_token: string; user: import("./types").User }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
  }

  register(name: string, email: string, password: string) {
    return this.request<{ access_token: string; user: import("./types").User }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify({ name, email, password }) }
    );
  }

  // --- Resources ---

  getResources() {
    return this.request<import("./types").Resource[]>("/resources");
  }

  createResource(data: { name: string; description?: string; capacity?: number }) {
    return this.request<import("./types").Resource>("/resources", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Partial<Resource> means any subset of Resource fields — used for PATCH requests
  // where you only send the fields you want to update
  updateResource(id: number, data: Partial<import("./types").Resource>) {
    return this.request<import("./types").Resource>(`/resources/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // --- Bookings ---

  getBookings() {
    return this.request<import("./types").Booking[]>("/bookings");
  }

  createBooking(data: {
    resource_id: number;
    start_time: string;
    end_time: string;
    notes?: string;
    guests?: number;
  }) {
    return this.request<import("./types").Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  cancelBooking(id: number) {
    return this.request<import("./types").Booking>(`/bookings/${id}`, {
      method: "DELETE",
    });
  }

  checkAvailability(resourceId: number, startTime: string, endTime: string) {
    return this.request<import("./types").AvailabilityResponse>(
      `/bookings/availability/${resourceId}?start_time=${startTime}&end_time=${endTime}`
    );
  }
}

// Export a single shared instance — every file that imports api gets the same object
// This is important because the token is stored on the instance
// If each file created its own instance, setting the token in one wouldn't affect others
export const api = new ApiClient();
