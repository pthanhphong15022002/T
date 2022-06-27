import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailCoinsComponent } from './view-detail-coins.component';

describe('ViewDetailCoinsComponent', () => {
  let component: ViewDetailCoinsComponent;
  let fixture: ComponentFixture<ViewDetailCoinsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDetailCoinsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDetailCoinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
