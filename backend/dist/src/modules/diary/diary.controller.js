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
exports.DiaryController = void 0;
const common_1 = require("@nestjs/common");
const diary_service_1 = require("./diary.service");
const add_food_entry_dto_1 = require("./dto/add-food-entry.dto");
const update_food_entry_dto_1 = require("./dto/update-food-entry.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let DiaryController = class DiaryController {
    constructor(diaryService) {
        this.diaryService = diaryService;
    }
    async getSummary(userId, startDate, endDate) {
        return this.diaryService.getSummary(userId, startDate, endDate);
    }
    async getDiaryByDate(userId, date) {
        return this.diaryService.getDiaryByDate(userId, date);
    }
    async addFoodEntry(userId, dto) {
        return this.diaryService.addFoodEntry(userId, dto);
    }
    async updateFoodEntry(userId, entryId, dto) {
        return this.diaryService.updateFoodEntry(userId, entryId, dto.amount);
    }
    async deleteFoodEntry(userId, entryId) {
        return this.diaryService.deleteFoodEntry(userId, entryId);
    }
};
exports.DiaryController = DiaryController;
__decorate([
    (0, common_1.Get)('summary/range'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DiaryController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)(':date'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DiaryController.prototype, "getDiaryByDate", null);
__decorate([
    (0, common_1.Post)('entry'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_food_entry_dto_1.AddFoodEntryDto]),
    __metadata("design:returntype", Promise)
], DiaryController.prototype, "addFoodEntry", null);
__decorate([
    (0, common_1.Patch)('entry/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_food_entry_dto_1.UpdateFoodEntryDto]),
    __metadata("design:returntype", Promise)
], DiaryController.prototype, "updateFoodEntry", null);
__decorate([
    (0, common_1.Delete)('entry/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DiaryController.prototype, "deleteFoodEntry", null);
exports.DiaryController = DiaryController = __decorate([
    (0, common_1.Controller)('diary'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [diary_service_1.DiaryService])
], DiaryController);
//# sourceMappingURL=diary.controller.js.map