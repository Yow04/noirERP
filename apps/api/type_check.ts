import { products } from './src/db/schema/products';
type Insert = typeof products.$inferInsert;
type HasCategoryId = 'categoryId' extends keyof Insert ? true : false;
const hasCategoryId: HasCategoryId = true;
