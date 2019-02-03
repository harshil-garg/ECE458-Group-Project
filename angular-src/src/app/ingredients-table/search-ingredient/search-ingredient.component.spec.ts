//based on https://medium.com/@nacimidjakirene/angular-search-autosuggest-with-observables-6f42987f80e6
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchIngredientComponent } from './search-ingredient.component';

describe('SearchIngredientComponent', () => {
  let component: SearchIngredientComponent;
  let fixture: ComponentFixture<SearchIngredientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchIngredientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchIngredientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
