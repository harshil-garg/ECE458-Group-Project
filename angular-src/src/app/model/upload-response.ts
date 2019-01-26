import { Observable } from 'rxjs';
import { ValidationData } from './validation-data';

export class UploadResponse {
    statuses: { [key: string]: Observable<number> };
    data: Observable<ValidationData>
}