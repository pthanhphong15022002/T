import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEquitjobComponent } from './popup-equitjob.component';

describe('PopupEquitjobComponent', () => {
  let component: PopupEquitjobComponent;
  let fixture: ComponentFixture<PopupEquitjobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEquitjobComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEquitjobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
