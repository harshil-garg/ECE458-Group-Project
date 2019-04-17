import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TupleEditDialogComponent } from './tuple-edit-dialog.component';

describe('TupleEditDialogComponent', () => {
  let component: TupleEditDialogComponent;
  let fixture: ComponentFixture<TupleEditDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TupleEditDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TupleEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
