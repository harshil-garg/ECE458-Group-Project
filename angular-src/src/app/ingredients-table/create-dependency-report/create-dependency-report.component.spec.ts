import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDependencyReportComponent } from './create-dependency-report.component';

describe('CreateDependencyReportComponent', () => {
  let component: CreateDependencyReportComponent;
  let fixture: ComponentFixture<CreateDependencyReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateDependencyReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDependencyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
