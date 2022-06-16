import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupShareSprintsComponent } from './popup-share-sprints.component';

describe('PopupShareSprintsComponent', () => {
  let component: PopupShareSprintsComponent;
  let fixture: ComponentFixture<PopupShareSprintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupShareSprintsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupShareSprintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
