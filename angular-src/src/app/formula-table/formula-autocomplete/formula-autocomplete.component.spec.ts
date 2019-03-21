import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaAutocompleteComponent } from './formula-autocomplete.component';

describe('FormulaAutocompleteComponent', () => {
  let component: FormulaAutocompleteComponent;
  let fixture: ComponentFixture<FormulaAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormulaAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
