import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmComponent } from './tm.component';

describe('TmComponent', () => {
  let component: TmComponent;
  let fixture: ComponentFixture<TmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
