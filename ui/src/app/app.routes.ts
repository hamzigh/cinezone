import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { BrowseComponent } from './pages/browse/browse.component';
import { MovieDetailComponent } from './pages/movie-detail/movie-detail.component';
import { WatchComponent } from './pages/watch/watch.component';
import { WatchlistComponent } from './pages/watchlist/watchlist.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CollectionsComponent } from './pages/collections/collections.component';
import { CollectionDetailComponent } from './pages/collection-detail/collection-detail.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [guestGuard] },
  { path: 'browse', component: BrowseComponent, canActivate: [authGuard] },
  { path: 'movie/:id', component: MovieDetailComponent, canActivate: [authGuard] },
  { path: 'watch/:id', component: WatchComponent, canActivate: [authGuard] },
  { path: 'watchlist', component: WatchlistComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'collections', component: CollectionsComponent, canActivate: [authGuard] },
  { path: 'collections/:id', component: CollectionDetailComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
