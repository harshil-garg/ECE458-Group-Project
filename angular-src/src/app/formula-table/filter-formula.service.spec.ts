import { TestBed } from '@angular/core/testing';

import { FilterFormulaService } from './filter-formula.service';

describe('FilterFormulaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FilterFormulaService = TestBed.get(FilterFormulaService);
    expect(service).toBeTruthy();
  });
});
