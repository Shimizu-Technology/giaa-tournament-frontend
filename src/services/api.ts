// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Types for API responses
export interface Golfer {
  id: number;
  name: string;
  company: string | null;
  address: string | null;
  phone: string;
  mobile: string | null;
  email: string;
  payment_type: 'stripe' | 'pay_on_day';
  payment_status: 'paid' | 'unpaid';
  waiver_accepted_at: string | null;
  waiver_signed: boolean;
  checked_in_at: string | null;
  registration_status: 'confirmed' | 'waitlist';
  group_id: number | null;
  hole_number: number | null;
  position: number | null;
  notes: string | null;
  payment_method: string | null;
  receipt_number: string | null;
  payment_notes: string | null;
  created_at: string;
  updated_at: string;
  group_position_label: string | null;
  checked_in: boolean;
  group?: Group | null;
}

export interface Group {
  id: number;
  group_number: number;
  hole_number: number | null;
  created_at: string;
  updated_at: string;
  golfer_count: number;
  is_full: boolean;
  golfers?: Golfer[];
}

export interface Admin {
  id: number;
  clerk_id: string | null;
  name: string | null;
  email: string;
  role: 'super_admin' | 'admin' | null;
  is_super_admin: boolean;
}

export interface Settings {
  id: number;
  max_capacity: number;
  stripe_public_key: string | null;
  stripe_secret_key: string | null;
  stripe_webhook_secret: string | null;
  tournament_entry_fee: number | null;
  entry_fee_dollars: number;
  admin_email: string | null;
  payment_mode: 'test' | 'production';
  capacity_remaining: number;
  at_capacity: boolean;
  stripe_configured: boolean;
  test_mode: boolean;
}

export interface CheckoutSession {
  checkout_url: string;
  session_id: string;
  golfer_id: number;
  test_mode?: boolean;
}

export interface PaymentConfirmation {
  success: boolean;
  golfer: Golfer;
  message: string;
}

export interface RegistrationStatus {
  max_capacity: number;
  confirmed_count: number;
  waitlist_count: number;
  capacity_remaining: number;
  at_capacity: boolean;
  entry_fee_cents: number;
  entry_fee_dollars: number;
}

export interface GolferStats {
  total: number;
  confirmed: number;
  waitlist: number;
  paid: number;
  unpaid: number;
  checked_in: number;
  not_checked_in: number;
  assigned_to_groups: number;
  unassigned: number;
  max_capacity: number;
  capacity_remaining: number;
  at_capacity: boolean;
  entry_fee_cents: number;
  entry_fee_dollars: number;
}

export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

// API client class
class ApiClient {
  private getAuthToken: (() => Promise<string | null>) | null = null;

  // Set the auth token getter (called from React component)
  setAuthTokenGetter(getter: () => Promise<string | null>) {
    this.getAuthToken = getter;
  }

  private async getHeaders(authenticated = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authenticated && this.getAuthToken) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    authenticated = true
  ): Promise<T> {
    const headers = await this.getHeaders(authenticated);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Public endpoints (no auth required)
  async getRegistrationStatus(): Promise<RegistrationStatus> {
    return this.request('/api/v1/golfers/registration_status', {}, false);
  }

  async registerGolfer(data: {
    golfer: {
      name: string;
      company?: string;
      address?: string;
      phone: string;
      mobile?: string;
      email: string;
      payment_type: 'stripe' | 'pay_on_day';
      payment_status?: 'paid' | 'unpaid';
      notes?: string;
    };
    waiver_accepted: boolean;
  }): Promise<{ golfer: Golfer; message: string }> {
    return this.request('/api/v1/golfers', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Protected endpoints (auth required)
  async getGolfers(params?: {
    payment_status?: string;
    payment_type?: string;
    registration_status?: string;
    checked_in?: string;
    assigned?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ golfers: Golfer[]; meta: PaginationMeta }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return this.request(`/api/v1/golfers${query ? `?${query}` : ''}`);
  }

  async getGolfer(id: number): Promise<Golfer> {
    return this.request(`/api/v1/golfers/${id}`);
  }

  async updateGolfer(id: number, data: Partial<Golfer>): Promise<Golfer> {
    return this.request(`/api/v1/golfers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ golfer: data }),
    });
  }

  async deleteGolfer(id: number): Promise<void> {
    return this.request(`/api/v1/golfers/${id}`, {
      method: 'DELETE',
    });
  }

  async checkInGolfer(id: number): Promise<Golfer> {
    return this.request(`/api/v1/golfers/${id}/check_in`, {
      method: 'POST',
    });
  }

  async addPaymentDetails(id: number, data: {
    payment_method: string;
    receipt_number?: string;
    payment_notes?: string;
  }): Promise<Golfer> {
    return this.request(`/api/v1/golfers/${id}/payment_details`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async promoteGolfer(id: number): Promise<Golfer> {
    return this.request(`/api/v1/golfers/${id}/promote`, {
      method: 'POST',
    });
  }

  async getGolferStats(): Promise<GolferStats> {
    return this.request('/api/v1/golfers/stats');
  }

  // Groups
  async getGroups(): Promise<Group[]> {
    return this.request('/api/v1/groups');
  }

  async getGroup(id: number): Promise<Group> {
    return this.request(`/api/v1/groups/${id}`);
  }

  async createGroup(holeNumber?: number): Promise<Group> {
    return this.request('/api/v1/groups', {
      method: 'POST',
      body: JSON.stringify({ hole_number: holeNumber }),
    });
  }

  async updateGroup(id: number, data: Partial<Group>): Promise<Group> {
    return this.request(`/api/v1/groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ group: data }),
    });
  }

  async deleteGroup(id: number): Promise<void> {
    return this.request(`/api/v1/groups/${id}`, {
      method: 'DELETE',
    });
  }

  async setGroupHole(id: number, holeNumber: number): Promise<Group> {
    return this.request(`/api/v1/groups/${id}/set_hole`, {
      method: 'POST',
      body: JSON.stringify({ hole_number: holeNumber }),
    });
  }

  async addGolferToGroup(groupId: number, golferId: number): Promise<Group> {
    return this.request(`/api/v1/groups/${groupId}/add_golfer`, {
      method: 'POST',
      body: JSON.stringify({ golfer_id: golferId }),
    });
  }

  async removeGolferFromGroup(groupId: number, golferId: number): Promise<Group> {
    return this.request(`/api/v1/groups/${groupId}/remove_golfer`, {
      method: 'POST',
      body: JSON.stringify({ golfer_id: golferId }),
    });
  }

  async updateGroupPositions(updates: Array<{
    golfer_id: number;
    group_id: number | null;
    position: number | null;
  }>): Promise<{ message: string }> {
    return this.request('/api/v1/groups/update_positions', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  async batchCreateGroups(count: number): Promise<Group[]> {
    return this.request('/api/v1/groups/batch_create', {
      method: 'POST',
      body: JSON.stringify({ count }),
    });
  }

  async autoAssignGolfers(): Promise<{ message: string; assigned_count: number }> {
    return this.request('/api/v1/groups/auto_assign', {
      method: 'POST',
    });
  }

  // Admins
  async getCurrentAdmin(): Promise<Admin> {
    return this.request('/api/v1/admins/me');
  }

  async getAdmins(): Promise<Admin[]> {
    return this.request('/api/v1/admins');
  }

  async createAdmin(data: { email: string; name?: string }): Promise<Admin> {
    return this.request('/api/v1/admins', {
      method: 'POST',
      body: JSON.stringify({ admin: data }),
    });
  }

  async updateAdmin(id: number, data: Partial<Admin>): Promise<Admin> {
    return this.request(`/api/v1/admins/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ admin: data }),
    });
  }

  async deleteAdmin(id: number): Promise<void> {
    return this.request(`/api/v1/admins/${id}`, {
      method: 'DELETE',
    });
  }

  // Settings
  async getSettings(): Promise<Settings> {
    return this.request('/api/v1/settings');
  }

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    return this.request('/api/v1/settings', {
      method: 'PATCH',
      body: JSON.stringify({ setting: data }),
    });
  }

  // Checkout / Stripe
  async createCheckoutSession(golferId: number): Promise<CheckoutSession> {
    return this.request('/api/v1/checkout', {
      method: 'POST',
      body: JSON.stringify({ golfer_id: golferId }),
    }, false);
  }

  async confirmPayment(sessionId: string): Promise<PaymentConfirmation> {
    return this.request('/api/v1/checkout/confirm', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    }, false);
  }

  async getCheckoutSessionStatus(sessionId: string): Promise<{
    session_id: string;
    payment_status: string;
    status: string;
    golfer_id: number | null;
    golfer_name: string | null;
    amount_total: number | null;
  }> {
    return this.request(`/api/v1/checkout/session/${sessionId}`, {}, false);
  }
}

// Export singleton instance
export const api = new ApiClient();

