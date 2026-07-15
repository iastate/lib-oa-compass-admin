import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { OperatorAuthorizationService } from '../services/operator-authorization.service';

export const operatorAuthorizationGuard: CanActivateFn = async () => {
  const auth = inject(OperatorAuthorizationService);
  const router = inject(Router);
  const result = await auth.ensureAuthorized();

  if (result.authorized) {
    return true;
  }

  return router.parseUrl('/');
};
