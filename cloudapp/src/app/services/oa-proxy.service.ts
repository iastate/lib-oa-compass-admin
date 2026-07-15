import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import {
  OAVerifyRequest,
  OAVerifyResponse,
  OAGetRequest,
  OAGetResponse,
  OAAccountCreate,
  OAAccountCreateResponse,
  OAAccountModify,
  OAAccountModifyResponse,
  OAResendRequest,
  OAResendResponse
} from '../models/oa-account.model';

import { AlmaUser } from '../models/alma-user.model';
import { AlmaUserService } from './alma-user.service';
import {
  CloudAppConfigService,
  CloudAppEventsService
} from '@exlibris/exl-cloudapp-angular-lib';

@Injectable({
  providedIn: 'root'
})
export class OAProxyService {

  /**
   * Default proxy base URL.
   *
   * Phase 4+: this is treated as a fallback. The real value should be
   * configured in the Cloud App "Configuration" view as proxyBaseUrl.
   */
  private baseUrl = 'https://app.lib.iastate.edu/oa-proxy';

  /** Configured Alma identifier type code used for OA username storage. */
  private oaIdTypeCode = '02';

  /**
   * Email domain that should not get a local OA account created
   * (e.g. "iastate.edu"). Null/empty means no restriction.
   */
  private disallowedEmailDomain: string | null = null;
  private authToken: string | null = null;

  private async getAuthToken(forceRefresh = false): Promise<string> {
    if (!forceRefresh && this.authToken) {
      return this.authToken;
    }

    const token = await firstValueFrom(this.events.getAuthToken());
    this.authToken = String(token || '').trim() || null;

    if (!this.authToken) {
      throw new Error('Cloud App auth token unavailable');
    }

    return this.authToken;
  }

  private async json(forceRefresh = false) {
    const token = await this.getAuthToken(forceRefresh);
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }),
    };
  }

  private async post<T>(path: string, payload: unknown): Promise<T> {
    try {
      const options = await this.json();
      return await firstValueFrom(
        this.http.post<T>(`${this.baseUrl}${path}`, payload, options)
      );
    } catch (err: any) {
      if (err?.status === 401) {
        this.authToken = null;
        const options = await this.json(true);
        return firstValueFrom(
          this.http.post<T>(`${this.baseUrl}${path}`, payload, options)
        );
      }
      throw err;
    }
  }

  constructor(
    private http: HttpClient,
    private configService: CloudAppConfigService,
    private events: CloudAppEventsService,
  ) {
    // Load proxyBaseUrl + behavior flags from Cloud App config.
    this.configService.get().subscribe({
      next: (cfg: any) => {
        // Proxy URL
        const url = (cfg?.proxyBaseUrl || '').toString().trim();
        if (url && url.startsWith('https://')) {
          this.baseUrl = url;
        } else if (url) {
          console.warn('OAProxyService: Ignoring non-HTTPS proxyBaseUrl from config.');
        }

        // ID type code (digits only, fallback "02")
        const rawCode = (cfg?.oaIdTypeCode || '').toString().trim();
        this.oaIdTypeCode = rawCode || '02';

        // Disallowed email domain (normalized to lowercase)
        const badDomain = (cfg?.disallowedEmailDomain || '').toString().trim().toLowerCase();
        this.disallowedEmailDomain = badDomain || null;
      },
      error: () => {
        // Ignore errors; keep defaults.
      },
    });
  }

  // ============================================================
  // Low-level proxy wrapper methods
  // ============================================================

  verify(payload: OAVerifyRequest): Promise<OAVerifyResponse> {
    return this.post<OAVerifyResponse>('/v1/oa/users/verify', payload);
  }

  get(payload: OAGetRequest): Promise<OAGetResponse> {
    return this.post<OAGetResponse>('/v1/oa/users/get', payload);
  }

  createAccount(payload: OAAccountCreate): Promise<OAAccountCreateResponse> {
    return this.post<OAAccountCreateResponse>('/v1/oa/users/create', payload);
  }

  modifyAccount(payload: OAAccountModify): Promise<OAAccountModifyResponse> {
    return this.post<OAAccountModifyResponse>('/v1/oa/users/modify', payload);
  }

  resendActivation(payload: OAResendRequest): Promise<OAResendResponse> {
    return this.post<OAResendResponse>('/v1/oa/users/resend-activation', payload);
  }

  // ============================================================
  // Higher-level OA orchestration helpers (used by Main)
  // ============================================================

  /**
   * Returns true if the configured disallowedEmailDomain should prevent
   * creating a local OA account for this email.
   *
   * Usage (in your create flow):
   *   if (oaProxy.isEmailCreationBlocked(email)) { skip OA create; ... }
   */
  isEmailCreationBlocked(email?: string | null): boolean {
    if (!email || !this.disallowedEmailDomain) return false;
    const parts = email.split('@');
    if (parts.length < 2) return false;
    const domain = parts[1].toLowerCase().trim();
    return domain === this.disallowedEmailDomain;
  }

  /**
   * Find an OA account corresponding to an Alma user by:
   *   1) OA username stored in Alma identifiers (configured type code)
   *   2) Email address from Alma user
   *   3) Alma primary_id
   *
   * This mirrors the lookup chain previously implemented in MainComponent.
   */
  async findAccountByAlmaUser(
    user: AlmaUser | null,
    alma: AlmaUserService,
    oaIdTypeCode?: string
  ): Promise<OAGetResponse | null> {

    if (!user) return null;

    const email = alma.getEmail(user);
    const pid = user.primary_id;

    const effectiveCode =
      (oaIdTypeCode || this.oaIdTypeCode || '02').toString().trim();

    // 1) Try OA username from Alma identifiers
    const knownUsername = alma.getOAUsernameFromIdentifiers(user, effectiveCode);
    if (knownUsername) {
      const byId = await this.get({ username: knownUsername }).catch(() => null);
      if (byId?.account) {
        return byId;
      }
    }

    // 2) Try email
    if (email) {
      const byEmail = await this.get({ email }).catch(() => null);
      if (byEmail?.account) {
        return byEmail;
      }
    }

    // 3) Try Alma primary_id as OA username
    if (pid) {
      const byPid = await this.get({ username: pid }).catch(() => null);
      if (byPid?.account) {
        return byPid;
      }
    }

    return null;
  }
}
