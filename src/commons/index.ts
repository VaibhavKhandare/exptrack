export const EXPENSE_CATEGORIES = [
    'Necessary Travel',
    'Friends Travel',
    'Other Travel',
    'Basic Food',
    'Zomato Food',
    'Hotel Food',
    'Dessert',
    'Rent',
    'House',
    'TFG',
    'Invest',
    'Savings',
    'Other'
  ] as const;

export const smallVibrate = (navigator: any) => {
  if (navigator.vibrate) {
    navigator.vibrate(200);
  }
}

export const midVibrate = (navigator: any) => {
  if (navigator.vibrate) {
    navigator.vibrate(400);
  }
}
  