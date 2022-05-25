import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangesKanbanComponent } from './ranges-kanban.component';

describe('RangesKanbanComponent', () => {
  let component: RangesKanbanComponent;
  let fixture: ComponentFixture<RangesKanbanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RangesKanbanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RangesKanbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
