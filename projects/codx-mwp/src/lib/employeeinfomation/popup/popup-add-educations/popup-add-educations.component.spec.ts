import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddEducationsComponent } from './popup-add-educations.component';

describe('PopupAddEducationsComponent', () => {
  let component: PopupAddEducationsComponent;
  let fixture: ComponentFixture<PopupAddEducationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddEducationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddEducationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
