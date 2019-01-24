import { TestBed } from '@angular/core/testing';

import { CrudIngredientsService } from './crud-ingredients.service';

describe('CrudIngredientsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CrudIngredientsService = TestBed.get(CrudIngredientsService);
    expect(service).toBeTruthy();
  });
});
