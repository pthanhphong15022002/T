import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailContractsComponent } from './view-detail-contracts.component';

describe('ViewDetailContractsComponent', () => {
  let component: ViewDetailContractsComponent;
  let fixture: ComponentFixture<ViewDetailContractsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDetailContractsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDetailContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
