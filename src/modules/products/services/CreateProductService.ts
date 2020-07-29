import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('ProductsRepository')
    private productRepository: IProductsRepository,
  ) { }

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {

    const checkProduct = await this.productRepository.findByName(name)

    if (checkProduct) {
      throw new AppError('Name already in use!', 400)
    }

    const product = await this.productRepository.create({
      name, price, quantity
    })

    return product;

  }
}

export default CreateProductService;
