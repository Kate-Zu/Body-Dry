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
exports.WaterController = void 0;
const common_1 = require("@nestjs/common");
const water_service_1 = require("./water.service");
const add_water_dto_1 = require("./dto/add-water.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let WaterController = class WaterController {
    constructor(waterService) {
        this.waterService = waterService;
    }
    async getWaterHistory(userId, startDate, endDate) {
        return this.waterService.getWaterHistory(userId, startDate, endDate);
    }
    async getWaterByDate(userId, date) {
        return this.waterService.getWaterByDate(userId, date);
    }
    async addWater(userId, dto) {
        return this.waterService.addWater(userId, dto);
    }
    async updateWaterGoal(userId, waterGoal) {
        return this.waterService.updateWaterGoal(userId, waterGoal);
    }
};
exports.WaterController = WaterController;
__decorate([
    (0, common_1.Get)('history/range'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WaterController.prototype, "getWaterHistory", null);
__decorate([
    (0, common_1.Get)(':date'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WaterController.prototype, "getWaterByDate", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_water_dto_1.AddWaterDto]),
    __metadata("design:returntype", Promise)
], WaterController.prototype, "addWater", null);
__decorate([
    (0, common_1.Patch)('goal'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)('waterGoal')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], WaterController.prototype, "updateWaterGoal", null);
exports.WaterController = WaterController = __decorate([
    (0, common_1.Controller)('water'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [water_service_1.WaterService])
], WaterController);
//# sourceMappingURL=water.controller.js.map