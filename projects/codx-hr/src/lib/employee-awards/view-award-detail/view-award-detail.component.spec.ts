import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAwardDetailComponent } from './view-award-detail.component';

describe('ViewAwardDetailComponent', () => {
  let component: ViewAwardDetailComponent;
  let fixture: ComponentFixture<ViewAwardDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAwardDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAwardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
