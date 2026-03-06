/**
 * Momence API Client - Extended client for all Momence endpoints
 *
 * This client extends the existing momence-service.ts with additional
 * endpoints for members, bookings, memberships, tags, etc.
 *
 * Paths verified from: https://api.docs.momence.com/reference/host
 */

import type { Redis } from '@upstash/redis';
import { Buffer } from 'node:buffer';

const MOMENCE_API_URL = 'https://api.momence.com';
const CACHE_TTL_TOKEN = 3500; // ~1 hour
const CACHE_KEY_TOKEN = 'momence:access_token';

// ============================================================================
// TYPES
// ============================================================================

export interface MomenceMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  pictureUrl?: string;
  dateOfBirth?: string;
  createdAt?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  visits?: {
    appointments: number;
    appointmentsVisits: number;
    bookings: number;
    bookingsVisits: number;
    total: number;
    totalVisits: number;
  };
  customerTags?: Array<{
    id: number;
    name: string;
  }>;
}

export interface MomenceBooking {
  id: number;
  createdAt: string;
  checkedIn: boolean;
  cancelledAt?: string;
  recurringBookingId?: number;
  session?: {
    id: number;
    name: string;
    startsAt: string;
    endsAt: string;
  };
}

export interface MomenceMembership {
  id: number;
  name: string;
  price?: number;
  type?: string;
}

export interface MomenceBoughtMembership {
  id: number;
  type: string;
  startDate: string;
  endDate?: string;
  isFrozen: boolean;
  eventCreditsLeft?: number;
  eventCreditsTotal?: number;
  moneyCreditsLeft?: number;
  moneyCreditsTotal?: number;
  membership: {
    id: number;
    name: string;
  };
}

export interface MomenceTag {
  id: number;
  name: string;
  isCustomerBadge?: boolean;
  badgeLabel?: string;
  badgeColor?: string;
}

export interface PaginatedResponse<T> {
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
  };
  payload: T[];
}

// ============================================================================
// MOMENCE API CLIENT
// ============================================================================

export class MomenceApiClient {
  private redis: Redis | null;
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(redis: Redis | null = null) {
    this.redis = redis;
  }

  // ==========================================================================
  // AUTHENTICATION
  // ==========================================================================

  async getAccessToken(): Promise<string> {
    const { MOMENCE_CLIENT_ID, MOMENCE_CLIENT_SECRET, MOMENCE_USERNAME, MOMENCE_PASSWORD } =
      process.env;

    if (!MOMENCE_CLIENT_ID || !MOMENCE_CLIENT_SECRET || !MOMENCE_USERNAME || !MOMENCE_PASSWORD) {
      throw new Error('Missing Momence OAuth credentials');
    }

    // Check in-memory cache
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }

    // Check Redis cache
    if (this.redis) {
      try {
        const cachedToken = await this.redis.get(CACHE_KEY_TOKEN);
        if (cachedToken) {
          const token = String(cachedToken);
          this.tokenCache = { token, expiresAt: Date.now() + CACHE_TTL_TOKEN * 1000 };
          return token;
        }
      } catch (e) {
        console.warn('[momence-client] Token cache read error:', e);
      }
    }

    // Fetch new token
    const basicAuth = Buffer.from(`${MOMENCE_CLIENT_ID}:${MOMENCE_CLIENT_SECRET}`).toString(
      'base64'
    );

    const response = await fetch(`${MOMENCE_API_URL}/api/v2/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: MOMENCE_USERNAME,
        password: MOMENCE_PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error(`Momence auth failed: ${response.status}`);
    }

    const data = await response.json();
    const token = data.access_token;

    if (!token) {
      throw new Error('No access token in response');
    }

    // Cache token
    this.tokenCache = { token, expiresAt: Date.now() + CACHE_TTL_TOKEN * 1000 };
    if (this.redis) {
      try {
        await this.redis.setex(CACHE_KEY_TOKEN, CACHE_TTL_TOKEN, token);
      } catch (e) {
        console.warn('[momence-client] Token cache write error:', e);
      }
    }

    return token;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: Record<string, unknown>;
      params?: Record<string, string | number | boolean>;
    }
  ): Promise<T> {
    const token = await this.getAccessToken();

    const url = new URL(`${MOMENCE_API_URL}${path}`);
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Momence API error ${response.status}: ${errorText}`);
    }

    // Some endpoints return empty body
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  }

  // ==========================================================================
  // SESSIONS - /api/v2/host/sessions
  // ==========================================================================

  async getSessions(params: {
    page: number;
    pageSize: number;
    startAfter?: string;
    startBefore?: string;
    teacherId?: number;
    types?: string[];
    sortBy?: 'name' | 'startsAt' | 'endsAt';
    sortOrder?: 'ASC' | 'DESC';
    includeCancelled?: boolean;
  }): Promise<PaginatedResponse<Record<string, unknown>>> {
    const queryParams: Record<string, string | number | boolean> = {
      page: params.page,
      pageSize: params.pageSize,
    };
    if (params.startAfter) queryParams['startAfter'] = params.startAfter;
    if (params.startBefore) queryParams['startBefore'] = params.startBefore;
    if (params.teacherId) queryParams['teacherId'] = params.teacherId;
    if (params.sortBy) queryParams['sortBy'] = params.sortBy;
    if (params.sortOrder) queryParams['sortOrder'] = params.sortOrder;
    if (params.includeCancelled !== undefined)
      queryParams['includeCancelled'] = params.includeCancelled;

    return this.request<PaginatedResponse<Record<string, unknown>>>(
      'GET',
      '/api/v2/host/sessions',
      {
        params: queryParams,
      }
    );
  }

  async getSession(sessionId: number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('GET', `/api/v2/host/sessions/${sessionId}`);
  }

  async getSessionBookings(
    sessionId: number,
    params: {
      page: number;
      pageSize: number;
      includeCancelled?: boolean;
    }
  ): Promise<PaginatedResponse<MomenceBooking>> {
    return this.request<PaginatedResponse<MomenceBooking>>(
      'GET',
      `/api/v2/host/sessions/${sessionId}/bookings`,
      {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          ...(params.includeCancelled !== undefined && {
            includeCancelled: params.includeCancelled,
          }),
        },
      }
    );
  }

  // ==========================================================================
  // MEMBERS - /api/v2/host/members
  // ==========================================================================

  async getMembers(params: {
    page: number;
    pageSize: number;
    query?: string;
    sortBy?: 'lastSeenAt' | 'firstSeenAt' | 'firstName' | 'lastName' | 'email';
    sortOrder?: 'ASC' | 'DESC';
    filterPreset?: 'with-active-membership';
  }): Promise<PaginatedResponse<MomenceMember>> {
    const queryParams: Record<string, string | number> = {
      page: params.page,
      pageSize: params.pageSize,
    };
    if (params.query) queryParams['query'] = params.query;
    if (params.sortBy) queryParams['sortBy'] = params.sortBy;
    if (params.sortOrder) queryParams['sortOrder'] = params.sortOrder;
    if (params.filterPreset) queryParams['filterPreset'] = params.filterPreset;

    return this.request<PaginatedResponse<MomenceMember>>('GET', '/api/v2/host/members', {
      params: queryParams,
    });
  }

  async searchMembers(body: {
    page: number;
    pageSize: number;
    query?: string;
    filter?: Record<string, unknown>;
  }): Promise<PaginatedResponse<MomenceMember>> {
    return this.request<PaginatedResponse<MomenceMember>>('POST', '/api/v2/host/members/list', {
      body,
    });
  }

  async createMember(data: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }): Promise<{ memberId: number }> {
    return this.request<{ memberId: number }>('POST', '/api/v2/host/members', { body: data });
  }

  async getMember(memberId: number): Promise<MomenceMember> {
    return this.request<MomenceMember>('GET', `/api/v2/host/members/${memberId}`);
  }

  async updateMemberName(
    memberId: number,
    data: { firstName: string; lastName: string }
  ): Promise<void> {
    await this.request('PUT', `/api/v2/host/members/${memberId}/name`, { body: data });
  }

  async updateMemberPhone(memberId: number, phoneNumber: string): Promise<void> {
    await this.request('PUT', `/api/v2/host/members/${memberId}/phone-number`, {
      body: { phoneNumber },
    });
  }

  async deleteMemberPhone(memberId: number): Promise<void> {
    await this.request('DELETE', `/api/v2/host/members/${memberId}/phone-number`);
  }

  async updateMemberEmail(memberId: number, email: string): Promise<void> {
    await this.request('PUT', `/api/v2/host/members/${memberId}/email`, { body: { email } });
  }

  async getMemberSessionBookings(
    memberId: number,
    params: {
      page: number;
      pageSize: number;
      startAfter?: string;
      startBefore?: string;
      includeCancelled?: boolean;
    }
  ): Promise<PaginatedResponse<MomenceBooking>> {
    const queryParams: Record<string, string | number | boolean> = {
      page: params.page,
      pageSize: params.pageSize,
    };
    if (params.startAfter) queryParams['startAfter'] = params.startAfter;
    if (params.startBefore) queryParams['startBefore'] = params.startBefore;
    if (params.includeCancelled !== undefined)
      queryParams['includeCancelled'] = params.includeCancelled;

    // Path correcto: /sessions (NO /session-bookings, que devuelve 404)
    return this.request<PaginatedResponse<MomenceBooking>>(
      'GET',
      `/api/v2/host/members/${memberId}/sessions`,
      { params: queryParams }
    );
  }

  // ==========================================================================
  // BOOKINGS - /api/v2/host/sessions/{sessionId}/bookings
  // ==========================================================================

  async createFreeBooking(
    sessionId: number,
    memberId: number,
    useBoughtMembershipIds?: number[]
  ): Promise<Record<string, unknown>> {
    const body: Record<string, unknown> = { memberId };
    if (useBoughtMembershipIds) {
      body['useBoughtMembershipIds'] = useBoughtMembershipIds;
    }
    return this.request<Record<string, unknown>>(
      'POST',
      `/api/v2/host/sessions/${sessionId}/bookings/free`,
      { body }
    );
  }

  async addToWaitlist(
    sessionId: number,
    memberId: number,
    useBoughtMembershipIds?: number[]
  ): Promise<Record<string, unknown>> {
    const body: Record<string, unknown> = { memberId };
    if (useBoughtMembershipIds) {
      body['useBoughtMembershipIds'] = useBoughtMembershipIds;
    }
    return this.request<Record<string, unknown>>(
      'POST',
      `/api/v2/host/sessions/${sessionId}/waitlist/bookings`,
      { body }
    );
  }

  async checkIn(bookingId: number): Promise<void> {
    await this.request('POST', `/api/v2/host/session-bookings/${bookingId}/check-in`);
  }

  async removeCheckIn(bookingId: number): Promise<void> {
    await this.request('DELETE', `/api/v2/host/session-bookings/${bookingId}/check-in`);
  }

  async cancelBooking(
    bookingId: number,
    options: {
      refund: boolean;
      disableNotifications: boolean;
      isLateCancellation: boolean;
    }
  ): Promise<void> {
    await this.request('DELETE', `/api/v2/host/session-bookings/${bookingId}`, {
      body: options,
    });
  }

  async cancelRecurringBooking(bookingId: number, afterSessionId?: number): Promise<void> {
    const body: Record<string, unknown> = {};
    if (afterSessionId) {
      body['afterSessionId'] = afterSessionId;
    }
    await this.request('DELETE', `/api/v2/host/session-recurring-bookings/${bookingId}`, { body });
  }

  // ==========================================================================
  // MEMBERSHIPS - /api/v2/host/memberships
  // ==========================================================================

  async getMemberships(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<MomenceMembership>> {
    return this.request<PaginatedResponse<MomenceMembership>>('GET', '/api/v2/host/memberships', {
      params: {
        page: params?.page ?? 0,
        pageSize: params?.pageSize ?? 100,
      },
    });
  }

  async getMemberBoughtMemberships(
    memberId: number,
    params?: {
      page?: number;
      pageSize?: number;
      includeFrozen?: boolean;
    }
  ): Promise<PaginatedResponse<MomenceBoughtMembership>> {
    // Path correcto: /bought-memberships/active (verificado en docs)
    return this.request<PaginatedResponse<MomenceBoughtMembership>>(
      'GET',
      `/api/v2/host/members/${memberId}/bought-memberships/active`,
      {
        params: {
          page: params?.page ?? 0,
          pageSize: params?.pageSize ?? 100,
          ...(params?.includeFrozen !== undefined && { includeFrozen: params.includeFrozen }),
        },
      }
    );
  }

  async updateMembershipCredits(
    memberId: number,
    boughtMembershipId: number,
    credits: { eventCreditsLeft?: number; moneyCreditsLeft?: number }
  ): Promise<void> {
    await this.request(
      'PUT',
      `/api/v2/host/members/${memberId}/bought-memberships/${boughtMembershipId}/credits`,
      { body: credits }
    );
  }

  // ==========================================================================
  // TAGS - /api/v2/host/tags
  // ==========================================================================

  async getTags(): Promise<MomenceTag[]> {
    const response = await this.request<{ payload: MomenceTag[] }>('GET', '/api/v2/host/tags');
    return response.payload || [];
  }

  async assignTag(memberId: number, tagId: number): Promise<void> {
    await this.request('POST', `/api/v2/host/members/${memberId}/tags/${tagId}`);
  }

  async removeTag(memberId: number, tagId: number): Promise<void> {
    await this.request('DELETE', `/api/v2/host/members/${memberId}/tags/${tagId}`);
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let clientInstance: MomenceApiClient | null = null;

export function getMomenceClient(redis: Redis | null = null): MomenceApiClient {
  if (!clientInstance) {
    clientInstance = new MomenceApiClient(redis);
  }
  return clientInstance;
}
