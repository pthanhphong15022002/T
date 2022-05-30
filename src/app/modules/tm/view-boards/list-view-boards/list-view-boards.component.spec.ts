import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListViewBoardsComponent } from './list-view-boards.component';

describe('ListViewBoardsComponent', () => {
  let component: ListViewBoardsComponent;
  let fixture: ComponentFixture<ListViewBoardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListViewBoardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListViewBoardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
