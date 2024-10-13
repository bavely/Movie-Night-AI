import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiaComponent } from './mia.component';

describe('MiaComponent', () => {
  let component: MiaComponent;
  let fixture: ComponentFixture<MiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
