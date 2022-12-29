import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEdayoffsComponent } from './popup-edayoffs.component';

describe('PopupEdayoffsComponent', () => {
  let component: PopupEdayoffsComponent;
  let fixture: ComponentFixture<PopupEdayoffsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEdayoffsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEdayoffsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
