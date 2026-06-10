import { PaymentGateway, PaymentGatewayResult } from './payment-gateway.interface';

export class EsewaGateway implements PaymentGateway {
    name = 'eSewa';

    async transfer(params: {
        mechanicId: string;
        amount: number;
        phone: string;
    }): Promise<PaymentGatewayResult> {
        console.log(`[eSewa STUB] Transfer NPR ${params.amount} to ${params.phone}`);
        return {
            success: true,
            transactionId: `ESEWA_${Date.now()}_${params.mechanicId.slice(0, 8)}`,
        };
    }
}
