import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlbPlayerCardComponent } from './mlb-player-card.component';

describe('MlbPlayerCardComponent', () => {
  let component: MlbPlayerCardComponent;
  let fixture: ComponentFixture<MlbPlayerCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MlbPlayerCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MlbPlayerCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
