import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
  price: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(

    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) { }

  public async execute({ customer_id, products }: IRequest): Promise<Order> {

    const customer = await this.customersRepository.findById(customer_id)

    if (!customer) {
      throw new AppError('Customer not found!', 400)
    }

    //let orderProducts: IProduct[] = [];

    const findProducts = await this.productsRepository.findAllById(
      products.map(product => ({ id: product.id })),
    );

    if (products.length !== findProducts.length) {
      throw new AppError('Product not found');
    }

    //Procura o item do array da request...
    products.forEach(product => {

      //...entre dos itens encontrados no banco
      const findProductInDatabaseArray = findProducts.find(({ id }) => id === product.id,);

      if (!findProductInDatabaseArray) {
        throw new AppError('Product not found');
      }

      if (findProductInDatabaseArray.quantity < product.quantity) {
        throw new AppError('Quantity is not enough');
      }
    });

    //Monta o array com objetos no formato necessário
    const orderProducts = products.map(product => {

      const actualProduct = findProducts.find(({ id }) => id === product.id)

      if(!actualProduct) {
        throw new AppError('Could not find product');
      }

      return {
        product_id: product.id,
        quantity: product.quantity,
        price: actualProduct.price,
      }
    })

    const order = await this.ordersRepository.create({ customer, products: orderProducts })

    await this.productsRepository.updateQuantity(products);

    return order

  }
}

export default CreateOrderService;
