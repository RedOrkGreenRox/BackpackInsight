import { BranchData } from '../../../../roots/StructuredBranch';

export class NotFoundData implements BranchData<void, void> {
  public async load(): Promise<void> {
    return Promise.resolve();
  }
}
