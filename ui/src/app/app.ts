import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ToastComponent } from './shared/components/toast/toast.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ToastComponent, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('CineZone');
  isAuthPage$: Observable<boolean>;

  constructor(private router: Router) {
    this.isAuthPage$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => {
        const url = (event as NavigationEnd).url;
        return url === '/' || url === '/login' || url === '/signup';
      })
    );
  }
}
