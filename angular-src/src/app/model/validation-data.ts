import { ValidationError } from './val-error';
export class ValidationData {
    success: boolean;
    errorList: ValidationError[];
    updateList: ValidationError[];
}