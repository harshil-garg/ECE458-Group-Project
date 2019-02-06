import { TestBed } from '@angular/core/testing';

import { CrudProductLineService } from './crud-product-line.service';

describe('CrudProductLineService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CrudProductLineService = TestBed.get(CrudProductLineService);
    expect(service).toBeTruthy();
  });
});
