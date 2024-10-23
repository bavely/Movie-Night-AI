import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MoodService } from './mood.service';
import { type Image } from "./mood.interface";
import { BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { ListComponent } from "../../component/common/list/list.component";
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-mood',
  standalone: true,
  imports: [ListComponent, CarouselModule, ButtonModule, TagModule],
  providers: [MoodService],
  templateUrl: './mood.component.html',
  styleUrl: './mood.component.css'
})
export class MoodComponent {

  public imageList!: Image[];
  isImageLoaded = false;
  totalPages: number = 0
  responsiveOptions: any[] | undefined;
  onImageLoad() {
    this.isImageLoaded = true;
  }

  constructor(private router: Router, private moodserv: MoodService) {
    this.imageList = moodserv.getImages()
  }

  getMoodMovies(image: Image) {
    this.grenr = image.id;
    this.data = [];
    this.page = 1;
    this.loadData();
    localStorage.setItem('mood', this.grenr.toString());
  }
  goBack() {
    this.router.navigate(['/']);
  }

  data: any[] = [];
  page: number = 1;
  grenr: number = 0;
  private scrollSubject = new BehaviorSubject<number>(this.page);
  loading = true;
  imagBaseUrl = 'https://image.tmdb.org/t/p/w500';

  ngOnInit() {


    this.loadData();
    this.grenr = localStorage.getItem('mood') ? Number(localStorage.getItem('mood')) : 0;
    this.scrollSubject
      .pipe(
        debounceTime(300), // Prevent too many requests
        switchMap((page) => {
          this.loading = true;
          if (this.grenr > 0) {

            return this.moodserv.getData(page, this.grenr.toString());
          } else {
            return this.moodserv.getData(page, '');
          }

        })
      )
      .subscribe((newData: { results: [], total_pages: number }) => {
        this.totalPages = newData.total_pages;

          this.data = [...this.data, ...newData.results];


        console.log(this.data);
        this.loading = false;
      });

    this.responsiveOptions = [

      {
        breakpoint: '768px',
        numVisible: 1,
        numScroll: 1
      }

    ];

  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    console.log('scrolled');
    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
    const max = document.documentElement.scrollHeight || document.body.scrollHeight;

    if (pos > max - 500 && !this.loading) {
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
