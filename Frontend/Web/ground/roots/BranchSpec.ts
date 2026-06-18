import { PageMeta } from './Branch';
import { BranchContext, BranchData, BranchDisplay, BranchLogic, BranchState } from './StructuredBranch';

export interface BranchSpec<TInput = any, TContext = any> {
  id: string;
  routes: string[];
  meta?: PageMeta | ((input?: TInput) => PageMeta);
  styles?: {
    pageClass?: string;
    bodyClass?: string;
  };
  display: BranchDisplay<TInput, TContext>;
  data: BranchData<TInput, TContext>;
  state?: BranchState<TContext>;
  logic:
    | BranchLogic<TContext>[]
    | ((ctx: BranchContext<TInput, TContext>, root: HTMLElement) => BranchLogic<TContext>[]);
}
