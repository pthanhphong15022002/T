import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEDegreesComponent } from './popup-edegrees.component';

describe('PopupEDegreesComponent', () => {
  let component: PopupEDegreesComponent;
  let fixture: ComponentFixture<PopupEDegreesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEDegreesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEDegreesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
