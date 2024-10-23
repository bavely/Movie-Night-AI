import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { SearchbarComponent } from '../../component/common/searchbar/searchbar.component';
import { MainService } from './main.service';
import { MoviecontainerComponent } from '../../component/common/moviecontainer/moviecontainer.component';
import { DividerModule } from 'primeng/divider';
import { CategoryComponent } from '../../component/category/category.component';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [SearchbarComponent, MoviecontainerComponent, DividerModule, CategoryComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {

  popularMovies: any[] = []
  topRatedMovies: any[] = []
  upcomingMovies: any[] = []
  imagBaseUrl = 'https://image.tmdb.org/t/p/w500';
  page = 1
  discoverMore: boolean = false
  category: string = ""
  loading: boolean = true
  totalPages: number = 0
  constructor(private mainService: MainService, private router: Router, private location: Location) {

  }

  fetchInitialData() {
    this.mainService.getPopularData(1).subscribe((data) => {
      this.popularMovies = data.results.slice(0, 8)
    })

    this.mainService.getTopRatedData(1).subscribe((data) => {
      this.topRatedMovies = data.results.slice(0, 8)
    })

    this.mainService.getUpcomingData(1).subscribe((data) => {
      this.upcomingMovies = data.results.slice(0, 8)
    })
  }

  ngOnInit() {

    this.loadData();

      console.log(this.discoverMore, this.category, this.page)


      this.scrollSubject
        .pipe(
          debounceTime(300), // Prevent too many requests
          switchMap((page) => {
            this.loading = true;

            if (this.category === "popular") {
              return this.mainService.getPopularData(page)
            } else if (this.category === "top_rated") {
              return this.mainService.getTopRatedData(page)
            } else {
              return this.mainService.getUpcomingData(page)
            }

          })
        )
        .subscribe((newData: { results: [], total_pages: number }) => {

          this.totalPages = newData.total_pages;
            if (this.category === "popular") {
              this.popularMovies = [...this.popularMovies, ...newData.results];

            } else if (this.category === "top_rated") {
              this.topRatedMovies = [...this.topRatedMovies, ...newData.results];
            } else if (this.category === "upcoming") {
              this.upcomingMovies = [...this.upcomingMovies, ...newData.results];
            }

          this.loading = false;
        })

        this.fetchInitialData()
  }

  getMoreMovies(cat: string) {
   this.popularMovies = []
    this.topRatedMovies = []
    this.upcomingMovies = []
    this.discoverMore = true
    this.category = cat
    this.loadData();
    this.location.replaceState('/' + cat);
  }

  goBackEvent() {
    this.discoverMore = false
    this.page = 1
    this.fetchInitialData()

  }

  private scrollSubject = new BehaviorSubject<number>(this.page);




  @HostListener('window:scroll', [])
  onScroll(): void {
    console.log('scrolled');
    console.log(this.discoverMore)
    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
    const max = document.documentElement.scrollHeight || document.body.scrollHeight;

    if (pos > max - 100 && !this.loading && this.discoverMore) {
      if (this.page >= this.totalPages) {
        return;
      }
      this.page++;
      this.scrollSubject.next(this.page);
    }
  }

  private loadData(): void {
    this.loading = true;
    setTimeout(() => {
      this.scrollSubject.next(this.page);
    }, 1500);

  }

}
