import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupESelfInfoComponent } from './popup-eself-info.component';

describe('PopupESelfInfoComponent', () => {
  let component: PopupESelfInfoComponent;
  let fixture: ComponentFixture<PopupESelfInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupESelfInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupESelfInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
