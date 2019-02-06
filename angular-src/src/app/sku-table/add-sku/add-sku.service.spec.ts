import { TestBed } from '@angular/core/testing';

import { AddSkuService } from './add-sku.service';

describe('AddSkuService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AddSkuService = TestBed.get(AddSkuService);
    expect(service).toBeTruthy();
  });
});
