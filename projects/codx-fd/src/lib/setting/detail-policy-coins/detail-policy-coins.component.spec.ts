import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailPolicyCoinsComponent } from './detail-policy-coins.component';

describe('DetailPolicyCoinsComponent', () => {
  let component: DetailPolicyCoinsComponent;
  let fixture: ComponentFixture<DetailPolicyCoinsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailPolicyCoinsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailPolicyCoinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
