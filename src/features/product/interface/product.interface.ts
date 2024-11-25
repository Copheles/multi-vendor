import { Product } from '@prisma/client';

export interface IProductBody {
  name: string;
  longDescription: string;
  shortDescription: string;
  quantity: string;
  mainImage: string;
  categoryId: string;
  price: string;
}

export type ProductWithDetails = Product & {
  productImages: {
    id: number;
    image: string;
    productId: number;
  }[];
  productVariants: {
    id: number;
    name: string;
    productId: number;
    productVariantItems: {
      id: number;
      name: string;
      variantId: number;
    }[];
  }[];
};
