"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COOLDOWN_MINUTES = void 0;
exports.cooldownRemainingMs = cooldownRemainingMs;
exports.DEFAULT_COOLDOWN_MINUTES = 10;
function cooldownRemainingMs(lastGradedSubmittedAt, now, minutes = exports.DEFAULT_COOLDOWN_MINUTES) {
    const elapsed = now.getTime() - lastGradedSubmittedAt.getTime();
    const remaining = minutes * 60 * 1000 - elapsed;
    return remaining > 0 ? remaining : 0;
}
