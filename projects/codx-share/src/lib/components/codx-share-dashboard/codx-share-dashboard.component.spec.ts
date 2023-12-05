import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxShareDashboardComponent } from './codx-share-dashboard.component';

describe('CodxShareDashboardComponent', () => {
  let component: CodxShareDashboardComponent;
  let fixture: ComponentFixture<CodxShareDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxShareDashboardComponent]
    });
    fixture = TestBed.createComponent(CodxShareDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
