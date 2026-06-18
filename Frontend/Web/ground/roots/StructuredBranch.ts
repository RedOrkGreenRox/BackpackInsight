import { Branch, PageMeta } from './Branch';

export interface BranchDisplay<TInput = any, TContext = any> {
  renderSkeleton(): string;
  renderError(error: unknown, input?: TInput): string;
  renderFullPage(context: TContext, input?: TInput): string;
}

export interface BranchData<TInput = any, TContext = any> {
  load(input?: TInput): Promise<TContext>;
}

export interface BranchState<TContext = any> {
  save(context: TContext): void;
  restore(): TContext | null;
}

export interface BranchLogic<TContext = any> {
  init(context: TContext, root: HTMLElement): void | Promise<void>;
  destroy(): void;
}

export interface BranchContext<TInput, TContext> {
  input: TInput;
  context: TContext;
}

export abstract class StructuredBranch<TInput = any, TContext = any> extends Branch {
  protected abstract pageClass: string;
  protected abstract bodyClass?: string;
  protected abstract display: BranchDisplay<TInput, TContext>;
  protected abstract data: BranchData<TInput, TContext>;
  protected abstract meta: PageMeta | ((input?: TInput) => PageMeta);

  protected state?: BranchState<TContext>;
  private logicModules: BranchLogic<TContext>[] = [];
  private lastInput?: TInput;

  public override getMeta(data?: any): PageMeta {
    const input = this.extractInput(data);
    return typeof this.meta === 'function' ? this.meta(input) : this.meta;
  }

  protected getHtml(data?: any): string {
    this.lastInput = this.extractInput(data);
    return `<div class="${this.pageClass}">${this.display.renderSkeleton()}</div>`;
  }

  protected async init(data?: any): Promise<void> {
    if (!this.container) return;
    this.lastInput = this.extractInput(data);

    if (this.bodyClass) document.body.classList.add(this.bodyClass);

    try {
      const context = this.state?.restore() ?? await this.data.load(this.lastInput);
      this.state?.save(context);
      this.container.innerHTML = this.display.renderFullPage(context, this.lastInput);
      const logic = this.createLogic(context, this.container);
      this.logicModules = Array.isArray(logic) ? logic : [logic];
      await Promise.all(this.logicModules.map(m => m.init(context, this.container!)));
    } catch (error) {
      this.container.innerHTML = this.display.renderError(error, this.lastInput);
    }
  }

  protected destroy(): void {
    this.logicModules.forEach(m => m.destroy());
    this.logicModules = [];
    if (this.bodyClass) document.body.classList.remove(this.bodyClass);
  }

  protected abstract createLogic(
    context: TContext,
    root: HTMLElement,
  ): BranchLogic<TContext> | BranchLogic<TContext>[];

  protected extractInput(data?: any): TInput {
    return data as TInput;
  }

  protected getLastInput(): TInput | undefined {
    return this.lastInput;
  }
}
