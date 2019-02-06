import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DependencyReportDialogComponent } from './dependency-report-dialog.component';

describe('DependencyReportDialogComponent', () => {
  let component: DependencyReportDialogComponent;
  let fixture: ComponentFixture<DependencyReportDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DependencyReportDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DependencyReportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
