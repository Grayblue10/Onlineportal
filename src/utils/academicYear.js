// Shared Academic Year helpers
// - formatAcademicYear: normalize input to 'YYYY-YYYY'
// - getStartYear: extract the start year (YYYY) from the normalized string

export const formatAcademicYear = (val) => {
  if (!val) {
    const y = new Date().getFullYear();
    return `${y}-${y + 1}`;
  }
  const str = String(val).trim();
  // Already YYYY-YYYY
  const mFull = str.match(/^(\d{4})\s*[-\/]\s*(\d{4})$/);
  if (mFull) return `${mFull[1]}-${mFull[2]}`;
  // YYYY-YY
  const mShort = str.match(/^(\d{4})\s*[-\/]\s*(\d{2})$/);
  if (mShort) {
    const start = parseInt(mShort[1], 10);
    return `${start}-${start + 1}`;
  }
  // Single YYYY
  const mSingle = str.match(/^(\d{4})$/);
  if (mSingle) {
    const start = parseInt(mSingle[1], 10);
    return `${start}-${start + 1}`;
  }
  // Fallback
  const y = new Date().getFullYear();
  return `${y}-${y + 1}`;
};

export const getStartYear = (sy) => {
  const str = formatAcademicYear(sy);
  const m = str.match(/^(\d{4})-\d{4}$/);
  return m ? parseInt(m[1], 10) : new Date().getFullYear();
};
