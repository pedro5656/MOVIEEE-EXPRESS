export const formatCurrency = (money) => {
    const formatter = new Intl.NumberFormat("en-Us", {
        maximumFractionDigits: 2,
    });
    return `$${formatter.format(money)}`;
};

export const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toDateString();
}