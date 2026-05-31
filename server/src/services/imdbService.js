const { DataExchangeClient, SendApiAssetCommand } = require('@aws-sdk/client-dataexchange');
const env = require('../config/env');

function isConfigured() {
  return Boolean(
    env.imdb.apiKey &&
    env.imdb.dataSetId &&
    env.imdb.revisionId &&
    env.imdb.assetId
  );
}

function client() {
  return new DataExchangeClient({ region: env.imdb.region });
}

async function sendGraphql(query) {
  if (!isConfigured()) {
    return null;
  }

  const command = new SendApiAssetCommand({
    DataSetId: env.imdb.dataSetId,
    RevisionId: env.imdb.revisionId,
    AssetId: env.imdb.assetId,
    Method: 'POST',
    Path: '/v1',
    Body: JSON.stringify({ query }),
    RequestHeaders: {
      'x-api-key': env.imdb.apiKey,
      'content-type': 'application/json'
    }
  });

  const response = await client().send(command);
  const body = await response.Body.transformToString();
  return JSON.parse(body);
}

function mapTitle(title) {
  if (!title) return null;

  const image = title.primaryImage?.url || '';
  const genres = title.genres?.genres || [];
  const cast = title.credits?.edges || [];
  const tvTypes = ['tvSeries', 'tvMiniSeries'];
  const type = tvTypes.includes(title.titleType?.id) ? 'tv' : 'movie';

  return {
    id: title.id,
    title: title.titleText?.text || title.originalTitleText?.text || 'Untitled',
    year: title.releaseYear?.year || 0,
    genre: genres.map((genre) => genre.text).filter(Boolean).join(', ') || 'Movie',
    rating: title.ratingsSummary?.aggregateRating || 0,
    posterUrl: image,
    backdropUrl: image,
    description: title.plot?.plotText?.plainText || 'No description available.',
    cast: cast
      .map((edge) => edge.node?.name?.nameText?.text)
      .filter(Boolean)
      .slice(0, 8),
    type
  };
}

async function searchMovies(search, genre) {
  if (!isConfigured() || !search) return null;

  const safeSearch = JSON.stringify(search);
  const genreConstraint = genre
    ? `genreConstraint: { allGenreIds: [${JSON.stringify(genre)}] }`
    : '';

  const query = `
    query {
      mainSearch(first: 48, options: {
        searchTerm: ${safeSearch},
        isExactMatch: false,
        type: TITLE
      }) {
        edges {
          node {
            entity {
              ... on Title {
                id
                titleType { id }
                titleText { text }
                originalTitleText { text }
                releaseYear { year }
                primaryImage { url }
                ratingsSummary { aggregateRating }
                genres { genres { text } }
                plot { plotText { plainText } }
                credits(first: 8) {
                  edges { node { name { nameText { text } } } }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await sendGraphql(query);
  const movies = response?.data?.mainSearch?.edges
    ?.map((edge) => mapTitle(edge.node?.entity))
    ?.filter(Boolean) || [];

  if (!genreConstraint || !genre) {
    return movies;
  }

  return movies.filter((movie) => movie.genre.toLowerCase().includes(genre.toLowerCase()));
}

async function getMovie(id) {
  if (!isConfigured()) return null;

  const query = `
    query {
      title(id: ${JSON.stringify(id)}) {
        id
        titleType { id }
        titleText { text }
        originalTitleText { text }
        releaseYear { year }
        primaryImage { url }
        ratingsSummary { aggregateRating }
        genres { genres { text } }
        plot { plotText { plainText } }
        credits(first: 8) {
          edges { node { name { nameText { text } } } }
        }
      }
    }
  `;

  const response = await sendGraphql(query);
  return mapTitle(response?.data?.title);
}

module.exports = {
  isConfigured,
  searchMovies,
  getMovie
};
