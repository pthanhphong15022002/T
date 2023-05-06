import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupJobGeneralInfoComponent } from './popup-job-general-info.component';

describe('PopupJobGeneralInfoComponent', () => {
  let component: PopupJobGeneralInfoComponent;
  let fixture: ComponentFixture<PopupJobGeneralInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupJobGeneralInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupJobGeneralInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
