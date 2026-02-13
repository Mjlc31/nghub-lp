
export const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
        return numbers
            .replace(/^(\d{2})(\d)/g, '($1) $2')
            .replace(/(\d)(\d{4})$/, '$1-$2');
    }
    return numbers.slice(0, 11).replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};
