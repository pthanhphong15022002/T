import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputNumberDurationComponent } from './input-number-duration.component';

describe('InputNumberDurationComponent', () => {
  let component: InputNumberDurationComponent;
  let fixture: ComponentFixture<InputNumberDurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputNumberDurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputNumberDurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
