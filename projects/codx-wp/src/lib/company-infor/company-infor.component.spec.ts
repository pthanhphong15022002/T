import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyInforComponent } from './company-infor.component';

describe('CompanyInforComponent', () => {
  let component: CompanyInforComponent;
  let fixture: ComponentFixture<CompanyInforComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyInforComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyInforComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
