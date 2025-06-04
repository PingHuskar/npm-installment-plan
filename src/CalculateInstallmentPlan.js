import lastday from "./lastday";
import daysDifference from "./daysDifference";
import round from "./round";
import getThisPayment from "./getThisPayment";
import monthsInAYear from "./monthsInAYear";
import daysInAYear from "./daysInAYear";
import pushInstallmentResult from "./pushInstallmentResult";

export default (
  DISBURSEMENTDATE,
  PAYMENTFIRSTDATE,
  PAYMENTDUEDAY,
  Principal,
  PaymentAmount,
  TopupAmt = 0,
  TopupStart = 1,
  countInstallment = 0
) => {
  const retArr = [];
  const firstPayment = PaymentAmount[0];
  const lastPayment = PaymentAmount[PaymentAmount.length - 1];
  const TERM = lastPayment.to;
  let date = PAYMENTFIRSTDATE;
  let RemainingPrincipal = Principal;
  let month = date.getMonth();
  let year = date.getFullYear();
  let AccrueInterest = 0;
  let lastPaymentAmount = 0;
  let DeductInterests = 0;
  let AccrueInterestLastPayment = 0;
  let prevmonthpaymentdate = PAYMENTFIRSTDATE;
  let daysDifferences = daysDifference(DISBURSEMENTDATE, PAYMENTFIRSTDATE);

  if (daysDifferences >= 45) return [`Error daysDifference: ${daysDifferences} >= ${45}`];
  if (daysDifferences < 0) return [`Error daysDifference: ${daysDifferences} < ${0}`];

  const firstIntRate = firstPayment.IntRate;
  const firstInstallment = firstPayment.installment;
  const isTopupFirst = TopupStart <= 1;
  let InterestDueAmount = round(
    ((RemainingPrincipal * daysDifferences) / daysInAYear) * firstIntRate
  );
  let InterestThisPayment = InterestDueAmount;
  let DeductPrincipal = round(
    firstInstallment + (isTopupFirst ? TopupAmt : 0) - InterestDueAmount
  );
  RemainingPrincipal = round(RemainingPrincipal - DeductPrincipal, 2);

  // First push
  pushInstallmentResult(retArr, {
    c: countInstallment + 1,
    prevmonthpaymentdate: null,
    thismonthpaymentdate: PAYMENTFIRSTDATE,
    daysDifferences,
    PA: firstInstallment + (TopupStart == 1 ? TopupAmt : 0),
    InterestDueAmount,
    DeductPrincipal,
    DeductInterests: undefined,
    RemainingPrincipal,
    AccrueInterest,
    AccrueInterestLastPayment: 0,
    InterestThisPayment
  });
  countInstallment++;

  while (true) {
    if (countInstallment + 1 > TERM) break;

    // Only skip month increment for the special first payment case
    const isSpecialFirst =
      countInstallment === 1 &&
      PAYMENTDUEDAY >= 25 &&
      new Date(PAYMENTFIRSTDATE).getDate() <= 5;
    if (!isSpecialFirst) {
      month++;
      if (month >= monthsInAYear) {
        month -= monthsInAYear;
        year++;
      }
    }

    AccrueInterestLastPayment = AccrueInterest;
    const EOMONTH = lastday(year, month);
    const thismonthpaymentdate = new Date(year, month, Math.min(PAYMENTDUEDAY, EOMONTH));
    daysDifferences = daysDifference(prevmonthpaymentdate, thismonthpaymentdate);

    const thispayment = getThisPayment(PaymentAmount, countInstallment + 1);
    const thisIntRate = thispayment.IntRate;
    const thisInstallment = thispayment.installment;
    const isTopup = TopupStart <= countInstallment + 1;

    InterestDueAmount = round(
      ((RemainingPrincipal * daysDifferences) / daysInAYear) * thisIntRate
    );
    DeductPrincipal = round(
      thisInstallment + (isTopup ? TopupAmt : 0) - (InterestDueAmount + AccrueInterest)
    );
    InterestThisPayment = InterestDueAmount;

    if (DeductPrincipal < 0) {
      AccrueInterest = -DeductPrincipal;
      DeductPrincipal = 0;
      InterestDueAmount = thisInstallment;
    } else {
      AccrueInterest = 0;
    }

    const isLastInstallment = DeductPrincipal >= RemainingPrincipal || countInstallment + 1 >= TERM;
    if (isLastInstallment) {
      DeductPrincipal = RemainingPrincipal;
      DeductInterests = InterestThisPayment + AccrueInterestLastPayment;
      InterestDueAmount = round(InterestDueAmount + AccrueInterest);
      lastPaymentAmount = round(RemainingPrincipal + InterestDueAmount);
      AccrueInterest = 0;
      RemainingPrincipal = 0;
      pushInstallmentResult(retArr, {
        c: countInstallment + 1,
        prevmonthpaymentdate,
        thismonthpaymentdate,
        daysDifferences,
        PA: lastPaymentAmount,
        InterestDueAmount,
        DeductPrincipal,
        DeductInterests,
        RemainingPrincipal,
        AccrueInterest,
        AccrueInterestLastPayment,
        InterestThisPayment
      });
      break;
    }

    RemainingPrincipal = round(RemainingPrincipal - DeductPrincipal, 2);
    pushInstallmentResult(retArr, {
      c: countInstallment + 1,
      prevmonthpaymentdate,
      thismonthpaymentdate,
      daysDifferences,
      PA: thisInstallment + (isTopup ? TopupAmt : 0),
      InterestDueAmount,
      DeductPrincipal,
      DeductInterests,
      RemainingPrincipal,
      AccrueInterest,
      AccrueInterestLastPayment,
      InterestThisPayment
    });
    prevmonthpaymentdate = thismonthpaymentdate;
    countInstallment++;
  }
  return retArr;
};

