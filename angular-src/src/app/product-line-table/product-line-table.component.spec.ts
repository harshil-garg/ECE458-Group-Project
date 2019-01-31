import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductLineTableComponent } from './product-line-table.component';

describe('ProductLineTableComponent', () => {
  let component: ProductLineTableComponent;
  let fixture: ComponentFixture<ProductLineTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductLineTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductLineTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
