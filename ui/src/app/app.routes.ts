import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { BrowseComponent } from './pages/browse/browse.component';
import { MovieDetailComponent } from './pages/movie-detail/movie-detail.component';
import { WatchComponent } from './pages/watch/watch.component';
import { WatchlistComponent } from './pages/watchlist/watchlist.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'browse', component: BrowseComponent, canActivate: [authGuard] },
  { path: 'movie/:id', component: MovieDetailComponent, canActivate: [authGuard] },
  { path: 'watch/:id', component: WatchComponent, canActivate: [authGuard] },
  { path: 'watchlist', component: WatchlistComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
