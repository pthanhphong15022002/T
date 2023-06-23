import axios from "axios";

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
                if (fetcher.status == 401 || fetcher.status == 404) {
                    return "401"
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
    formPostWithToken: async (apiPath, data,fileName="") => {
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
            let isPaused = false;
            const response = await axios.request({
                method: "post", 
                url: url, 
                data: formData, 
                headers: header,
                onUploadProgress: (p) => {
                    //barWidth =  
                    let percent = (p.loaded / p.total) * 100;
                    let count = 0;
                    //let id = setInterval(frame, 2000);
                    let elem =  document.getElementById("circle"+fileName);
                    if(elem)
                    {
                        // elem.style.setProperty("--percent",percent.toString());
                        let id = setInterval(() => {
                            if(!isPaused && percent <=100)
                            {
                                if(percent >= 100) clearInterval(id);
                                else if(count >= percent) isPaused = true;
                                else count += 1;
                            }
                            
                        }, 2000)

                        elem.style.strokeDashoffset = (503 - ( 503 * ( percent / 100 ))).toString();
                    }
                   
                    // function frame() {
                    //     if(percent == 100)  clearInterval(id);
                    //     elem.style.setProperty("--percent",percent.toString());
                   
                    // }
                    // if(percent == 100)  {
                    //     elem.style.setProperty("--percent",percent.toString());
                    //     clearInterval(id)
                    // }
                  //this.setState({
                      //fileprogress: p.loaded / p.total
                  //})
                }
            });
            //clearInterval(id)
            let elem2 =  document.getElementById("id-tf-"+fileName);
            if(elem2) elem2.classList.remove("opacity-50");
            return response;

            // var fetcher = await fetch(url, {
            //     method: 'POST',
            //     headers:header,
            //     credentials: 'include',
            //     body: formData
            // });
            // if (fetcher.status >= 200 && fetcher.status < 300) {
            //     return await fetcher.json();

            // }
            // else {
            //     var err = await fetcher.json()
            //     throw (err)
            // }

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
            return e;
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