import { TestBed } from '@angular/core/testing';

import { ManufacturingScheduleService } from './manufacturing-schedule.service';

describe('ManufacturingScheduleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ManufacturingScheduleService = TestBed.get(ManufacturingScheduleService);
    expect(service).toBeTruthy();
  });
});
