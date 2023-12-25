import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxAiComponent } from './codx-ai.component';

describe('CodxAiComponent', () => {
  let component: CodxAiComponent;
  let fixture: ComponentFixture<CodxAiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxAiComponent]
    });
    fixture = TestBed.createComponent(CodxAiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
