const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);


server.post('/payment', async (req, res) => {
    try {
        // láy data
        const clientData = req.body;

        let partnerCode = "MOMO";
        let accessKey = "F8BBA842ECF85";
        let secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
        let requestId = partnerCode + new Date().getTime() + "id";
        let orderId = new Date().getTime() + ":0123456778";
        let orderInfo = "Thanh toán qua ví MoMo";
        let redirectUrl = "https://gentle-klepon-9b14a9.netlify.app/";
        let ipnUrl = "https://gentle-klepon-9b14a9.netlify.app/";
        // let ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
        let amount = clientData.amount;
        // let requestType = "payWithATM";
        let requestType = "captureWallet";
        let extraData = ""; //pass empty value if your merchant does not have stores

        //before sign HMAC SHA256 with format
        //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        let rawSignature =
            "accessKey=" +
            accessKey +
            "&amount=" +
            amount +
            "&extraData=" +
            extraData +
            "&ipnUrl=" +
            ipnUrl +
            "&orderId=" +
            orderId +
            "&orderInfo=" +
            orderInfo +
            "&partnerCode=" +
            partnerCode +
            "&redirectUrl=" +
            redirectUrl +
            "&requestId=" +
            requestId +
            "&requestType=" +
            requestType;

        //signature
        const crypto = require("crypto");
        let signature = crypto
            .createHmac("sha256", secretkey)
            .update(rawSignature)
            .digest("hex");

        //json object send to MoMo endpoint
        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            accessKey: accessKey,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: "en",
        });
        //Create the HTTPS objects
        const https = require("https");
        const options = {
            hostname: "test-payment.momo.vn",
            port: 443,
            path: "/v2/gateway/api/create",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(requestBody),
            },
        };
        const payUrl = await new Promise((resolve, reject) => {
            const reqq = https.request(options, (res) => {
                res.setEncoding("utf8");
                res.on("data", (body) => {
                    const payUrl = JSON.parse(body).payUrl;
                    resolve(payUrl);
                    console.log(body);
                });
                res.on("end", () => {
                    console.log("Thanh toán thành công");
                });
            });

            reqq.on("error", (e) => {
                reject(e);
            });

            reqq.write(requestBody);
            reqq.end();
        });

        return res.json({ payUrl });
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(500).json({ error: error.message });
    }
});


server.use(router);
server.listen(4002, () => {
    console.log("JSON Server is running");
});
module.exports = server;