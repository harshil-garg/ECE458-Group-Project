import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkSkuEditDialogComponent } from './bulk-sku-edit-dialog.component';

describe('BulkSkuEditDialogComponent', () => {
  let component: BulkSkuEditDialogComponent;
  let fixture: ComponentFixture<BulkSkuEditDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkSkuEditDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkSkuEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
