import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlbPlayerDetailCardComponent } from './mlb-player-detail-card.component';

describe('MlbPlayerDetailCardComponent', () => {
  let component: MlbPlayerDetailCardComponent;
  let fixture: ComponentFixture<MlbPlayerDetailCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MlbPlayerDetailCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MlbPlayerDetailCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
