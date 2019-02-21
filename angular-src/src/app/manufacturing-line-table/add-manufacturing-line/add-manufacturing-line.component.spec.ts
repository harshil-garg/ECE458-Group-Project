import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddManufacturingLineComponent } from './add-manufacturing-line.component';

describe('AddManufacturingLineComponent', () => {
  let component: AddManufacturingLineComponent;
  let fixture: ComponentFixture<AddManufacturingLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddManufacturingLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddManufacturingLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
