import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEDisciplinesComponent } from './popup-edisciplines.component';

describe('PopupEDisciplinesComponent', () => {
  let component: PopupEDisciplinesComponent;
  let fixture: ComponentFixture<PopupEDisciplinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEDisciplinesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEDisciplinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
