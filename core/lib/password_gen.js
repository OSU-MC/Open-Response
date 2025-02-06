// generates a one time password of length and containing digits 0-9 & all lowercase letters in the English alphabet
const generateOTP = (length) => {
    const digits = '0123456789abcdefghijklmnopqrstuvwxyz'
    var otp = ''
    for(let i = 1; i <= length; i++) {
        var index = Math.floor(Math.random()*(digits.length))
        otp = otp + digits[index]
    }
    return otp;
}
exports.generateOTP = generateOTP