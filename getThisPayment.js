const getThisPayment = (PaymentAmount, installmentno) => {
    for (let pay of PaymentAmount) {
        if (installmentno >= pay.from && installmentno <= pay.to) {
            return pay
        }
    }
};

module.exports = getThisPayment;