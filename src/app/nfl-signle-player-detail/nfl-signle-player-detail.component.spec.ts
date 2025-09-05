import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NflSignlePlayerDetailComponent } from './nfl-signle-player-detail.component';

describe('NflSignlePlayerDetailComponent', () => {
  let component: NflSignlePlayerDetailComponent;
  let fixture: ComponentFixture<NflSignlePlayerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NflSignlePlayerDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NflSignlePlayerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
