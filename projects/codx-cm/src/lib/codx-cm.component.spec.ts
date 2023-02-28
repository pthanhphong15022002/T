import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxCmComponent } from './codx-cm.component';

describe('CodxCmComponent', () => {
  let component: CodxCmComponent;
  let fixture: ComponentFixture<CodxCmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxCmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxCmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
