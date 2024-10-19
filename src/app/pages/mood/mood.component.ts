import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MoodService } from './mood.service';
import { type Image } from "./mood.interface";
import { BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import {ListComponent} from "../../component/common/list/list.component";
@Component({
  selector: 'app-mood',
  standalone: true,
  imports: [ListComponent],
  templateUrl: './mood.component.html',
  styleUrl: './mood.component.css'
})
export class MoodComponent {

  public imageList!: Image[];
  isImageLoaded = false;

  onImageLoad() {
    this.isImageLoaded = true;
  }

  constructor(private router: Router, private moodserv:MoodService ) {
    this.imageList = moodserv.getImages();
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
  loading = false;
  imagBaseUrl = 'https://image.tmdb.org/t/p/w500';

  ngOnInit() {
    this.loadData();
this.grenr = localStorage.getItem('mood') ? Number(localStorage.getItem('mood')) : 0;
    this.scrollSubject
      .pipe(
        debounceTime(1000), // Prevent too many requests
        switchMap((page) => {
          this.loading = true;
if (this.grenr > 0) {

  return this.moodserv.getData(page, this.grenr.toString());
}else{
  return this.moodserv.getData(page, '');
}

        })
      )
      .subscribe((newData : {results: []}) => {
        this.data = [...this.data, ...newData.results];
        console.log(this.data);
        this.loading = false;
      });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    console.log('scrolled');
    // if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !this.loading) {
    //   this.page++;
    //   this.scrollSubject.next(this.page);
    // }

    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
    const max = document.documentElement.scrollHeight || document.body.scrollHeight;

    if (pos > max - 100 && !this.loading) {
         this.page++;
      this.scrollSubject.next(this.page);
    }
  }

  private loadData(): void {
    this.scrollSubject.next(this.page);
  }


}
