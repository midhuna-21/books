import {Books} from '../../interfaces/data'

const rentBookValidation = (data:Books) => {
   if (!data.bookTitle) return 'Book title is required.';
   if (!data.description) return 'Description is required.';
   if (!data.author) return 'Author is required.';
   if (!data.publisher) return 'Publisher is required.';
   if(!data.publishedYear) return 'PublishedYear is required.'
   if (!data.genre) return 'Genre is required.';
   if (data.rentalFee === undefined) return 'Rental fee is required.';
   if (!data.images || data.images.length === 0) return 'At least one image is required.';
   return null;
};

export default rentBookValidation;
