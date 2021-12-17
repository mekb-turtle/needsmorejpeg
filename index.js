const fs = require("fs");
const axios = require("axios");
module.exports = {
	async fromFile(file) {
		return await module.exports.fromBuffer(await fs.promises.readFile(file));
	},
	async fromBuffer(buffer) {
		var type = await (await import("file-type")).fileTypeFromBuffer(buffer);
		if (!type) {
			throw "unable to find mime type";
		}
		if (!type.mime.startsWith("image/")) {
			throw "not an image";
		}
		var d = `-----------------------------1
Content-Disposition: form-data; name="image"; filename="_.${type.ext}"
Content-Type: ${type.mime}

`;
		var d2 = `-----------------------------1
Content-Disposition: form-data; name="image"


-----------------------------1--`;
		var C = {
			maxRedirects: 0,
			validateStatus: status => status >= 200 && status < 400,
			transformResponse: (r) => r,
		};
		var a = await axios({
			...C,
			method: "post",
			url: "http://needsmorejpeg.com/upload",
			headers: {
				"Content-Type": `multipart/form-data; boundary=---------------------------1`
			},
			data: Buffer.concat([Buffer.from(d), buffer, Buffer.from(d2)]),
		});
		var url = `https://static.needsmorejpeg.com${a.headers.location}.jpg`;
		var b = await axios({
			...C,
			method: "get",
			url,
			headers: {},
			responseType: "arraybuffer"
		});
		return { url, image: b.data };
	}
};
