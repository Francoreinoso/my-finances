import type { ErrorRequestHandler } from 'express';
import { TransactionValidationError } from '@/domain/transaction/errors.js';
import { QueryValidationError } from '@/infrastructure/http/errors.js';

/**
 * Convierte errores conocidos en respuestas HTTP apropiadas.
 * Cualquier error desconocido → 500 con mensaje genérico (no expone internals).
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof TransactionValidationError || err instanceof QueryValidationError) {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: err.message },
    });
    return;
  }

  console.error('[errorHandler] error inesperado:', err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Algo salió mal en el servidor' },
  });
};
