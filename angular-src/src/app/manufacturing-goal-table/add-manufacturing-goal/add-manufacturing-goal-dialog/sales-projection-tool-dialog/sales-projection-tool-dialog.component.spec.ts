import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesProjectionToolDialogComponent } from './sales-projection-tool-dialog.component';

describe('SalesProjectionToolDialogComponent', () => {
  let component: SalesProjectionToolDialogComponent;
  let fixture: ComponentFixture<SalesProjectionToolDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesProjectionToolDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesProjectionToolDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
