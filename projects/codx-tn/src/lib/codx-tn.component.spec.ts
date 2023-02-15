import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxTnComponent } from './codx-tn.component';

describe('CodxTnComponent', () => {
  let component: CodxTnComponent;
  let fixture: ComponentFixture<CodxTnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxTnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxTnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
