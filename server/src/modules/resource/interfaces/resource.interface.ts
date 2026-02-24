import { IPaginationRequest } from 'src/common/interfaces';

export interface IResourceQuery extends IPaginationRequest {
  is_active?: 'all' | 'true' | 'false';
}
