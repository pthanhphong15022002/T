import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailPolicyComponent } from './detail-policy.component';

describe('DetailPolicyComponent', () => {
  let component: DetailPolicyComponent;
  let fixture: ComponentFixture<DetailPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailPolicyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
