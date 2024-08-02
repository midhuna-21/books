import {Books} from '../../interfaces/data'

const sellBookValidation = (bookSelldata:Books) => {
   if (!bookSelldata.bookTitle) return 'Book title is required.';
   if (!bookSelldata.description) return 'Description is required.';
   if (!bookSelldata.author) return 'Author is required.';
   if (!bookSelldata.publisher) return 'Publisher is required.';
   if(!bookSelldata.publishedYear)return 'publishedYear is required.';
   if (!bookSelldata.genre) return 'Genre is required.';
   if (bookSelldata.price === undefined) return 'Price is required.';
   if (!bookSelldata.images || bookSelldata.images.length === 0) return 'At least one image is required.';
   return null;
};

export default sellBookValidation;
