import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewContractsDetailComponent } from './view-contracts-detail.component';

describe('ViewContractsDetailComponent', () => {
  let component: ViewContractsDetailComponent;
  let fixture: ComponentFixture<ViewContractsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewContractsDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewContractsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
