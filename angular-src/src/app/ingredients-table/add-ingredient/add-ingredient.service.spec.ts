import { TestBed } from '@angular/core/testing';

import { AddIngredientService } from './add-ingredient.service';

describe('AddIngredientService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AddIngredientService = TestBed.get(AddIngredientService);
    expect(service).toBeTruthy();
  });
});
