import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProductLineComponent } from './add-product-line.component';

describe('AddProductLineComponent', () => {
  let component: AddProductLineComponent;
  let fixture: ComponentFixture<AddProductLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddProductLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProductLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
