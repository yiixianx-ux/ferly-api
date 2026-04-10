export const CONFIG = {
  proxy: {
    defaultReferer: 'https://hstream.moe/',
    referers: [
      { host: 'hstream.moe', referer: 'https://hstream.moe/' },
      { host: 'oppai.stream', referer: 'https://oppai.stream/' },
      { host: 'muchohentai.com', referer: 'https://muchohentai.com/' },
      { host: 'haho.moe', referer: 'https://haho.moe/' },
    ],
  },
  scrapers: {
    hstream: {
      baseUrl: 'https://hstream.moe',
    },
    oppai: {
      baseUrl: 'https://oppai.stream',
    },
    haho: {
      baseUrl: 'https://haho.moe',
    },
  },
};
