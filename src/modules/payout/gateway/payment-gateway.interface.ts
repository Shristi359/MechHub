export interface PaymentGatewayResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export interface PaymentGateway {
    name: string;
    transfer(params: {
        mechanicId: string;
        amount: number;
        phone: string;
    }): Promise<PaymentGatewayResult>;
}
