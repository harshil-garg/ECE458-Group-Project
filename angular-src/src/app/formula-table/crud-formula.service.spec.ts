import { TestBed } from '@angular/core/testing';

import { CrudFormulaService } from './crud-formula.service';

describe('CrudFormulaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CrudFormulaService = TestBed.get(CrudFormulaService);
    expect(service).toBeTruthy();
  });
});
