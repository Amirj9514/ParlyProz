import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AutoLogoutService {
  private timeoutInterval: any;
  private popupTimeout: any;
  private countdownInterval: any;
  private readonly TIMEOUT_MS = 2 * 60 * 1000; // 1 hour
  private readonly POPUP_TIME_MS = 1 * 60 * 1000; // 5 minutes before logout
  public showPopup = false;
  public countdown = 300; // 5 minutes countdown

  constructor(private router: Router, private ngZone: NgZone) {
    this.resetTimer();
    this.addEventListeners();
  }

  // Reset activity timer
  private resetTimer() {
    if (this.showPopup) return;
    if (this.timeoutInterval) {
      clearTimeout(this.timeoutInterval);
    }
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout);
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    // Start logout timer
    this.timeoutInterval = setTimeout(() => {
      this.logout();
    }, this.TIMEOUT_MS);

    // Show popup 5 minutes before logout
    this.popupTimeout = setTimeout(() => {
      this.showPopup = true;
      this.startCountdown();
    }, this.TIMEOUT_MS - this.POPUP_TIME_MS);
  }

  // Event listeners to detect user activity
  private addEventListeners() {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    if (!this.showPopup) {
      console.log('Adding event listeners...');
      
      events.forEach((event) => {
        window.addEventListener(event, () =>
          this.ngZone.run(() => this.resetTimer())
        );
      });
    }
  }

  // Start countdown in popup
  private startCountdown() {
    this.countdown = 60; // Reset to 5 minutes
    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        this.logout(); // Auto logout if no action
      }
    }, 1000);
  }

  // User chooses to stay
  public stayLoggedIn() {
    this.showPopup = false;
    this.resetTimer();
  }

  // Logout function
  public logout() {
    console.log('Logging out due to inactivity...');
    this.showPopup = false;
    localStorage.clear(); // Clear user data
    window.location.href = 'https://parlayproz.com/';
    // this.router.navigate(['/login']); // Redirect to login page
  }
}
