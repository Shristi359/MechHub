export const EVENT_STREAM = 'dispatch-events';

export type EventType =
    | 'JOB_CREATED'
    | 'JOB_DISPATCHED'
    | 'JOB_ACCEPTED'
    | 'JOB_ESCALATED'
    | 'JOB_UNFULFILLED'
    | 'MECHANIC_ARRIVED'
    | 'QUOTE_SUBMITTED'
    | 'QUOTE_ACCEPTED'
    | 'JOB_COMPLETED'
    | 'JOB_CANCELLED'
    | 'PAYOUT_CREATED'
    | 'PAYOUT_SETTLED'
    | 'PAYOUT_FAILED';

export interface StreamEvent {
    event: EventType;
    data: Record<string, any>;
    timestamp: string;
}
