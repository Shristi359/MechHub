export interface EscalationRound {
    round: number;
    radiusKm: number | null;
    batchSize: number | null;
    label: string;
}

export const ESCALATION_ROUNDS: EscalationRound[] = [
    { round: 1, radiusKm: 3,    batchSize: 3,    label: 'ROUND_1' },
    { round: 2, radiusKm: 5,    batchSize: 3,    label: 'ROUND_2' },
    { round: 3, radiusKm: 8,    batchSize: 3,    label: 'ROUND_3' },
    { round: 4, radiusKm: null, batchSize: null, label: 'ZONE_BROADCAST' },
];

export const ESCALATION_TIMEOUT_MS = 60_000;
export const DAEMON_POLL_INTERVAL_MS = 5_000;
export const MAX_ROUNDS = 4;
