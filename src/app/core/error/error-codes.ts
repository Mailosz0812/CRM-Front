export const ERROR_MESSAGES: Record<string,string> ={
  'BAD_CREDENTIALS': 'Nieprawidłowe dane logowania',
  'JWT_ERROR': 'Błąd autoryzacji',
  'JWT_UNSUPPORTED': 'Błąd autoryzacji',
  'JWT_EXPIRED': 'Błąd autoryzacji',
  'JWT_MALFORMED': 'Błąd autoryzacji',
  'VALIDATION_ERROR': 'Dane w formularzu są niepoprawne',
  'CLIENT_ALREADY_EXISTS': 'Klient już istnieje (numer NIP jest unikalny)',
  'CLIENT_NOT_FOUND' : 'Klient nie istnieje',
  'USER_NOT_FOUND' : 'Użytkownik nie istnieje',
  'USER_ALREADY_EXISTS' : 'Użytkownik już istnieje (email jest unikalny)',
  'ARGUMENT_TYPE_MISMATCH': 'Nieprawidłowy argument',
  'EMPTY_SALE_ITEMS': 'Lista produktów zamówienia jest pusta',
  'INVALID_SALE_DATE': 'Data zamówienia nie może być w przeszłości',
  'GENERIC_ERROR' : 'Wystąpił nieoczekiwany błąd'
};
