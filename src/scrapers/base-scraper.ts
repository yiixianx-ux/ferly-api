import {
  VideoBaseDto,
  VideoDetailDto,
  StreamInfoDto,
} from '../videos/dto/video.dto.js';

export abstract class BaseScraper {
  abstract readonly siteId: string;
  abstract readonly baseUrl: string;

  abstract search(query: string, page?: number): Promise<VideoBaseDto[]>;
  abstract getDetails(slug: string): Promise<VideoDetailDto>;
  abstract getLatest(page?: number): Promise<VideoBaseDto[]>;
  abstract getStreamLink(slug: string): Promise<StreamInfoDto>;

  // Optional: override jika site punya genre khusus
  getGenres(): Promise<string[]> {
    return Promise.resolve([]);
  }

  getByGenre(_genre: string, _page?: number): Promise<VideoBaseDto[]> {
    return Promise.resolve([]);
  }
}
