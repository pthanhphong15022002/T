import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateVersionComponent } from './updateversion.component';

describe('UpdateversionComponent', () => {
  let component: UpdateVersionComponent;
  let fixture: ComponentFixture<UpdateVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateVersionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
