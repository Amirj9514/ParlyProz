import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NflPlayerTableComponent } from './nfl-player-table.component';

describe('NflPlayerTableComponent', () => {
  let component: NflPlayerTableComponent;
  let fixture: ComponentFixture<NflPlayerTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NflPlayerTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NflPlayerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
