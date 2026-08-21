// Mapping nilai gender DB ke label tampilan UI.
// NB: TIDAK mengubah nilai yang tersimpan di database (pria/wanita/putra/putri).
// Hanya untuk render label konsisten: putra|pria -> Laki-laki, putri|wanita -> Perempuan.
export function genderLabel(gender?: string | null): string {
  if (!gender) return '-';
  if (gender === 'putra' || gender === 'pria') return 'Laki-laki';
  if (gender === 'putri' || gender === 'wanita') return 'Perempuan';
  return gender;
}

export function isMale(gender?: string | null): boolean {
  return gender === 'putra' || gender === 'pria';
}