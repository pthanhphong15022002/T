import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxDmComponent } from './codx-dm.component';

describe('CodxDmComponent', () => {
  let component: CodxDmComponent;
  let fixture: ComponentFixture<CodxDmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxDmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxDmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
