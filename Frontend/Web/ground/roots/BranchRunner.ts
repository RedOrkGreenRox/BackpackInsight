import { Branch, PageMeta } from './Branch';
import { Gen } from './Gen';
import { BranchSpec } from './BranchSpec';
import { BranchContext, BranchLogic, StructuredBranch } from './StructuredBranch';

export class BranchRunner {
  constructor(private readonly spec: BranchSpec<any, any>) {}

  register(router: Gen): void {
    const BranchClass = this.createBranchClass();
    this.spec.routes.forEach(route => {
      router.register(route, () => Promise.resolve(BranchClass));
    });
  }

  private createBranchClass(): new () => Branch {
    const spec = this.spec;

    return class extends StructuredBranch<any, any> {
      protected override pageClass = spec.styles?.pageClass ?? spec.id;
      protected override bodyClass = spec.styles?.bodyClass;
      protected override display = spec.display;
      protected override data = spec.data;
      protected override state = spec.state;
      protected override meta: PageMeta | ((input?: any) => PageMeta) =
        spec.meta && typeof spec.meta === 'function'
          ? spec.meta
          : (spec.meta ?? { title: 'Backpack Insight', description: '' });

      protected override createLogic(context: any, root: HTMLElement): BranchLogic<any>[] {
        const ctx: BranchContext<any, any> = { input: this.getLastInput(), context };
        const logic = typeof spec.logic === 'function' ? spec.logic(ctx, root) : spec.logic;
        return logic;
      }
    } as new () => Branch;
  }
}
