/** Documentos do Mongo vêm com `_id`; o frontend trabalha com `id`. */
export function normalizarId<T extends { id: string }>(doc: Record<string, unknown>): T {
  const { _id, ...resto } = doc;
  return { ...resto, id: _id } as T;
}
