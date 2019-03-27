import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductLineAutocompleteComponent } from './product-line-autocomplete.component';

describe('ProductLineAutocompleteComponent', () => {
  let component: ProductLineAutocompleteComponent;
  let fixture: ComponentFixture<ProductLineAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductLineAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductLineAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
