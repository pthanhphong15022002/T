import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxOmComponent } from './codx-om.component';

describe('CodxOmComponent', () => {
  let component: CodxOmComponent;
  let fixture: ComponentFixture<CodxOmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxOmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxOmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
