export interface LocalProfile {
  firstName: string;
  lastName: string;
  phone: string;
}

const namePattern = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length === 13 && digits.startsWith('55') ? digits.slice(2) : digits;
}

export function validateProfile(profile: LocalProfile): string | null {
  for (const [label, value] of [['nome', profile.firstName], ['sobrenome', profile.lastName]]) {
    const name = normalizeName(value);
    if (name.length < 2 || name.length > 60 || !namePattern.test(name)) {
      return `Informe um ${label} válido, com 2 a 60 caracteres.`;
    }
  }
  const phone = normalizePhone(profile.phone);
  if (!/^989\d{8}$/.test(phone) || /^(\d)\1{7}$/.test(phone.slice(3))) {
    return 'Informe um celular com DDD 98 e nove dígitos, começando com 9. Ex.: (98) 9XXXX-XXXX.';
  }
  return null;
}
