import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDetailComponent } from './popup-detail.component';

describe('PopupDetailComponent', () => {
  let component: PopupDetailComponent;
  let fixture: ComponentFixture<PopupDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
