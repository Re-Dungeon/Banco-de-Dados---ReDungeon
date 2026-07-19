import * as Yup from 'yup';

export const NOME_MAX = 100;
export const CAMPO_CURTO_MAX = 300;
export const DESCRICAO_MAX = 2000;

const maxCaracteresMessage = max => `Deve ter no máximo ${max} caracteres`;

export const nomeSchema = Yup.string()
  .trim()
  .max(NOME_MAX, maxCaracteresMessage(NOME_MAX))
  .required('Nome é obrigatório');

export const campoCurtoSchema = Yup.string()
  .trim()
  .max(CAMPO_CURTO_MAX, maxCaracteresMessage(CAMPO_CURTO_MAX));

export const descricaoSchema = Yup.string()
  .trim()
  .max(DESCRICAO_MAX, maxCaracteresMessage(DESCRICAO_MAX));

export const urlImagemSchema = Yup.string()
  .trim()
  .url('Deve ser uma URL válida');
