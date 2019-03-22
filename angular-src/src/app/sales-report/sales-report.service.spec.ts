import { TestBed } from '@angular/core/testing';

import { SalesReportService } from './sales-report.service';

describe('SalesReportService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SalesReportService = TestBed.get(SalesReportService);
    expect(service).toBeTruthy();
  });
});
