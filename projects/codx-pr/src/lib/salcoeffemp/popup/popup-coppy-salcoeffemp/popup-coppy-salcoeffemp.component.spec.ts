import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupCoppySalcoeffempComponent } from './popup-coppy-salcoeffemp.component';

describe('PopupCoppySalcoeffempComponent', () => {
  let component: PopupCoppySalcoeffempComponent;
  let fixture: ComponentFixture<PopupCoppySalcoeffempComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupCoppySalcoeffempComponent]
    });
    fixture = TestBed.createComponent(PopupCoppySalcoeffempComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
