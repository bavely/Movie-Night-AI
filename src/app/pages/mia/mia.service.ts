import OpenAI from "openai";
import { RealtimeClient } from '@openai/realtime-api-beta';
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable , forkJoin} from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class MiaService {
  private baseUrl = 'https://api.themoviedb.org/3';
  private apiKey = import.meta.env['NG_APP_TMDB_API_KEY'];
  constructor (private http: HttpClient){}

  async openAiCall( prompt: string) {
    const openai = new OpenAI({
      apiKey:
        import.meta.env['NG_APP_OPEN_AI_KEY'],
      dangerouslyAllowBrowser: true
    }
    );
    // { role: "system", content: "You are a helpful assistant." },
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [

        {
          role: "user",
          content: prompt,
        },
      ],
    });

return completion.choices[0].message.content;
  }




  getData(keyword: string[]): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    });

    let requests = keyword.map(k => this.http.get(`${this.baseUrl}/search/movie?query=${k}&include_adult=true&language=en-US&page=1`, { headers }));
    return forkJoin(requests);  }

}
