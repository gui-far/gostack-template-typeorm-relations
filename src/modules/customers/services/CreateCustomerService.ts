import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomersRepository')
    private customerRepository: ICustomersRepository,
  ) { }

  public async execute({ name, email }: IRequest): Promise<Customer> {

    const checkCustomer = await this.customerRepository.findByEmail(email)

    if (checkCustomer) {
      throw new AppError('Email already in use!', 400)
    }

    const customer = await this.customerRepository.create({
      name,
      email,
    })

    return customer;

  }
}

export default CreateCustomerService;
