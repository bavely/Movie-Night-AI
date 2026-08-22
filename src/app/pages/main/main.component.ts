import {
  Component,
  HostListener,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { SearchbarComponent } from '../../component/common/searchbar/searchbar.component';
import { MainService } from './main.service';
import { MoviecontainerComponent } from '../../component/common/moviecontainer/moviecontainer.component';
import { DividerModule } from 'primeng/divider';
import { CategoryComponent } from '../../component/category/category.component';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { debounceTime, switchMap, takeUntil, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    SearchbarComponent,
    MoviecontainerComponent,
    DividerModule,
    CategoryComponent
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'] // ✅ fixed typo
})
export class MainComponent implements OnInit, OnDestroy {
  popularMovies: any[] = [];
  topRatedMovies: any[] = [];
  upcomingMovies: any[] = [];

  imagBaseUrl = 'https://image.tmdb.org/t/p/w500';
  page = 1;
  totalPages = 0;
  category: string = '';
  discoverMore = false;
  loading = true;
  error = false;

  private scrollSubject = new BehaviorSubject<number>(this.page);
  private destroy$ = new Subject<void>();

  constructor(
    private mainService: MainService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadData();

    this.scrollSubject
      .pipe(
        debounceTime(300),
        switchMap((page) => {
          this.loading = true;
          let req;
          if (this.category === 'popular') {
            req = this.mainService.getPopularData(page);
          } else if (this.category === 'top_rated') {
            req = this.mainService.getTopRatedData(page);
          } else {
            req = this.mainService.getUpcomingData(page);
          }
          return req.pipe(
            catchError(() => {
              this.loading = false;
              this.error = true;
              return of({ results: [], total_pages: 0 });
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((newData: { results: any[]; total_pages: number }) => {
        if (newData.results.length > 0) this.error = false;
        this.totalPages = newData.total_pages;

        if (this.category === 'popular') {
          this.popularMovies = [...this.popularMovies, ...newData.results];
        } else if (this.category === 'top_rated') {
          this.topRatedMovies = [...this.topRatedMovies, ...newData.results];
        } else if (this.category === 'upcoming') {
          this.upcomingMovies = [...this.upcomingMovies, ...newData.results];
        }

        this.loading = false;
        setTimeout(() => this.checkAndLoadMore(), 200);
      });

    this.fetchInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchInitialData(): void {
    this.mainService.getPopularData(1).subscribe({
      next: (data) => { this.popularMovies = data.results.slice(0, 8); },
      error: () => { this.error = true; this.loading = false; }
    });

    this.mainService.getTopRatedData(1).subscribe({
      next: (data) => { this.topRatedMovies = data.results.slice(0, 8); },
      error: () => { this.error = true; this.loading = false; }
    });

    this.mainService.getUpcomingData(1).subscribe({
      next: (data) => { this.upcomingMovies = data.results.slice(0, 8); },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  retryInitial(): void {
    this.error = false;
    this.loading = true;
    this.popularMovies = [];
    this.topRatedMovies = [];
    this.upcomingMovies = [];
    this.fetchInitialData();
  }

  getMoreMovies(cat: string): void {
    this.popularMovies = [];
    this.topRatedMovies = [];
    this.upcomingMovies = [];
    this.discoverMore = true;
    this.category = cat;
    this.page = 1;
    this.loadData();
    this.location.replaceState('/' + cat);
  }

  goBackEvent(): void {
    this.discoverMore = false;
    this.page = 1;
    this.fetchInitialData();
  }

  private loadData(): void {
    this.scrollSubject.next(this.page);
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const pos =
      (document.documentElement.scrollTop || document.body.scrollTop) +
      window.innerHeight;
    const max =
      document.documentElement.scrollHeight || document.body.scrollHeight;

    if (
      pos > max - 100 &&
      !this.loading &&
      this.discoverMore &&
      this.page < this.totalPages
    ) {
      this.loading = true;
      setTimeout(() => {
        this.page++;
        this.scrollSubject.next(this.page);
      }, 500);
    }
  }

  private checkAndLoadMore(): void {
    const contentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;

    if (
      contentHeight <= windowHeight &&
      this.page < this.totalPages &&
      this.discoverMore &&
      !this.loading
    ) {
      this.page++;
      this.scrollSubject.next(this.page);
    }
  }
}
