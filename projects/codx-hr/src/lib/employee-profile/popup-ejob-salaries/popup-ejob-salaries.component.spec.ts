import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEJobSalariesComponent } from './popup-ejob-salaries.component';

describe('PopupEJobSalariesComponent', () => {
  let component: PopupEJobSalariesComponent;
  let fixture: ComponentFixture<PopupEJobSalariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEJobSalariesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEJobSalariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
