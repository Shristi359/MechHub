import { redis } from '../../config/redis';

const LOCK_TTL_SECONDS = 300;

export interface LockResult {
    acquired: boolean;
    holderId: string | null;
}

export async function acquireJobLock(
    jobId: string,
    mechanicId: string
): Promise<LockResult> {
    const key = `job_lock:${jobId}`;

    const result = await redis.set(key, mechanicId, 'EX', LOCK_TTL_SECONDS, 'NX');

    if (result === 'OK') {
        return { acquired: true, holderId: mechanicId };
    }

    const holderId = await redis.get(key);
    return { acquired: false, holderId };
}

export async function releaseJobLock(
    jobId: string,
    mechanicId: string
): Promise<boolean> {
    const key = `job_lock:${jobId}`;

    const script = `
        if redis.call('GET', KEYS[1]) == ARGV[1] then
            return redis.call('DEL', KEYS[1])
        else
            return 0
        end
    `;

    const result = await redis.eval(script, 1, key, mechanicId);
    return result === 1;
}

export async function getJobLockHolder(jobId: string): Promise<string | null> {
    return redis.get(`job_lock:${jobId}`);
}
