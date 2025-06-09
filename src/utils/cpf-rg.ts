// utils/validators.ts

/**
 * Valida um CPF.
 * @param cpf - CPF no formato '123.456.789-09' ou '12345678909'.
 * @returns boolean indicando se o CPF é válido.
 */
export function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === parseInt(cpf.charAt(10));
}

/**
 * Valida um CNPJ.
 * @param cnpj - CNPJ no formato '12.345.678/0001-95' ou '12345678000195'.
 * @returns boolean indicando se o CNPJ é válido.
 */
export function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length += 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
}

/**
 * Valida um RG.
 * @param rg - RG no formato '12.345.678-9' ou '123456789'.
 * @returns boolean indicando se o RG é válido.
 */
export function isValidRG(rg: string): boolean {
  const rgLimpo = rg.replace(/\D/g, '');
  return rgLimpo.length >= 7 && rgLimpo.length <= 12;
}

/**
 * Formata um CPF.
 * @param cpf - CPF no formato '12345678909'.
 * @returns CPF formatado como '123.456.789-09'.
 */
export function formatCPF(cpf: string): string {
  const limpo = cpf.replace(/\D/g, '');
  return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata um CNPJ.
 * @param cnpj - CNPJ no formato '12345678000195'.
 * @returns CNPJ formatado como '12.345.678/0001-95'.
 */
export function formatCNPJ(cnpj: string): string {
  cnpj = cnpj.replace(/\D/g, '');
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata um RG.
 * @param rg - RG no formato '123456789'.
 * @returns RG formatado como '12.345.678-9'.
 */
export function formatRG(rg: string): string {
  const limpo = rg.replace(/\D/g, '');
  if (limpo.length <= 9) {
    return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
  }
  return rg;
}
