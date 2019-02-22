import { TestBed } from '@angular/core/testing';

import { CrudManufacturingLineService } from './crud-manufacturing-line.service';

describe('CrudManufacturingLineService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CrudManufacturingLineService = TestBed.get(CrudManufacturingLineService);
    expect(service).toBeTruthy();
  });
});
