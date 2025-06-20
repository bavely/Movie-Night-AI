import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { Router } from '@angular/router';
import { ListComponent } from '../../component/common/list/list.component';
import { AdvancedService } from './advanced.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-advanced',
  standalone: true,
  imports: [ListComponent, FormsModule],
  templateUrl: './advanced.component.html',
  styleUrls: ['./advanced.component.css'] // ✅ Fixed here
})
export class AdvancedComponent implements OnInit, OnDestroy {
  public wasInside = false;
  public width = '50%';

  totalPages = 0;
  totalResults = 0;
  data: any[] = [];
  page = 1;
  keyword = '';
  inputs = '';
  loading = true;

  private scrollSubject = new BehaviorSubject<number>(this.page);
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private advancedserv: AdvancedService
  ) {}

  ngOnInit(): void {
    this.keyword = this.inputs ? this.inputs : localStorage.getItem('keyword') ?? '';
    this.loadData();

    this.scrollSubject
      .pipe(
        debounceTime(300),
        switchMap((page) => {
          this.loading = true;
          return this.advancedserv.getData(page, this.keyword);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((newData: { results: any[]; total_pages: number; total_results: number }) => {
        console.log(newData);
        this.totalResults = newData.total_results;
        this.totalPages = newData.total_pages;
        this.data = [...this.data, ...newData.results];
        this.loading = false;

        // Ensure loading more if viewport is larger than content
        setTimeout(() => this.checkAndLoadMore(), 200);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  transition(): void {
    gsap.to('#formContainer', {
      width: this.wasInside ? '100%' : '50%',
      duration: 1,
      ease: 'elastic.out(1, 0.3)',
    });
  }

  clickInside(): void {
    this.wasInside = true;
    this.transition();
  }

  clickOutside(): void {
    this.wasInside = false;
    this.transition();
  }

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement: any): void {
    const isClickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!isClickedInside) {
      this.clickOutside();
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
    const max = document.documentElement.scrollHeight || document.body.scrollHeight;

    if (pos > max - 100 && !this.loading && this.page < this.totalPages) {
      this.loading = true;
      setTimeout(() => {
        this.page++;
        this.scrollSubject.next(this.page);
      }, 1300);
    }
  }

  private loadData(): void {
    this.scrollSubject.next(this.page);
  }

  search(): void {
    this.keyword = this.inputs;
    this.data = [];
    this.page = 1;
    this.loadData();
    localStorage.setItem('keyword', this.keyword);
  }

  // ✅ Ensures content fills the viewport even on larger screens
  private checkAndLoadMore(): void {
    const contentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;

    if (contentHeight <= windowHeight && this.page < this.totalPages && !this.loading) {
      this.page++;
      this.scrollSubject.next(this.page);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
