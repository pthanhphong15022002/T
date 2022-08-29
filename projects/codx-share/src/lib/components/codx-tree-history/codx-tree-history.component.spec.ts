import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxTreeHistoryComponent } from './codx-tree-history.component';

describe('CodxTreeHistoryComponent', () => {
  let component: CodxTreeHistoryComponent;
  let fixture: ComponentFixture<CodxTreeHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxTreeHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxTreeHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
