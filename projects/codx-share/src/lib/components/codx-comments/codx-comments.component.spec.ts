import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxCommentsComponent } from './codx-comments.component';

describe('CodxCommentsComponent', () => {
  let component: CodxCommentsComponent;
  let fixture: ComponentFixture<CodxCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxCommentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
