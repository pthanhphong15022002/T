import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewListDetailsComponent } from './view-list-details.component';

describe('ViewListDetailsComponent', () => {
  let component: ViewListDetailsComponent;
  let fixture: ComponentFixture<ViewListDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewListDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewListDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
