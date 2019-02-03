import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProductLineDialogComponent } from './add-product-line-dialog.component';

describe('AddProductLineDialogComponent', () => {
  let component: AddProductLineDialogComponent;
  let fixture: ComponentFixture<AddProductLineDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddProductLineDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProductLineDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
