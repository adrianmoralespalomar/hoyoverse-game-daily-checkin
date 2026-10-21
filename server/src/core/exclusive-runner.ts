/**
 * Ejecuta las tareas de una en una: el check-in y los canjes nunca se solapan, aunque se pulse el botón
 * del panel mientras corre la tarea programada.
 */
export class ExclusiveRunner {
  #queue: Promise<unknown> = Promise.resolve();
  #pendingTasks = 0;

  get isBusy(): boolean {
    return this.#pendingTasks > 0;
  }

  run<T>(task: () => Promise<T>): Promise<T> {
    this.#pendingTasks++;
    const result = this.#queue.then(task).finally(() => this.#pendingTasks--);
    this.#queue = result.catch(() => undefined);
    return result;
  }
}
