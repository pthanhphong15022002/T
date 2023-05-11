import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupViewallSalaryComponent } from './popup-viewall-salary.component';

describe('PopupViewallSalaryComponent', () => {
  let component: PopupViewallSalaryComponent;
  let fixture: ComponentFixture<PopupViewallSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupViewallSalaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupViewallSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
