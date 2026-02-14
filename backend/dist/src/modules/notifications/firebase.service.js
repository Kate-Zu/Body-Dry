"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
let FirebaseService = FirebaseService_1 = class FirebaseService {
    constructor() {
        this.logger = new common_1.Logger(FirebaseService_1.name);
        this.isInitialized = false;
    }
    onModuleInit() {
        this.initializeFirebase();
    }
    initializeFirebase() {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        if (!projectId || !clientEmail || !privateKey) {
            this.logger.warn('Firebase credentials not configured. Push notifications will be logged only. ' +
                'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
            return;
        }
        try {
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
            }
            else {
                this.isInitialized = true;
                this.logger.log('Firebase Admin SDK already initialized');
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize Firebase Admin SDK:', error);
        }
    }
    async sendToDevice(token, payload) {
        if (!this.isInitialized) {
            this.logger.log(`[MOCK] Push notification to ${token.substring(0, 20)}...: ${payload.title}`);
            return true;
        }
        try {
            const message = {
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
        }
        catch (error) {
            this.logger.error(`Failed to send push notification: ${error.message}`);
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                return false;
            }
            throw error;
        }
    }
    async sendToDevices(tokens, payload) {
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
            const message = {
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
            const invalidTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const error = resp.error;
                    if (error?.code === 'messaging/invalid-registration-token' ||
                        error?.code === 'messaging/registration-token-not-registered') {
                        invalidTokens.push(tokens[idx]);
                    }
                }
            });
            this.logger.log(`Push notifications sent: ${response.successCount} success, ${response.failureCount} failed`);
            return {
                successCount: response.successCount,
                failureCount: response.failureCount,
                invalidTokens,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send multicast notification: ${error.message}`);
            throw error;
        }
    }
    async sendToTopic(topic, payload) {
        if (!this.isInitialized) {
            this.logger.log(`[MOCK] Topic notification to ${topic}: ${payload.title}`);
            return true;
        }
        try {
            const message = {
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
        }
        catch (error) {
            this.logger.error(`Failed to send topic notification: ${error.message}`);
            throw error;
        }
    }
    async subscribeToTopic(tokens, topic) {
        if (!this.isInitialized) {
            this.logger.log(`[MOCK] Subscribe ${tokens.length} tokens to topic: ${topic}`);
            return;
        }
        try {
            await admin.messaging().subscribeToTopic(tokens, topic);
            this.logger.log(`Subscribed ${tokens.length} tokens to topic: ${topic}`);
        }
        catch (error) {
            this.logger.error(`Failed to subscribe to topic: ${error.message}`);
            throw error;
        }
    }
    isConfigured() {
        return this.isInitialized;
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)()
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map