import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';

interface MiaAgentResponse {
  outputText: string;
}

interface TmdbSearchResponse {
  results: any[];
}

@Injectable({
  providedIn: 'root'
})

export class MiaService {

  private baseUrl = 'https://api.themoviedb.org/3';
  constructor (private http: HttpClient){}

  async openAiCall(prompt: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.post<MiaAgentResponse>('/api/mia', { prompt })
      );

      return response.outputText ?? '';
    } catch (error) {
      throw new Error(this.getMiaErrorMessage(error));
    }
  }

  private getMiaErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      if (typeof error.error?.details === 'string' && error.error.details.trim()) {
        return error.error.details;
      }

      if (typeof error.error?.error === 'string' && error.error.error.trim()) {
        return error.error.error;
      }
    }

    return "Sorry, I couldn't get a response from MIA right now.";
  }


  getSuggestedMovies(titles: string[]): Observable<any[]> {
    const uniqueTitles = [...new Set(titles.map(title => title.trim()).filter(Boolean))].slice(0, 8);

    if (!uniqueTitles.length) {
      return of([]);
    }

    const requests = uniqueTitles.map(title =>
      this.http.get<TmdbSearchResponse>(
        `${this.baseUrl}/search/movie?query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1`
      ).pipe(
        map(response => response.results?.[0] ?? null),
        catchError(error => {
          console.error(`Movie lookup failed for "${title}"`, error);
          return of(null);
        })
      )
    );

    return forkJoin(requests).pipe(
      map(movies => movies.filter(Boolean))
    );
  }
}
