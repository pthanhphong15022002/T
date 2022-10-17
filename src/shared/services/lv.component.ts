var lvFileClientAPI = {
    serverApIHostUrl: "",
    _onBeforeCall: () => { },
    getToken: () => {
        return window.localStorage['lv-file-api-token']
    },
    setUrl: (url) => {
        lvFileClientAPI.serverApIHostUrl = url
    },
    getUrl: () => {
        return lvFileClientAPI.serverApIHostUrl;
    },
    formPostAsync: async (apiPath, data) => {
        var url = lvFileClientAPI.serverApIHostUrl + "/" + apiPath;
        var formData = new FormData()
        var keys = Object.keys(data)
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i]
            var val = data[key]
            formData.append(key, val);

        }
        var sender = undefined;
        
        try {
            var fetcher = await fetch(url, {
                method: 'POST',
                body: formData
            });
           
            if (fetcher.status >= 200 && fetcher.status < 300) {
                return await fetcher.json();

            }
            else {
                var err = await fetcher.json()
                throw (err)
            }

        }
        catch (e) {

           
            throw (e)
        }
    },
    __post__: async (apiPath,data) => {
        
        var url = lvFileClientAPI.serverApIHostUrl + "/" + apiPath;
        function checkHasFile() {
            var retData = {}
            var files = undefined
            var keys = Object.keys(data);
            for (var i = 0; i < keys.length; i++) {
                var val = data[keys[i]];
                if (val instanceof File) {
                    if (!files) files = {}
                    files[keys[i]] = val
                }
                else {
                    retData[keys[i]] = val
                }
            }
            return {
                data: retData,
                files: files
            }
        }
        var checkData = checkHasFile()
        if (!checkData.files) {

            var fetcher = await fetch(url, {
                method: 'POST',
                //mode: 'no-cors', // this is to prevent browser from sending 'OPTIONS' method request first
                //credentials: "include",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + lvFileClientAPI.getToken()
                },
                body: JSON.stringify(data)
            });

            if (fetcher.status >= 200 && fetcher.status < 300) {
                return await fetcher.json();

            }
            else {
                if (fetcher.status == 401) {
                    throw (err);
                }
                var err = await fetcher.json()
                throw (err)
            }

        }
        else {
            var formData = new FormData()
            var fileKeys = Object.keys(checkData.files)
            for (var i = 0; i < fileKeys.length; i++) {
                formData.append(fileKeys[i], checkData.files[fileKeys[i]]);
            }
            formData.append('data', JSON.stringify(checkData.data))

            var fetcher = await fetch(url, {
                method: 'POST',
                body: formData
            });
            return await fetcher.json();
        }
    },
    formPost: async (apiPath, data) => {
        var url = lvFileClientAPI.serverApIHostUrl + "/" + apiPath;
        var formData = new FormData()
        var keys = Object.keys(data)
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i]
            var val = data[key]
            formData.append(key, val);

        }
        var sender = undefined;
        try {
            var fetcher = await fetch(url, {
                method: 'POST',
                body: formData
            });
            if (fetcher.status >= 200 && fetcher.status < 300) {
                return await fetcher.json();

            }
            else {
                var err = await fetcher.json()
                throw (err)
            }

        }
        catch (e) {

          
            throw (e)
        }
    },
    formPostWithToken: async (apiPath, data) => {
        var url = lvFileClientAPI.serverApIHostUrl + "/" + apiPath;
        var formData = new FormData()
        var keys = Object.keys(data)
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i]
            var val = data[key]
            formData.append(key, val);

        }
        var sender = undefined;
        var header= {
            // 'Accept': 'multipart/form-data',
            // 'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + lvFileClientAPI.getToken()
        };
        formData.append('Authorization', 'Bearer ' + lvFileClientAPI.getToken());
        try {
            var fetcher = await fetch(url, {
                method: 'POST',
                headers:header,
                credentials: 'include',
                body: formData
            });
            if (fetcher.status >= 200 && fetcher.status < 300) {
                return await fetcher.json();

            }
            else {
                var err = await fetcher.json()
                throw (err)
            }

        }
        catch (e) {

          
            throw (e)
        }
    },
    postAsync: async (apiPath, data) => {
        var sender = undefined;
       
        try {
            var ret = await lvFileClientAPI.__post__(apiPath, data);
            return ret;
        }
        catch (e) {

            throw (e);
        }
    },
    post: async (apiPath, data) => {
        var sender = undefined;
       
        try {
            var ret = await lvFileClientAPI.__post__(apiPath, data);
            return ret;
        }
        catch (e) {

            throw (e);
        }
    }
}
export {lvFileClientAPI}