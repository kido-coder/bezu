const crypto = require('crypto');

export default function Decode(secretKey) {
    const hash = crypto.createHmac('sha256', secretKey)
                    .update(data)
                    .digest('hex');

    return hash;
}