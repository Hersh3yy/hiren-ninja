// ADE week spotlight: the QR stickers point at hiren.ninja, so until ADE is over the
// planner glows in the nav and gets a button on the home hero. Switches itself off.
export const ADE_SPOTLIGHT_UNTIL = new Date('2026-10-26T12:00:00+01:00')

export const adeSpotlightOn = (now = new Date()) => now < ADE_SPOTLIGHT_UNTIL
