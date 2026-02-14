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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGoalsDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateGoalsDto {
}
exports.UpdateGoalsDto = UpdateGoalsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(800, { message: 'Калорії мають бути мінімум 800' }),
    (0, class_validator_1.Max)(10000, { message: 'Калорії мають бути максимум 10000' }),
    __metadata("design:type", Number)
], UpdateGoalsDto.prototype, "calorieGoal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: 'Білки мають бути мінімум 0г' }),
    (0, class_validator_1.Max)(500, { message: 'Білки мають бути максимум 500г' }),
    __metadata("design:type", Number)
], UpdateGoalsDto.prototype, "proteinGoal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: 'Вуглеводи мають бути мінімум 0г' }),
    (0, class_validator_1.Max)(800, { message: 'Вуглеводи мають бути максимум 800г' }),
    __metadata("design:type", Number)
], UpdateGoalsDto.prototype, "carbsGoal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: 'Жири мають бути мінімум 0г' }),
    (0, class_validator_1.Max)(300, { message: 'Жири мають бути максимум 300г' }),
    __metadata("design:type", Number)
], UpdateGoalsDto.prototype, "fatsGoal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: 'Норма води має бути мінімум 1л' }),
    (0, class_validator_1.Max)(10, { message: 'Норма води має бути максимум 10л' }),
    __metadata("design:type", Number)
], UpdateGoalsDto.prototype, "waterGoal", void 0);
//# sourceMappingURL=update-goals.dto.js.map