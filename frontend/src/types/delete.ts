/**
 * Resultado uniforme de los DELETE de entidades con política híbrida.
 * `deleted` = hard delete (la entidad nunca fue usada).
 * `archived` = soft delete (la entidad tenía dependencias, se preserva la historia).
 */
export interface DeleteResult {
  mode: 'deleted' | 'archived';
}
