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
exports.CreateProfileDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateProfileDto {
}
exports.CreateProfileDto = CreateProfileDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Ім\'я обов\'язкове' }),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.Gender, { message: 'Невірна стать' }),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Невірний формат дати народження' }),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Зріст має бути числом' }),
    (0, class_validator_1.Min)(100, { message: 'Зріст має бути мінімум 100 см' }),
    (0, class_validator_1.Max)(250, { message: 'Зріст має бути максимум 250 см' }),
    __metadata("design:type", Number)
], CreateProfileDto.prototype, "height", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Вага має бути числом' }),
    (0, class_validator_1.Min)(30, { message: 'Вага має бути мінімум 30 кг' }),
    (0, class_validator_1.Max)(300, { message: 'Вага має бути максимум 300 кг' }),
    __metadata("design:type", Number)
], CreateProfileDto.prototype, "currentWeight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Цільова вага має бути числом' }),
    (0, class_validator_1.Min)(30, { message: 'Цільова вага має бути мінімум 30 кг' }),
    (0, class_validator_1.Max)(300, { message: 'Цільова вага має бути максимум 300 кг' }),
    __metadata("design:type", Number)
], CreateProfileDto.prototype, "targetWeight", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ActivityLevel, { message: 'Невірний рівень активності' }),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "activityLevel", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.Goal, { message: 'Невірна ціль' }),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "goal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Норма води має бути числом' }),
    (0, class_validator_1.Min)(1, { message: 'Норма води має бути мінімум 1 л' }),
    (0, class_validator_1.Max)(10, { message: 'Норма води має бути максимум 10 л' }),
    __metadata("design:type", Number)
], CreateProfileDto.prototype, "waterGoal", void 0);
//# sourceMappingURL=create-profile.dto.js.map