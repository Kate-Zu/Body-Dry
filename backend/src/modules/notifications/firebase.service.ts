import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private isInitialized = false;

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    // Check if Firebase credentials are configured
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'Firebase credentials not configured. Push notifications will be logged only. ' +
        'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.'
      );
      return;
    }

    try {
      // Check if already initialized
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.isInitialized = true;
        this.logger.log('Firebase Admin SDK initialized successfully');
      } else {
        this.isInitialized = true;
        this.logger.log('Firebase Admin SDK already initialized');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  /**
   * Send push notification to a single device token
   */
  async sendToDevice(token: string, payload: PushNotificationPayload): Promise<boolean> {
    if (!this.isInitialized) {
      this.logger.log(`[MOCK] Push notification to ${token.substring(0, 20)}...: ${payload.title}`);
      return true; // Return true for mock mode
    }

    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'bodyndry_default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Push notification sent successfully: ${response}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      
      // Handle invalid/expired tokens
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        return false; // Token should be removed
      }
      
      throw error;
    }
  }

  /**
   * Send push notification to multiple device tokens
   */
  async sendToDevices(tokens: string[], payload: PushNotificationPayload): Promise<{
    successCount: number;
    failureCount: number;
    invalidTokens: string[];
  }> {
    if (!this.isInitialized) {
      this.logger.log(`[MOCK] Push notification to ${tokens.length} devices: ${payload.title}`);
      return {
        successCount: tokens.length,
        failureCount: 0,
        invalidTokens: [],
      };
    }

    if (tokens.length === 0) {
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'bodyndry_default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error;
          if (
            error?.code === 'messaging/invalid-registration-token' ||
            error?.code === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      this.logger.log(
        `Push notifications sent: ${response.successCount} success, ${response.failureCount} failed`
      );

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens,
      };
    } catch (error: any) {
      this.logger.error(`Failed to send multicast notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send topic notification (for broadcasts)
   */
  async sendToTopic(topic: string, payload: PushNotificationPayload): Promise<boolean> {
    if (!this.isInitialized) {
      this.logger.log(`[MOCK] Topic notification to ${topic}: ${payload.title}`);
      return true;
    }

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data,
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Topic notification sent successfully: ${response}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send topic notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Subscribe tokens to a topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.isInitialized) {
      this.logger.log(`[MOCK] Subscribe ${tokens.length} tokens to topic: ${topic}`);
      return;
    }

    try {
      await admin.messaging().subscribeToTopic(tokens, topic);
      this.logger.log(`Subscribed ${tokens.length} tokens to topic: ${topic}`);
    } catch (error: any) {
      this.logger.error(`Failed to subscribe to topic: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if Firebase is properly configured
   */
  isConfigured(): boolean {
    return this.isInitialized;
  }
}
