// Speed control constants - single source of truth for speed limits
export const SPEED_CONTROL = {
    MIN_SPEED: 0.5,
    MAX_SPEED: 5.0,
    SPEED_STEP: 0.5,
    DEBOUNCE_DELAY: 100  // milliseconds
} as const;
