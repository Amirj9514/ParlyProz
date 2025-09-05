import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NflPlayerDetailCardComponent } from './nfl-player-detail-card.component';

describe('NflPlayerDetailCardComponent', () => {
  let component: NflPlayerDetailCardComponent;
  let fixture: ComponentFixture<NflPlayerDetailCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NflPlayerDetailCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NflPlayerDetailCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
