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
  private openaiKey = import.meta.env['NG_APP_OPEN_AI_KEY'];
  private apiKey = import.meta.env['NG_APP_TMDB_API_KEY'];

  constructor (private http: HttpClient){}

  async openAiCall( prompt: string) {
    const openai = new OpenAI({
      apiKey: this.openaiKey,
      dangerouslyAllowBrowser: true
    }
    );
    // { role: "system", content: "You are a helpful assistant." },
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
             content: `You are a movie recommendation bot. Based on the user's prompt, recommend 3 movie titles in an array format like:
{
  "movies": ["Movie Title 1", "Movie Title 2", "Movie Title 3"],
  "fullResponse": "Here are some movies you might like: Movie Title 1, Movie Title 2, Movie Title 3. You can ask for more details about any of these movies."
}`
        },
        {
          role: "user",
          content: prompt,
        },
      ]
    });

return completion.choices[0].message.content;
  }




  getData(keyword: string[]): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    });

    let requests = keyword.map(k => this.http.get(`${this.baseUrl}/search/movie?query=${k}&include_adult=false&language=en-US&page=1`, { headers }));
    return forkJoin(requests);  }

}
