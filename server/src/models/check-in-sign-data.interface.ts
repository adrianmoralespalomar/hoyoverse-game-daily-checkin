/** `data` de la respuesta al hacer check-in. Si trae riesgo, HoYoLAB no da la recompensa hasta resolver un captcha. */
export interface CheckInSignData {
  gt_result?: {
    is_risk?: boolean;
    risk_code?: number;
  };
}
