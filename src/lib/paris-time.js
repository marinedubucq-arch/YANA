/**
 * Retourne la date du jour en fuseau Paris (format YYYY-MM-DD)
 */
export function getParisTodayDate() {
  return new Date().toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' })
}

/**
 * Retourne l'heure courante en heure Paris (0-23)
 */
export function getParisHour() {
  return parseInt(
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris', hour: 'numeric', hour12: false }),
    10
  )
}

/**
 * Indique si une pastille de présence doit être affichée selon le créneau
 * et l'heure actuelle (Paris)
 */
export function shouldShowPresence(period) {
  const hour = getParisHour()
  if (period === 'morning') return hour < 12
  if (period === 'afternoon') return hour >= 12
  return true // full_day
}
