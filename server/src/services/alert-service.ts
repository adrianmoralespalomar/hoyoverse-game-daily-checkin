import { livestreamAlertRule } from '../core/livestream-alert-rule.ts';
import { staminaOverflowAlertRule } from '../core/stamina-overflow-alert-rule.ts';
import { wishImportExpiryAlertRule } from '../core/wish-import-expiry-alert-rule.ts';
import type { AlertContext } from '../models/alert-context.interface.ts';
import type { AlertRuleView } from '../models/alert-rule-view.interface.ts';
import type { AlertRule } from '../models/alert-rule.interface.ts';
import type { AppAlert } from '../models/app-alert.interface.ts';

/** Reglas de avisos. Para añadir una, crear su fichero en `core/` y ponerla aquí. */
const ALERT_RULES: AlertRule[] = [staminaOverflowAlertRule, wishImportExpiryAlertRule, livestreamAlertRule];

export class AlertService {
  hasRule(ruleId: unknown): boolean {
    return ALERT_RULES.some(({ id }) => id === ruleId);
  }

  getRulesView(disabledRuleIds: string[]): AlertRuleView[] {
    return ALERT_RULES.map(({ id, label, description }) => ({ id, label, description, isEnabled: !disabledRuleIds.includes(id) }));
  }

  getAlerts(context: AlertContext, disabledRuleIds: string[]): AppAlert[] {
    return ALERT_RULES.filter(({ id }) => !disabledRuleIds.includes(id)).flatMap(rule => rule.evaluate(context));
  }
}
