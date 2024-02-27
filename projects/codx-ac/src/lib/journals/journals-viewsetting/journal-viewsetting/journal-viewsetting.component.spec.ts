import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalViewsettingComponent } from './journal-viewsetting.component';

describe('JournalViewsettingComponent', () => {
  let component: JournalViewsettingComponent;
  let fixture: ComponentFixture<JournalViewsettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JournalViewsettingComponent]
    });
    fixture = TestBed.createComponent(JournalViewsettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
