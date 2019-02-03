import { TestBed } from '@angular/core/testing';

import { CrudSkuService } from './crud-sku.service';

describe('CrudSkuService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CrudSkuService = TestBed.get(CrudSkuService);
    expect(service).toBeTruthy();
  });
});
