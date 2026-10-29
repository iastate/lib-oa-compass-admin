/** Fixed test destination, available only in an Angular development build on ECA loopback. */
export function localDevelopmentProxy(development: boolean, location?: { hostname: string; port: string }): string | null {
  return development && location?.port === '4200' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
    ? 'https://localhost:8443/oa-proxy' : null;
}
