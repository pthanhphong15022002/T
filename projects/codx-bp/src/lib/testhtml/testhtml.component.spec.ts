import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TesthtmlComponent } from './testhtml.component';

describe('TesthtmlComponent', () => {
  let component: TesthtmlComponent;
  let fixture: ComponentFixture<TesthtmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TesthtmlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TesthtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
