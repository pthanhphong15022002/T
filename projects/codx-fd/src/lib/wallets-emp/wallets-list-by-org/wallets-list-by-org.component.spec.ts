import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletsListByOrgComponent } from './wallets-list-by-org.component';

describe('WalletsListByOrgComponent', () => {
  let component: WalletsListByOrgComponent;
  let fixture: ComponentFixture<WalletsListByOrgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WalletsListByOrgComponent]
    });
    fixture = TestBed.createComponent(WalletsListByOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
