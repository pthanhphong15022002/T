import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBoardInfoComponent } from './view-board-info.component';

describe('ViewBoardInfoComponent', () => {
  let component: ViewBoardInfoComponent;
  let fixture: ComponentFixture<ViewBoardInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewBoardInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBoardInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
