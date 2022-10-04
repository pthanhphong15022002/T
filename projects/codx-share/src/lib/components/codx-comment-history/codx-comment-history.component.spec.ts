import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxCommentHistoryComponent } from './codx-comment-history.component';

describe('CodxCommentHistoryComponent', () => {
  let component: CodxCommentHistoryComponent;
  let fixture: ComponentFixture<CodxCommentHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxCommentHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxCommentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
