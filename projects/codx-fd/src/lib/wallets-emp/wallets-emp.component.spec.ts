import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletsEmpComponent } from './wallets-emp.component';

describe('WalletsEmpComponent', () => {
  let component: WalletsEmpComponent;
  let fixture: ComponentFixture<WalletsEmpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WalletsEmpComponent]
    });
    fixture = TestBed.createComponent(WalletsEmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
