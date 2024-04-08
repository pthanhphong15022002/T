import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryLevelComponent } from './history-level.component';

describe('HistoryLevelComponent', () => {
  let component: HistoryLevelComponent;
  let fixture: ComponentFixture<HistoryLevelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistoryLevelComponent]
    });
    fixture = TestBed.createComponent(HistoryLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
