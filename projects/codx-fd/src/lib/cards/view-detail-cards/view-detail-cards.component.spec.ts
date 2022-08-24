import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailCardsComponent } from './view-detail-cards.component';

describe('ViewDetailCardsComponent', () => {
  let component: ViewDetailCardsComponent;
  let fixture: ComponentFixture<ViewDetailCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDetailCardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDetailCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
