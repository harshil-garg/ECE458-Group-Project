import { TestBed } from '@angular/core/testing';

import { FilterSkuService } from './filter-sku.service';

describe('FilterSkuService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FilterSkuService = TestBed.get(FilterSkuService);
    expect(service).toBeTruthy();
  });
});
