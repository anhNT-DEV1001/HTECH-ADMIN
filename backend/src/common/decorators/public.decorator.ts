import { SetMetadata } from '@nestjs/common';

/**
 * @author Nguyen Tuan Anh
 * @sumary Public route
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
