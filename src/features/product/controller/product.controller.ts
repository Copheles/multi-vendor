import { Request, Response } from 'express';
import { HTTP_STATUS } from '~/globals/constants/http';
import { UtilConstant } from '~/globals/constants/utils';
import { productService } from '~/services/db/product.service';

class ProductController {
  public async create(req: Request, res: Response) {
    const product = await productService.add(req.body, req.currentUser, req.file);

    return res.status(HTTP_STATUS.CREATED).json({
      message: 'Created product',
      data: product
    });
  }

  public async read(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || UtilConstant.DEFAULT_PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || UtilConstant.DEFAULT_PAGE_SIZE;
    const sortBy = (req.query.sortBy as string) || UtilConstant.DEFAULT_SORT_BY;
    const sortDir = (req.query.sortDir as string) || UtilConstant.DEFAULT_SORT_DIR;
    const where: any = {};
    const filterBy = req.query.filterBy as string;
    const filterValueParams = req.query.filterValue as string;
    if (filterValueParams) {
      const [filterCondition, filterValue] = filterValueParams.split('.');

      const operations = ['lt', 'lte', 'gt', 'gte'];

      if (filterCondition === 'eq') {
        where[filterBy] = parseInt(filterValue);
      }

      operations.forEach((operation) => {
        if (filterCondition === operation) {
          where[filterBy] = {
            [filterCondition]: parseInt(filterValue)
          };
        }
      });
    }

    console.log(where);

    const products = await productService.getPagination(page, pageSize, sortBy, sortDir, where);
    return res.status(HTTP_STATUS.OK).json({
      message: 'Get all products',
      totalCount: products.length,
      data: products
    });
  }

  public async readOne(req: Request, res: Response) {
    const product = await productService.getOne(parseInt(req.params.id));
    return res.status(HTTP_STATUS.OK).json({
      message: 'Get product',
      data: product
    });
  }

  public async update(req: Request, res: Response) {
    const product = await productService.edit(parseInt(req.params.id), req.body, req.currentUser);

    return res.status(HTTP_STATUS.OK).json({
      message: 'Update product',
      data: product
    });
  }

  public async delete(req: Request, res: Response) {
    await productService.remove(parseInt(req.params.id), req.currentUser);

    return res.status(HTTP_STATUS.OK).json({
      message: 'Delete product'
    });
  }

  public async readMyProducts(req: Request, res: Response) {
    const products = await productService.getMyProducts(req.currentUser);

    return res.status(HTTP_STATUS.OK).json({
      message: 'Get my products',
      data: products
    });
  }
}

export const productController: ProductController = new ProductController();
