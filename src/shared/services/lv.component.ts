var LV = {} as any;
LV.Files = {};
LV.Ajax = {
    post: function (url, data) {
        var formData = new FormData();
        var postData = {};
        var keys = Object.keys(data || {});
        var files = {};
        var hasFile = false;
        keys.forEach(function (k, i) {
            if (data[k] instanceof (File)) {
                formData.append(k, data[k], data[k].name);
                hasFile = true;
            }
            else {
                postData[k] = data[k];
            }
        });
        var settings = {
            url: url,
            type: 'POST',
            cache: false,
            contentType: false,
            processData: false
        } as any;
        if (hasFile) {
            formData.append("data", JSON.stringify(postData));
            settings.data = formData;
        }
        else {
            settings.data = JSON.stringify(postData);
            settings.contentType = "application/json; charset=utf-8";
            settings.dataType = "json";

        }

        return new Promise(function (resolve, reject) {
            settings.success = function (result) {
                resolve(result);
            };
            settings.error = function (xhr, ajaxOptions, thrownError) {
                reject({
                    xhr: xhr,
                    ajaxOptions: ajaxOptions,
                    thrownError: thrownError
                });
            };
            $.ajax(settings);

        });
    }
};
LV.Files.APINames = {
    registerUpload: "/api/default/LV-Media/content/Register",
    uploadChunk: "/api/default/LV-Media/content/UploadChunk"
}
LV.Files.API = {
    hostApiUrl: "",
    setHostApiUrl: function (url) {
        LV.Files.API.hostApiUrl = url;
    },
    /**
     * Api dùng để Upload
     * @param {any} regisData
     */
    callApi: async function (relApiPath, regisData) {
        if (LV.Files.API.hostApiUrl == "")
            throw "Gọi hàm 'LV.Files.API.setHostApiUrl trỏ đến server upload'";
        var fullUrl = LV.Files.API.hostApiUrl + relApiPath;
        var ret = await LV.Ajax.post(fullUrl, regisData);
        if (ret.error && ret.error != null)
            throw ret.error;
        else
            return ret.data;
    }
};

export { LV }