"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const notifications_service_1 = require("./notifications.service");
const dto_1 = require("./dto");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async registerToken(req, dto) {
        return this.notificationsService.registerToken(req.user.sub, dto);
    }
    async unregisterToken(req, token) {
        return this.notificationsService.unregisterToken(req.user.sub, token);
    }
    async getTokens(req) {
        return this.notificationsService.getUserTokens(req.user.sub);
    }
    async getSettings(req) {
        return this.notificationsService.getNotificationSettings(req.user.sub);
    }
    async updateSettings(req, settings) {
        return this.notificationsService.updateNotificationSettings(req.user.sub, settings);
    }
    getScheduledNotifications(req) {
        return this.notificationsService.getScheduledNotifications(req.user.sub);
    }
    clearScheduledNotifications(req) {
        return this.notificationsService.clearScheduledNotifications(req.user.sub);
    }
    async scheduleWaterReminder(req, body) {
        const time = new Date(body.time);
        return this.notificationsService.scheduleWaterReminder(req.user.sub, time);
    }
    async scheduleMealReminder(req, body) {
        const time = new Date(body.time);
        return this.notificationsService.scheduleMealReminder(req.user.sub, body.mealType, time);
    }
    async scheduleWeightReminder(req, body) {
        const time = new Date(body.time);
        return this.notificationsService.scheduleWeightReminder(req.user.sub, time);
    }
    async scheduleDailySummary(req, body) {
        const time = new Date(body.time);
        return this.notificationsService.scheduleDailySummary(req.user.sub, time);
    }
    async sendTestNotification(req, dto) {
        return this.notificationsService.sendToUser(req.user.sub, dto);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)('token'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.RegisterTokenDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "registerToken", null);
__decorate([
    (0, common_1.Delete)('token/:token'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "unregisterToken", null);
__decorate([
    (0, common_1.Get)('tokens'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getTokens", null);
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Post)('settings'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Get)('scheduled'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getScheduledNotifications", null);
__decorate([
    (0, common_1.Delete)('scheduled'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "clearScheduledNotifications", null);
__decorate([
    (0, common_1.Post)('schedule/water'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "scheduleWaterReminder", null);
__decorate([
    (0, common_1.Post)('schedule/meal'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "scheduleMealReminder", null);
__decorate([
    (0, common_1.Post)('schedule/weight'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "scheduleWeightReminder", null);
__decorate([
    (0, common_1.Post)('schedule/summary'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "scheduleDailySummary", null);
__decorate([
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.SendNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendTestNotification", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map