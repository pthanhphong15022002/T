import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEVisasComponent } from './popup-evisas.component';

describe('PopupEVisasComponent', () => {
  let component: PopupEVisasComponent;
  let fixture: ComponentFixture<PopupEVisasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEVisasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEVisasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
