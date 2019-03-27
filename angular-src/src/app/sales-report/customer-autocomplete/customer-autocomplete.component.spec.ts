import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAutocompleteComponent } from './customer-autocomplete.component';

describe('CustomerAutocompleteComponent', () => {
  let component: CustomerAutocompleteComponent;
  let fixture: ComponentFixture<CustomerAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
