import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkuAutocompleteComponent } from './sku-autocomplete.component';

describe('SkuAutocompleteComponent', () => {
  let component: SkuAutocompleteComponent;
  let fixture: ComponentFixture<SkuAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkuAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkuAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
