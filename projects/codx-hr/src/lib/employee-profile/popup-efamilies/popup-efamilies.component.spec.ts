import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEFamiliesComponent } from './popup-efamilies.component';

describe('PopupEFamiliesComponent', () => {
  let component: PopupEFamiliesComponent;
  let fixture: ComponentFixture<PopupEFamiliesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEFamiliesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEFamiliesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
