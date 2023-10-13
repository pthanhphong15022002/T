import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxShowMoreLessComponent } from './codx-show-more-less.component';

describe('CodxShowMoreLessComponent', () => {
  let component: CodxShowMoreLessComponent;
  let fixture: ComponentFixture<CodxShowMoreLessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxShowMoreLessComponent]
    });
    fixture = TestBed.createComponent(CodxShowMoreLessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
