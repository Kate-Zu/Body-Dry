import { OnModuleInit } from '@nestjs/common';
export interface PushNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
}
export declare class FirebaseService implements OnModuleInit {
    private readonly logger;
    private isInitialized;
    onModuleInit(): void;
    private initializeFirebase;
    sendToDevice(token: string, payload: PushNotificationPayload): Promise<boolean>;
    sendToDevices(tokens: string[], payload: PushNotificationPayload): Promise<{
        successCount: number;
        failureCount: number;
        invalidTokens: string[];
    }>;
    sendToTopic(topic: string, payload: PushNotificationPayload): Promise<boolean>;
    subscribeToTopic(tokens: string[], topic: string): Promise<void>;
    isConfigured(): boolean;
}
