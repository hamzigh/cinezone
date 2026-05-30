import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Cookie-based auth: make sure API calls include cookies.
    if (req.url.startsWith('http://localhost:3000/api')) {
      req = req.clone({ withCredentials: true });
    }
    return next.handle(req);
  }
}
