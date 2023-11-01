const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;

server.use(middlewares);
server.use(router);
server.use(jsonServer.bodyParser);


server.post('/payment', async (req, res) => {
    try {
        let partnerCode = "MOMO";
        let accessKey = "F8BBA842ECF85";
        let secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
        let requestId = partnerCode + new Date().getTime() + "id";
        let orderId = new Date().getTime() + ":0123456778";
        let orderInfo = "Thanh toán qua ví MoMo";
        let redirectUrl = "http://127.0.0.1:5500/index.html";
        let ipnUrl = "http://127.0.0.1:5500/index.html";
        // let ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
        let amount = "50000";
        let requestType = "payWithATM";
        // let requestType = "captureWallet";
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
        //puts raw signature
        console.log("--------------------RAW SIGNATURE----------------");
        console.log(rawSignature);
        //signature
        const crypto = require("crypto");
        let signature = crypto
            .createHmac("sha256", secretkey)
            .update(rawSignature)
            .digest("hex");
        console.log("--------------------SIGNATURE----------------");
        console.log(signature);

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
        //Send the request and get the response
        const reqq = https.request(options, (res) => {
            console.log(`Status: ${res.statusCode}`);
            console.log(`Headers: ${JSON.stringify(res.headers)}`);
            res.setEncoding("utf8");
            res.on("data", (body) => {
                console.log("Body: ");
                console.log(body);
                console.log("payUrl: ");
                console.log(JSON.parse(body).payUrl);
            });
            res.on("end", () => {
                console.log("No more data in response.");
            });
        });

        reqq.on("error", (e) => {
            console.log(`problem with request: ${e.message}`);
        });
        // write data to request body
        console.log("Sending....");
        reqq.write(requestBody);
        reqq.end();
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(500).json({ error: error.message });
    }
});
server.listen(port);