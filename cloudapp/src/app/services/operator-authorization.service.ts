import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';

import { AlmaUserService } from './alma-user.service';

export interface OperatorAuthorizationState {
  loading: boolean;
  authorized: boolean;
  operatorPrimaryId: string | null;
  roleNames: string[];
  error: string | null;
}

const REQUIRED_ROLE_NAMES = ['User Administrator', 'User Manager'] as const;
const REQUIRED_ROLE_SET = new Set(REQUIRED_ROLE_NAMES.map(role => role.toLowerCase()));

@Injectable({
  providedIn: 'root'
})
export class OperatorAuthorizationService {
  private readonly state$ = new BehaviorSubject<OperatorAuthorizationState>({
    loading: false,
    authorized: false,
    operatorPrimaryId: null,
    roleNames: [],
    error: null,
  });

  private result: OperatorAuthorizationState | null = null;
  private pending: Promise<OperatorAuthorizationState> | null = null;

  constructor(
    private events: CloudAppEventsService,
    private alma: AlmaUserService,
  ) {}

  watchState(): Observable<OperatorAuthorizationState> {
    return this.state$.asObservable();
  }

  async ensureAuthorized(forceRefresh = false): Promise<OperatorAuthorizationState> {
    if (!forceRefresh && this.result) {
      return this.result;
    }

    if (!forceRefresh && this.pending) {
      return this.pending;
    }

    this.state$.next({
      ...this.state$.value,
      loading: true,
      error: null,
    });

    this.pending = this.loadAuthorization().then(result => {
      this.result = result;
      this.state$.next(result);
      return result;
    }).finally(() => {
      this.pending = null;
    });

    return this.pending;
  }

  private async loadAuthorization(): Promise<OperatorAuthorizationState> {
    try {
      const initData = await firstValueFrom(this.events.getInitData()) as InitData;
      const operatorPrimaryId = initData?.user?.primaryId?.trim() || '';

      if (!operatorPrimaryId) {
        return {
          loading: false,
          authorized: false,
          operatorPrimaryId: null,
          roleNames: [],
          error: 'Unable to determine the logged-in Alma user.',
        };
      }

      const user = await this.alma.getUser(operatorPrimaryId);
      const roleNames = this.extractRoleNames(user);
      const authorized = roleNames.some(role => REQUIRED_ROLE_SET.has(role.toLowerCase()));

      return {
        loading: false,
        authorized,
        operatorPrimaryId,
        roleNames,
        error: null,
      };
    } catch (error: any) {
      return {
        loading: false,
        authorized: false,
        operatorPrimaryId: null,
        roleNames: [],
        error: error?.message || 'Failed to verify Alma operator roles.',
      };
    }
  }

  private extractRoleNames(user: any): string[] {
    const rawRoles = Array.isArray(user?.user_role)
      ? user.user_role
      : (user?.user_role ? [user.user_role] : []);

    const values = new Set<string>();

    for (const role of rawRoles) {
      const candidates = [
        role?.role_type?.desc,
        role?.role_type?.['@desc'],
        role?.role_type?.value,
        role?.desc,
        role?.['@desc'],
        role?.value,
        typeof role === 'string' ? role : null,
      ];

      for (const candidate of candidates) {
        const value = String(candidate || '').trim();
        if (value) {
          values.add(value);
        }
      }
    }

    return Array.from(values);
  }
}

export { REQUIRED_ROLE_NAMES };
