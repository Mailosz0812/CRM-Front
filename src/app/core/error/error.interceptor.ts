import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {catchError, Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {ERROR_MESSAGES} from './error-codes';

@Injectable({providedIn: 'root'})
export class ErrorInterceptor implements HttpInterceptor{
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        let errMsg = ERROR_MESSAGES['GENERIC_ERROR']

        if(error.error && error.error.errCode){
          errMsg = ERROR_MESSAGES[error.error.errCode];
        }
        throw new Error(errMsg);
      })
    );
  }

}
