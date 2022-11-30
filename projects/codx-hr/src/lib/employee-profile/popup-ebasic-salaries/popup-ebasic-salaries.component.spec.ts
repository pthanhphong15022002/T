import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEBasicSalariesComponent } from './popup-ebasic-salaries.component';

describe('PopupEBasicSalariesComponent', () => {
  let component: PopupEBasicSalariesComponent;
  let fixture: ComponentFixture<PopupEBasicSalariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEBasicSalariesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEBasicSalariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
