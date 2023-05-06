import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEaccidentsComponent } from './popup-eaccidents.component';

describe('PopupEaccidentsComponent', () => {
  let component: PopupEaccidentsComponent;
  let fixture: ComponentFixture<PopupEaccidentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEaccidentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEaccidentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
