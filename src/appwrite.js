import { Account, Client, Databases, ID, Query } from 'appwrite'

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const REVIEWS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_REVIEWS_COLLECTION_ID;
const isAppwriteConfigured = Boolean(PROJECT_ID && DATABASE_ID && COLLECTION_ID);
export const isAuthConfigured = Boolean(PROJECT_ID);
export const isReviewServiceConfigured = Boolean(PROJECT_ID && DATABASE_ID && REVIEWS_COLLECTION_ID);

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')

if (PROJECT_ID) {
  client.setProject(PROJECT_ID);
}

const database = new Databases(client);
const account = new Account(client);

const normalizeReview = (document) => ({
 id: document.$id,
 titleKey: document.titleKey,
 rating: document.rating,
 author: document.authorName || 'Anonymous',
 text: document.reviewText,
 createdAt: document.$createdAt,
 userId: document.userId,
})

export const getCurrentUser = async () => {
 if(!isAuthConfigured) {
  return null;
 }

 try {
  return await account.get();
 } catch {
  return null;
 }
}

export const createUserAccount = async ({ name, email, password }) => {
 if(!isAuthConfigured) {
  throw new Error('Appwrite project is not configured.');
 }

 await account.create(ID.unique(), email, password, name);
 await account.createEmailPasswordSession(email, password);

 return account.get();
}

export const signInUser = async ({ email, password }) => {
 if(!isAuthConfigured) {
  throw new Error('Appwrite project is not configured.');
 }

 await account.createEmailPasswordSession(email, password);

 return account.get();
}

export const signOutUser = async () => {
 if(!isAuthConfigured) {
  return;
 }

 await account.deleteSession('current');
}

export const updateSearchCount = async (searchTerm, movie) => {
 if(!isAppwriteConfigured || !movie) {
  return;
 }

 try {
  const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
    Query.equal('searchTerm', searchTerm),
  ])

  if(result.documents.length > 0) {
   const doc = result.documents[0];

   await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
    count: doc.count + 1,
   })
  } else {
   await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
    searchTerm,
    count: 1,
    movie_id: movie.id,
    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
   })
  }
 } catch (error) {
  console.error(error);
 }
}

export const getTrendingMovies = async () => {
 if(!isAppwriteConfigured) {
  return [];
 }

 try {
  const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
    Query.limit(5),
    Query.orderDesc("count")
  ])

  return result.documents;
 } catch (error) {
  console.error(error);
  return [];
 }
}

export const getReviewsForTitles = async (titleKeys) => {
 if(!isReviewServiceConfigured || titleKeys.length === 0) {
  return {};
 }

 try {
  const uniqueTitleKeys = [...new Set(titleKeys)];
  const result = await database.listDocuments(DATABASE_ID, REVIEWS_COLLECTION_ID, [
    Query.equal('titleKey', uniqueTitleKeys),
    Query.limit(500),
  ])

  return result.documents.reduce((reviewsByTitle, document) => {
   const review = normalizeReview(document);

   return {
    ...reviewsByTitle,
    [review.titleKey]: [...(reviewsByTitle[review.titleKey] || []), review],
   }
  }, {});
 } catch (error) {
  console.error(error);
  return {};
 }
}

export const getReviewsForTitle = async (titleKey) => {
 if(!isReviewServiceConfigured) {
  return [];
 }

 try {
  const result = await database.listDocuments(DATABASE_ID, REVIEWS_COLLECTION_ID, [
    Query.equal('titleKey', titleKey),
    Query.limit(100),
  ])

  return result.documents
   .map(normalizeReview)
   .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
 } catch (error) {
  console.error(error);
  return [];
 }
}

export const createReview = async ({ item, contentType, rating, text }, user) => {
 if(!isReviewServiceConfigured) {
  throw new Error('Appwrite reviews collection is not configured.');
 }

 if(!user) {
  throw new Error('Sign in to write a review.');
 }

 const title = item.title || item.name || 'Untitled';
 const titleKey = `${contentType}-${item.id}`;

 const document = await database.createDocument(DATABASE_ID, REVIEWS_COLLECTION_ID, ID.unique(), {
  titleKey,
  contentType,
  tmdbId: item.id,
  title,
  posterPath: item.poster_path || '',
  rating,
  reviewText: text,
  authorName: user.name || user.email || 'Anonymous',
  userId: user.$id,
  userEmail: user.email || '',
 })

 return normalizeReview(document);
}
