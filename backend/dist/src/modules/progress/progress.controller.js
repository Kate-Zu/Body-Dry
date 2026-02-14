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
exports.ProgressController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const progress_service_1 = require("./progress.service");
const add_weight_dto_1 = require("./dto/add-weight.dto");
let ProgressController = class ProgressController {
    constructor(progressService) {
        this.progressService = progressService;
    }
    async getWeightHistory(userId, limit) {
        return this.progressService.getWeightHistory(userId, limit ? parseInt(limit) : 30);
    }
    async addWeight(userId, dto) {
        return this.progressService.addWeight(userId, dto);
    }
    async deleteWeight(userId, weightId) {
        return this.progressService.deleteWeight(userId, weightId);
    }
    async getWeeklyProgress(userId) {
        return this.progressService.getWeeklyProgress(userId);
    }
    async getMonthlyProgress(userId) {
        return this.progressService.getMonthlyProgress(userId);
    }
    async getYearlyProgress(userId) {
        return this.progressService.getYearlyProgress(userId);
    }
};
exports.ProgressController = ProgressController;
__decorate([
    (0, common_1.Get)('weight'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "getWeightHistory", null);
__decorate([
    (0, common_1.Post)('weight'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_weight_dto_1.AddWeightDto]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "addWeight", null);
__decorate([
    (0, common_1.Delete)('weight/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "deleteWeight", null);
__decorate([
    (0, common_1.Get)('weekly'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "getWeeklyProgress", null);
__decorate([
    (0, common_1.Get)('monthly'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "getMonthlyProgress", null);
__decorate([
    (0, common_1.Get)('yearly'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "getYearlyProgress", null);
exports.ProgressController = ProgressController = __decorate([
    (0, common_1.Controller)('progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [progress_service_1.ProgressService])
], ProgressController);
//# sourceMappingURL=progress.controller.js.map