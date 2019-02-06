import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSkuDialogComponent } from './add-sku-dialog.component';

describe('AddSkuDialogComponent', () => {
  let component: AddSkuDialogComponent;
  let fixture: ComponentFixture<AddSkuDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSkuDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSkuDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
