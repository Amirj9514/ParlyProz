import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  sharedData = new BehaviorSubject({});

  constructor(private httpClient: HttpClient, private router: Router) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage: any = '';
    if (error.status === 400) {
      errorMessage = 'Bad Request (400)';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized (401)';
      window.location.href = 'https://parlayproz.com/';
    } else {
      errorMessage = `Error: ${error.message}`;
    }
    return of({
      success: false,
      error: errorMessage,
      status: error.status,
    });
  }

  private getToken() {
    let localStorageData = JSON.parse(
      localStorage.getItem('sharedData@parlayProz') || '{}'
    );
    if (localStorageData && localStorageData.token) {
      return localStorageData.token ?? null;
    }
    return null;
  }

  /** to get data this.sharedService.getData().subscribe((data: any) => {}) **/
  public getData() {
    let storedData = localStorage.getItem('sharedData@parlayProz');
    this.sharedData.next(JSON.parse(storedData || '{}'));
    return this.sharedData.asObservable();
  }

  /** to insert data this.sharedService.insertData({ key: 'name', val: response.data }) **/
  public insertData(data: any) {
    this.sharedData.next({
      ...this.sharedData.getValue(),
      [data.key]: data.val,
    });
    localStorage.setItem(
      'sharedData@parlayProz',
      JSON.stringify(this.sharedData.value)
    );
  }

  /** Get Request with auth Token **/
  public sendGetRequest(target: string, jwtToken?: string): Observable<any> {
    if (!jwtToken) {
      jwtToken = this.getToken();
    }

    console.log(jwtToken);

    const headers_object = new HttpHeaders({
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    });

    const httpOptions = {
      headers: headers_object,
    };
    return this.httpClient
      .get<any>(environment.apiUrl + target, httpOptions)
      .pipe(catchError((error) => this.handleError(error)));
  }

  /** Post Request with token auth **/
  public sendPostRequest(target: string, data: any): Observable<any> {
    let token = this.getToken();
    const headers_object = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const httpOptions = {
      headers: headers_object,
    };
    return this.httpClient
      .post<any>(environment.apiUrl + target, data, httpOptions)
      .pipe(catchError((error) => this.handleError(error)));
  }
}
