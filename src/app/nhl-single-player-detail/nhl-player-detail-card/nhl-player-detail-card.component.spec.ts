import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NhlPlayerDetailCardComponent } from './nhl-player-detail-card.component';

describe('NhlPlayerDetailCardComponent', () => {
  let component: NhlPlayerDetailCardComponent;
  let fixture: ComponentFixture<NhlPlayerDetailCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NhlPlayerDetailCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NhlPlayerDetailCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
