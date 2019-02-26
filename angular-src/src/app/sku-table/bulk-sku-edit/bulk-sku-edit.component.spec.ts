import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkSkuEditComponent } from './bulk-sku-edit.component';

describe('BulkSkuEditComponent', () => {
  let component: BulkSkuEditComponent;
  let fixture: ComponentFixture<BulkSkuEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkSkuEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkSkuEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
