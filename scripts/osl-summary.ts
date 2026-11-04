/**
 * Prints counts of what the sign data holds, built from data/osl.asl:
 *
 *   npm run osl-summary
 *
 * After copying in a new osl.asl, compare them with the last run's.
 */
import { loadOsl } from "./osl/loadOsl"

const { signs, sequences } = loadOsl()
const count = (test: (s: (typeof signs)[number]) => unknown) =>
  signs.filter(test).length
console.log(
  `${signs.length} signs (${count((s) => s.formOf)} via forms, ` +
    `${count((s) => s.deprecated)} deprecated), ` +
    `${count((s) => s.compound)} compounds of encoded signs, ` +
    `${count((s) => s.variant)} variants, ${sequences.length} sequences`,
)
