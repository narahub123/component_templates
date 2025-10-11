export type ModalHistoryOptions =
  | boolean
  | {
      enabled?: boolean;
      state?: Record<string, unknown>;
      url?: string | null;
    };

export type ResolvedModalHistoryOptions = {
  enabled: boolean;
  state?: Record<string, unknown>;
  url?: string | null;
};
