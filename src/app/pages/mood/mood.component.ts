import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { MoodService } from './mood.service';
import { type Image } from './mood.interface';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { ListComponent } from '../../component/common/list/list.component';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-mood',
  standalone: true,
  imports: [ListComponent, CarouselModule, ButtonModule, TagModule],
  providers: [MoodService],
  templateUrl: './mood.component.html',
  styleUrls: ['./mood.component.css'] // ✅ fixed typo
})
export class MoodComponent implements OnInit, OnDestroy {
  public imageList: Image[] = [];
  public isImageLoaded = false;

  public totalPages = 0;
  public totalResults = 0;
  public data: any[] = [];
  public page = 1;
  public grenr = 53;
  public grenrName = '';
  public loading = true;
  public imagBaseUrl = 'https://image.tmdb.org/t/p/w500';

  public responsiveOptions = [
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  private scrollSubject = new BehaviorSubject<number>(this.page);
  private destroy$ = new Subject<void>();

  constructor(private router: Router, private moodserv: MoodService) {
    this.imageList = moodserv.getImages();

  }

  ngOnInit(): void {
    const stored = localStorage.getItem('mood');
    this.grenr = stored ? parseInt(stored) : this.grenr;
    this.grenrName = this.imageList.find(image => image.id === this.grenr)?.name || '';
    this.loadData();

    this.scrollSubject
      .pipe(
        debounceTime(300),
        switchMap((page) => {
          this.loading = true;
          return this.moodserv.getData(page, this.grenr.toString());
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((newData: { results: any[]; total_pages: number, total_results: number }) => {
        this.totalPages = newData.total_pages;
        this.totalResults = newData.total_results;
        this.data = [...this.data, ...newData.results];
        this.loading = false;

        // Auto-load more if content is short
        setTimeout(() => this.checkAndLoadMore(), 200);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onImageLoad(): void {
    this.isImageLoaded = true;
  }

  getMoodMovies(image: Image): void {
    this.grenr = image.id;
    this.grenrName = image.name;
    this.data = [];
    this.page = 1;
    this.loadData();
    localStorage.setItem('mood', this.grenr.toString());
  }

  goBack(): void {
    this.router.navigate(['/']);
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

    if (pos > max - 100 && !this.loading && this.page < this.totalPages) {
      this.loading = true;
      setTimeout(() => {
        this.page++;
        this.scrollSubject.next(this.page);
      }, 1300);
    }
  }

  private checkAndLoadMore(): void {
    const contentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;

    if (
      contentHeight <= windowHeight &&
      this.page < this.totalPages &&
      !this.loading
    ) {
      this.page++;
      this.scrollSubject.next(this.page);
    }
  }
}
