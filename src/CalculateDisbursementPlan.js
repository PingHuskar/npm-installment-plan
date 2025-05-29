import CalculateInstallmentPlan from "./CalculateInstallmentPlan"
import daysDifference from "./daysDifference"
import round from "./round"
import daysInAYear from "./daysInAYear"
import monthsInAYear from "./monthsInAYear"
import lastday from "./lastday"

export default (DISB,
    PA,
    PAYMENTFIRSTDATE,
    PAYMENTDUEDAY
) => {
    const retArr = []
    let installment = PA[0].installment
    let intrate = PA[0].IntRate
    let interestdue1s = []
    const DISB_Group = DISB.reduce((acc, curr) => {
        const existingEntry = acc.find(item => item.date.getTime() === curr.date.getTime());

        if (existingEntry) {
            existingEntry.amount += curr.amount;
        } else {
            acc.push({ date: curr.date, amount: curr.amount });
        }

        return acc;
    }, []);
    for (let disburse of DISB_Group) {
        let daysDifferences = daysDifference(disburse.date, PAYMENTFIRSTDATE);
        if (daysDifferences >= 45) return [`Error daysDifference: ${daysDifferences} >= ${45}`];
        if (daysDifferences < 0) return [`Error daysDifference: ${daysDifferences} < ${0}`];
        let InterestDueAmount = round(
            ((disburse.amount * daysDifferences) / daysInAYear) * intrate
            , 2);
        interestdue1s.push(InterestDueAmount)
    }
    let totalinterestdue1 = round(interestdue1s.reduce((a, b) => a + b, 0), 2)
    let Principal = DISB.reduce((a, b) => a + b.amount, 0)
    let DeductPrincipal = installment - totalinterestdue1
    let RemainingPrincipal = round(Principal - DeductPrincipal, 2)
    let countInstallment = 0
    retArr.push({
        c: 1,
        prevmonthpaymentdate: null,
        thismonthpaymentdate: PAYMENTFIRSTDATE.toLocaleDateString(),
        PA: installment,
        IDA: totalinterestdue1,
        DP: DeductPrincipal,
        DI: totalinterestdue1,
        RP: RemainingPrincipal,
        AI: 0,
        AILP: 0,
        ITP: totalinterestdue1,
    });
    countInstallment++;
    let thismonthpaymentdate;
    (function () {
        let date = PAYMENTFIRSTDATE;
        let month = date.getMonth()
        let year = date.getFullYear()
        if (
            countInstallment == 1 &&
            PAYMENTDUEDAY >= 25 &&
            new Date(PAYMENTFIRSTDATE).getDate() <= 5
        ) {
        } else {
            month++;
        }
        if (month >= monthsInAYear) {
            month -= monthsInAYear;
            year++;
        }
        let EOMONTH = lastday(year, month);
        if (PAYMENTDUEDAY <= EOMONTH) {
            thismonthpaymentdate = new Date(year, month, PAYMENTDUEDAY);
        } else {
            thismonthpaymentdate = new Date(year, month, EOMONTH);
        }
    })()
    const ex = CalculateInstallmentPlan(
        PAYMENTFIRSTDATE,
        thismonthpaymentdate,
        PAYMENTDUEDAY,
        RemainingPrincipal,
        PA,
        0,
        0,
        countInstallment = 1,
    );
    return [...retArr, ...ex]
}