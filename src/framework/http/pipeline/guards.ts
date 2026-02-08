import type { GuardContext, GuardToken } from '../constants';
import { HttpException } from '../errors/exceptions';

function instantiateGuard(guard: GuardToken) {
  if (typeof guard === 'function') {
    return new guard();
  }
  return guard;
}

export async function runGuardChain(
  guards: GuardToken[],
  context: GuardContext,
): Promise<void> {
  for (const guardToken of guards) {
    const guard = instantiateGuard(guardToken);
    const allowed = await guard.canActivate(context);
    if (!allowed) {
      throw new HttpException(403, 'Forbidden');
    }
  }
}
