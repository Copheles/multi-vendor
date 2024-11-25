import { Cart, CartItem, Product } from '@prisma/client';
import { prisma } from '~/prisma';
import { productService } from './product.service';
import { NotFoundException } from '~/globals/middleware/error.middleware';
import { userService } from './user.service';
import { Helper } from '~/globals/helpers/helper';
import { ICartBody } from '~/features/cart/interface/cart.interface';

class CartService {
  public async add(requestBody: ICartBody, currentUser: UserPayload) {
    const { productId, variant, quantity } = requestBody;

    const product: Product | null = await productService.getProduct(productId);

    if (!product) {
      throw new NotFoundException(`Product with ID:${productId} not found`);
    }

    // if user already has a cart, don't create new cart
    const user: any | null = await userService.get(currentUser.id, { cart: true });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    let cart: any;

    if (user?.cart?.id) {
      const existingCart: Cart | null = await this.getCart(user.cart.id, { cartItems: true });
      if (!existingCart) {
        throw new NotFoundException(`Cart does not exist`);
      }
      cart = existingCart;
    } else {
      // 1) Create cart, totalPrice: 0
      cart = await prisma.cart.create({
        data: {
          totalPrice: 0,
          userId: currentUser.id
        }
      });
    }

    // 2) Create cartItem

    const itemIndex: number | undefined = cart?.cartItems?.findIndex((item: any) => item.productId === productId);

    let cartItem: CartItem;
    if (itemIndex == undefined || itemIndex <= -1) {
      cartItem = await prisma.cartItem.create({
        data: {
          productId,
          variant,
          cartId: cart.id,
          price: product.price,
          quantity
        }
      });
    } else {
      const currentCartItem = await this.getCartItemByProduct(cart.id, productId);

      if (!currentCartItem) {
        throw new NotFoundException('Cart Item not found');
      }

      cartItem = await prisma.cartItem.update({
        where: { id: currentCartItem.id },
        data: {
          quantity: currentCartItem.quantity + (quantity || 1)
        }
      });
    }

    // 3) Calculate total price of cartItem, assign it to totalPrice of cart
    const currentCart: Cart | null = await this.getCart(cartItem.cartId);
    if (!currentCart) {
      throw new NotFoundException(`Cart does not exist`);
    }

    const totalPrice = currentCart.totalPrice + product.price * (quantity || 1);

    const updatedCart = await prisma.cart.update({
      where: { id: currentCart.id },
      data: {
        totalPrice
      }
    });

    console.log(updatedCart);
  }

  public async clear(cartId: number, currentUser: UserPayload) {
    const cart: Cart | null = await this.getCart(cartId);

    if (!cart) {
      throw new NotFoundException(`Cart id:${cartId} not found!`);
    }

    Helper.checkPermit(cart, 'userId', currentUser);

    await prisma.cart.delete({
      where: {
        id: cartId
      }
    });
  }

  public async removeItem(cartItemId: number, currentUser: UserPayload) {
    const cartItem: any | null = await this.getCartItem(cartItemId, { cart: true });

    if (!cartItem) {
      throw new NotFoundException(`CartItem id:${cartItemId} not found`);
    }

    const cart: Cart = (await this.getCart(cartItem.cardId)) as Cart;

    const updatedCart = await prisma.cart.update({
      where: {
        id: cart.id
      },
      data: {
        totalPrice: cart.totalPrice - cartItem.price * cartItem.quantity
      }
    });

    console.log(updatedCart);

    Helper.checkPermit(cartItem.cart, 'userId', currentUser);
    await prisma.cartItem.delete({
      where: { id: cartItemId }
    });
  }

  public async get(currentUser: UserPayload) {
    const cart = await prisma.cart.findFirst({
      where: {
        userId: currentUser.id
      },
      include: {
        cartItems: {
          include: {
            product: true
          }
        }
      }
    });

    return this.returnCart(cart);
  }

  public async getMyCart(currentUser: UserPayload) {
    const cart = await prisma.cart.findFirst({
      where: {
        userId: currentUser.id
      },
      include: {
        cartItems: {
          include: {
            product: true
          }
        }
      }
    });

    return cart;
  }

  private async getCart(cartId: number, include = {}) {
    const cart: Cart | null = await prisma.cart.findFirst({
      where: {
        id: cartId
      },
      include
    });
    return cart;
  }

  private async getCartItem(cartItemId: number, include = {}) {
    const cartItem: CartItem | null = await prisma.cartItem.findFirst({
      where: { id: cartItemId },
      include
    });

    return cartItem;
  }

  private async getCartItemByProduct(cartId: number, productId: number) {
    const cartItem: CartItem | null = await prisma.cartItem.findFirst({
      where: { cartId, productId }
    });

    return cartItem;
  }

  private async returnCart(cart: any) {
    const cartItems = cart?.cartItems.map((item: any) => {
      return {
        ...item,
        productName: item.product.name,
        productImage: item.product.mainImage,
        product: undefined
      };
    });

    return {
      ...cart,
      cartItems
    };
  }
}

export const cartService: CartService = new CartService();
