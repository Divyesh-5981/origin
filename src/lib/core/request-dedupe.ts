export interface RequestStore {
  readonly inFlight: ReadonlySet<string>;
}

export interface RegisterResult {
  readonly accepted: boolean;
  readonly store: RequestStore;
}

export function emptyRequestStore(): RequestStore {
  return { inFlight: new Set<string>() };
}

export function isInFlight(store: RequestStore, id: string): boolean {
  return store.inFlight.has(id);
}

export function registerRequest(store: RequestStore, id: string): RegisterResult {
  if (store.inFlight.has(id)) {
    return { accepted: false, store };
  }
  const inFlight = new Set(store.inFlight);
  inFlight.add(id);
  return { accepted: true, store: { inFlight } };
}

export function resolveRequest(store: RequestStore, id: string): RequestStore {
  if (!store.inFlight.has(id)) {
    return store;
  }
  const inFlight = new Set(store.inFlight);
  inFlight.delete(id);
  return { inFlight };
}
