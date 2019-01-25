import { TestBed } from '@angular/core/testing';

import { FilterIngredientsService } from './filter-ingredients.service';

describe('FilterIngredientsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FilterIngredientsService = TestBed.get(FilterIngredientsService);
    expect(service).toBeTruthy();
  });
});
