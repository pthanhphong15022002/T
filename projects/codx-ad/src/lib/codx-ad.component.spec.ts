import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxAdComponent } from './codx-ad.component';

describe('CodxAdComponent', () => {
  let component: CodxAdComponent;
  let fixture: ComponentFixture<CodxAdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxAdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
