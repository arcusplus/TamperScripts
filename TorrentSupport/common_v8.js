// ------------------------------------------------------------
// エレメントに文字列をセットして、テキストノードを構築する関数
// ------------------------------------------------------------
function ElementSetTextContent(element,str){
	if(element.textContent !== undefined){
		element.textContent = str;
	}
	if(element.innerText !== undefined){
		element.innerText = str;
	}
}

// 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
function sleep(waitMsec) {
    var startMsec = new Date();
    while (new Date() - startMsec < waitMsec);
}

function GetDomain(url) {
    var result = url.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/)[1];
    return result; // example.com
}

function toBase64Url(url, callback){
    
    console.log("url:" + url);
    url = "http://imageshtorm.com/upload/big/2019/11/21/5dd664bb5206f.jpg";
    var xhr = new GM_xmlhttpRequest();
    xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.setRequestHeader('Referer', 'http://imageshtorm.com/');
    xhr.send();
}

function toBase64Url2(url, callback){
    GM_xmlhttpRequest({
        method: "GET",
        url: url,
        headers: { referer: url, origin: url },
        responseType: 'blob',
        onload: function(resp) {
        //   var img = document.createElement('img');
        //   img.src = window.URL.createObjectURL(resp.response);
        //   document.body.appendChild(img);

          callback(window.URL.createObjectURL(resp.response));
        }
      });
}

function parseURL(url){
    var parsed_url = {}

    if ( url == null || url.length == 0 )
    {
        return parsed_url;
    }

    var protocol_i = url.indexOf('://');
    parsed_url.protocol = url.substr(0,protocol_i);

    var remaining_url = url.substr(protocol_i + 3, url.length);
    var domain_i = remaining_url.indexOf('/');
    domain_i = domain_i == -1 ? remaining_url.length - 1 : domain_i;
    parsed_url.domain = remaining_url.substr(0, domain_i);
    parsed_url.path = domain_i == -1 || domain_i + 1 == remaining_url.length ? null : remaining_url.substr(domain_i + 1, remaining_url.length);

    var domain_parts = parsed_url.domain.split('.');
    switch ( domain_parts.length ){
        case 2:
          parsed_url.subdomain = null;
          parsed_url.host = domain_parts[0];
          parsed_url.tld = domain_parts[1];
          break;
        case 3:
          parsed_url.subdomain = domain_parts[0];
          parsed_url.host = domain_parts[1];
          parsed_url.tld = domain_parts[2];
          break;
        case 4:
          parsed_url.subdomain = domain_parts[0];
          parsed_url.host = domain_parts[1];
          parsed_url.tld = domain_parts[2] + '.' + domain_parts[3];
          break;
    }

    parsed_url.root_domain = parsed_url.host + '.' + parsed_url.tld;

    return parsed_url;
}

function AddNextButton() {
    var zNode = document.createElement('div');
    zNode.innerHTML = '<button id="myButton" type="button">Next</button>';
    zNode.setAttribute('id', 'nextbutton');
    document.body.appendChild(zNode);

    //--- Activate the newly added button.
    document.getElementById("myButton").addEventListener(
        "click", ReadNext, false
    );
}

function GetGoogleImageList(td_element, searchurl, getCount) {
    GM_xmlhttpRequest({
        method: "GET",
        url: searchurl,
        synchronous: true,
        header: {
            "User-Agent": "Mozilla/5.0",
        },
        onload: function (response) {

            var isError = false;

            if (response.status == 200) {
                //console.log(response.responseText);
                isError = MakeGoogleImageList(td_element, searchurl, response.responseText, getCount);
            } else {
                isError = true;
            }

            if (isError) {
                let new_err = document.createElement('a');
                new_err.href = searchurl;
                new_err.innerText = "Error in google search request.";
                new_err.target = "_blank";
                td_element.appendChild(new_err);
                td_element.align = "left";
            }
        }
    });
}
//2020.2.7 mode because Google Site Change
function MakeGoogleImageList(td_element, searchurl, responseText, getCount) {

    var isError = false;

    //parse document
    let parser = new DOMParser();
    let doc = parser.parseFromString(responseText, "text/html");

    //create UI element
    let new_div = document.createElement('ul');
    new_div.classList.add("hoverbox");

    // オリジナルデータ例　_setImgSrc('16','data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD
    //let pattern2 = /s='(?<year>[^']*)';var ii=\['[0-9a-zA-Z:]*'\]/g;
    let pattern2 = /_setImgSrc\('(?<num>[^']*)','(?<src>[^']*)'/g;
    const myArray = []
    let groups

    while (groups = pattern2.exec(responseText)) {
        myArray.push(Array.from(groups))
    }

    //console.log(myArray);

    if (myArray.length > 0) {

        let imgsrc;
        for (let i = 0; i < Math.min(getCount, myArray.length); i++) {

            //imgsrc = myArray[i][2].replace(/\\x3d/g, '=');
            imgsrc = myArray[i][2].replace(/\\/g, '');

            let new_li = document.createElement('li');
            let new_a = document.createElement('a');
            let new_imgs = document.createElement('img'); //thumbnail
            let new_divimg = document.createElement('div');
            let new_imgl = document.createElement('img'); //popup large

            new_a.href = "#";
            new_imgs.src = imgsrc;
            new_imgl.src = imgsrc;
            new_divimg.classList.add("preview");
            new_imgl.classList.add("previewimg");

            new_divimg.appendChild(new_imgl);
            new_a.appendChild(new_imgs);
            new_a.appendChild(new_divimg);
            new_li.appendChild(new_a);
            new_div.appendChild(new_li);

            //create 'mouse enter' event (popup large image)
            new_a.addEventListener("mouseenter", function (event) {

                let obj_img = event.target.childNodes[1].firstChild;
                let obj_org = event.target.childNodes[0];

                let rect = obj_img.getBoundingClientRect();
                let rect_org = obj_org.getBoundingClientRect();
                let rect_img = obj_img.getBoundingClientRect();
                let img_right = window.pageXOffset + rect_img.left + rect_img.width;
                let img_bottom = window.pageYOffset + rect_img.top + rect_img.height;

                if (img_right > window.innerWidth) {
                    let new_left = rect_img.left + (window.innerWidth - img_right) - 20;
                    obj_img.parentElement.style = "position:fixed;";
                    obj_img.parentElement.style.left = new_left + "px";
                    obj_img.parentElement.style.top = rect_org.top + 60 + "px";
                }
                else if ((window.innerWidth - img_right) == 20) {
                    obj_img.parentElement.style.left = rect_img.left + "px";
                    obj_img.parentElement.style.top = rect_org.top + 60 + "px";
                }
                else {
                    obj_img.parentElement.style = "position:fixed;";
                    obj_img.parentElement.style.left = rect_img.left + "px";
                    obj_img.parentElement.style.top = rect_org.top + 60 + "px";
                }
            }, false);

        } //for

        let new_li = document.createElement('li');
        let new_more = document.createElement('a');

        new_li.style.backgroundColor = "transparent";
        new_li.style.height = "20px";
        new_li.style.border = "none";
        new_more.href = searchurl;
        new_more.innerText = "more";
        new_more.target = "_blank";

        new_li.appendChild(new_more);
        new_div.appendChild(new_li);
        td_element.appendChild(new_div);

    } else {
        isError = true;
    }

    return isError;
}

//2019.12.09 mode because Google Site Change
function MakeGoogleImageList_20191209(td_element, searchurl, responseText, getCount) {

    var isError = false;

    //parse document
    let parser = new DOMParser();
    let doc = parser.parseFromString(responseText, "text/html");

    //create UI element
    let new_div = document.createElement('ul');
    new_div.classList.add("hoverbox");

    let pattern2 = /s='(?<year>[^']*)';var ii=\['[0-9a-zA-Z:]*'\]/g;
    const myArray = []
    let groups
    while (groups = pattern2.exec(responseText)) {
        myArray.push(Array.from(groups))
    }

    if (myArray.length > 0) {

        let imgsrc;
        for (let i = 0; i < Math.min(getCount, myArray.length); i++) {

            imgsrc = myArray[i][1].replace(/\\x3d/g, '=');

            let new_li = document.createElement('li');
            let new_a = document.createElement('a');
            let new_imgs = document.createElement('img'); //thumbnail
            let new_divimg = document.createElement('div');
            let new_imgl = document.createElement('img'); //popup large

            new_a.href = "#";
            new_imgs.src = imgsrc;
            new_imgl.src = imgsrc;
            new_divimg.classList.add("preview");
            new_imgl.classList.add("previewimg");

            new_divimg.appendChild(new_imgl);
            new_a.appendChild(new_imgs);
            new_a.appendChild(new_divimg);
            new_li.appendChild(new_a);
            new_div.appendChild(new_li);

            //create 'mouse enter' event (popup large image)
            new_a.addEventListener("mouseenter", function (event) {

                let obj_img = event.target.childNodes[1].firstChild;
                let obj_org = event.target.childNodes[0];

                let rect = obj_img.getBoundingClientRect();
                let rect_org = obj_org.getBoundingClientRect();
                let rect_img = obj_img.getBoundingClientRect();
                let img_right = window.pageXOffset + rect_img.left + rect_img.width;
                let img_bottom = window.pageYOffset + rect_img.top + rect_img.height;

                if (img_right > window.innerWidth) {
                    let new_left = rect_img.left + (window.innerWidth - img_right) - 20;
                    obj_img.parentElement.style = "position:fixed;";
                    obj_img.parentElement.style.left = new_left + "px";
                    obj_img.parentElement.style.top = rect_org.top + 60 + "px";
                }
                else if ((window.innerWidth - img_right) == 20) {
                    obj_img.parentElement.style.left = rect_img.left + "px";
                    obj_img.parentElement.style.top = rect_org.top + 60 + "px";
                }
                else {
                    obj_img.parentElement.style = "position:fixed;";
                    obj_img.parentElement.style.left = rect_img.left + "px";
                    obj_img.parentElement.style.top = rect_org.top + 60 + "px";
                }
            }, false);

        } //for

        let new_li = document.createElement('li');
        let new_more = document.createElement('a');

        new_li.style.backgroundColor = "transparent";
        new_li.style.height = "20px";
        new_li.style.border = "none";
        new_more.href = searchurl;
        new_more.innerText = "more";
        new_more.target = "_blank";

        new_li.appendChild(new_more);
        new_div.appendChild(new_li);
        td_element.appendChild(new_div);

    } else {
        isError = true;
    }

    return isError;
}
//2019.12.08 mode
function MakeGoogleImageList_rev2(td_element, searchurl, responseText, getCount) {

    var isError = false;

    //parse document
    let parser = new DOMParser();
    let doc = parser.parseFromString(responseText, "text/html");

    console.log(doc);

    //create UI element
    let new_div = document.createElement('ul');
    new_div.classList.add("hoverbox");

    /*
    let imglistL = doc.querySelectorAll("a.wXeWr.islib.nfEiy.mM5pbd");
    Array.prototype.forEach.call(imglistL, function (el, index) {
        console.log(el);
        let imgsrcL = getImageUrl4Google(el.href);
        console.log(imgsrcL);
    });
    */

    //Get Image Source from Google Serch Results
    let imgsrc;

    
    //let imglist = doc.querySelectorAll("img.rg_i");
    let imglist = doc.querySelectorAll("a.rg_l > img");

    console.log(searchurl);
    console.log(imglist.length);
    console.log(imglist);

    if (imglist.length > 0) {
        //Get Image Source
        for (let i = 0; i < Math.min(getCount, imglist.length); i++) {

            //2019.12.08 mode
            //imgsrc = imglist[i].getAttribute('data-iurl');
            id = imglist[i].getAttribute('id');
            console.log(id);
            imgsrc = getImageBase64(responseText, id);
            console.log(imgsrc);

            let new_li = document.createElement('li');
            let new_a = document.createElement('a');
            let new_imgs = document.createElement('img'); //thumbnail
            let new_divimg = document.createElement('div');
            let new_imgl = document.createElement('img'); //popup large

            new_a.href = "#";
            new_imgs.src = imgsrc;
            new_imgl.src = imgsrc;
            new_divimg.classList.add("preview");
            new_imgl.classList.add("previewimg");

            new_divimg.appendChild(new_imgl);
            new_a.appendChild(new_imgs);
            new_a.appendChild(new_divimg);
            new_li.appendChild(new_a);
            new_div.appendChild(new_li);

            //create 'mouse enter' event (popup large image)
            new_a.addEventListener("mouseenter", function (event) {

                let obj_img = event.target.childNodes[1].firstChild;
                let obj_org = event.target.childNodes[0];

                let rect = obj_img.getBoundingClientRect();
                let rect_org = obj_org.getBoundingClientRect();
                let rect_img = obj_img.getBoundingClientRect();
                let img_right = window.pageXOffset + rect_img.left + rect_img.width;
                let img_bottom = window.pageYOffset + rect_img.top + rect_img.height;

                if (img_right > window.innerWidth) {
                    let new_left = rect_img.left + (window.innerWidth - img_right) - 20;
                    obj_img.parentElement.style = "position:fixed;";
                    obj_img.parentElement.style.left = new_left + "px";
                    obj_img.parentElement.style.top = rect_org.top + 60 + "px";
                }
                else if ((window.innerWidth - img_right) == 20) {
                    obj_img.parentElement.style.left = rect_img.left + "px";
                    obj_img.parentElement.style.top = rect_org.top + 60 + "px";
                }
                else {
                    obj_img.parentElement.style = "position:fixed;";
                    obj_img.parentElement.style.left = rect_img.left + "px";
                    obj_img.parentElement.style.top = rect_org.top + 60 + "px";
                }
            }, false);

        } //for

        let new_li = document.createElement('li');
        let new_more = document.createElement('a');

        new_li.style.backgroundColor = "transparent";
        new_li.style.height = "20px";
        new_li.style.border = "none";
        new_more.href = searchurl;
        new_more.innerText = "more";
        new_more.target = "_blank";

        new_li.appendChild(new_more);
        new_div.appendChild(new_li);
        td_element.appendChild(new_div);

    } else {
        isError = true;
    }

    return isError;
}
function MakeGoogleImageList_rev1(td_element, searchurl, responseText, getCount) {

    var isError = false;

    //parse document
    let parser = new DOMParser();
    let doc = parser.parseFromString(responseText, "text/html");

    console.log(doc);

    //create UI element
    let new_div = document.createElement('ul');
    new_div.classList.add("hoverbox");

    /*
    let imglistL = doc.querySelectorAll("a.wXeWr.islib.nfEiy.mM5pbd");
    Array.prototype.forEach.call(imglistL, function (el, index) {
        console.log(el);
        let imgsrcL = getImageUrl4Google(el.href);
        console.log(imgsrcL);
    });
    */

    //Get Image Source from Google Serch Results
    let imgsrc;

    
    //2019.12.08 mode
    //let imglist = doc.querySelectorAll("img.rg_i");
    let imglist = doc.querySelectorAll("a.rg_l > img");

    console.log(searchurl);
    console.log(imglist.length);
    console.log(imglist);

    if (imglist.length > 0) {
        //Get Image Source
        for (let i = 0; i < Math.min(getCount, imglist.length); i++) {

            //2019.12.08 mode
            //imgsrc = imglist[i].getAttribute('data-iurl');
            id = imglist[i].getAttribute('id');
            console.log(id);
            imgsrc = getImageBase64(responseText, id);
            console.log(imgsrc);

            let new_li = document.createElement('li');
            let new_a = document.createElement('a');
            let new_imgs = document.createElement('img'); //thumbnail
            let new_divimg = document.createElement('div');
            let new_imgl = document.createElement('img'); //popup large

            new_a.href = "#";
            new_imgs.src = imgsrc;
            new_imgl.src = imgsrc;
            new_divimg.classList.add("preview");
            new_imgl.classList.add("previewimg");

            new_divimg.appendChild(new_imgl);
            new_a.appendChild(new_imgs);
            new_a.appendChild(new_divimg);
            new_li.appendChild(new_a);
            new_div.appendChild(new_li);

            //create 'mouse enter' event (popup large image)
            new_a.addEventListener("mouseenter", function (event) {

                let obj_img = event.target.childNodes[1].firstChild;
                let obj_org = event.target.childNodes[0];

                let rect = obj_img.getBoundingClientRect();
                let rect_org = obj_org.getBoundingClientRect();
                let rect_img = obj_img.getBoundingClientRect();
                let img_right = window.pageXOffset + rect_img.left + rect_img.width;
                let img_bottom = window.pageYOffset + rect_img.top + rect_img.height;

                if (img_right > window.innerWidth) {
                    let new_left = rect_img.left + (window.innerWidth - img_right) - 20;
                    obj_img.parentElement.style = "position:fixed;";
                    obj_img.parentElement.style.left = new_left + "px";
                    obj_img.parentElement.style.top = rect_org.top + 60 + "px";
                }
                else if ((window.innerWidth - img_right) == 20) {
                    obj_img.parentElement.style.left = rect_img.left + "px";
                    obj_img.parentElement.style.top = rect_org.top + 60 + "px";
                }
                else {
                    obj_img.parentElement.style = "position:fixed;";
                    obj_img.parentElement.style.left = rect_img.left + "px";
                    obj_img.parentElement.style.top = rect_org.top + 60 + "px";
                }
            }, false);

        } //for

        let new_li = document.createElement('li');
        let new_more = document.createElement('a');

        new_li.style.backgroundColor = "transparent";
        new_li.style.height = "20px";
        new_li.style.border = "none";
        new_more.href = searchurl;
        new_more.innerText = "more";
        new_more.target = "_blank";

        new_li.appendChild(new_more);
        new_div.appendChild(new_li);
        td_element.appendChild(new_div);

    } else {
        isError = true;
    }

    return isError;
}

function getImageBase64(text, id) {

    console.log("getImageBase64:" + text);
    console.log("id:" + id);

    //const regexp = /document\.getElementById\(\"soDaBug\"\)\.src = \"([^\"]+)\"/
    //   s='([^']*)';var ii=\['YbLqgJQ3LoUwgM:'\]

    let  regexp = new RegExp ("s='([^']*)';var ii=\\['" + id + "'\\]");
    const myArray = text.match(regexp);

    console.log(myArray);
    if (myArray) {
        //let retval = myArray[1].replace("\x3d", "=")
        
        let result = myArray[1].replace(/\\x3d/g, '=');
        //let result = decodeURIComponent(myArray[1]);

        console.log(result);
        return result;

    }
}

function getImageUrl4Google(linktext) {
    const regexp = /imgurl=([^&]+)/
    const myArray = linktext.match(regexp);

    if (myArray) {
        let result = myArray[1];
        //let retval = decodeURIComponent(myArray[1]);

        console.log(result);
        return result;
    }
}

function GetDmmImageTitle(td_element, searchurl) {
    GM_xmlhttpRequest({
        method: "GET",
        url: searchurl,
        synchronous: true,
        header: {
            "User-Agent": "Mozilla/5.0",
        },
        onload: function (response) {

            var isError = false;

            if (response.status == 200) {
                isError = MakeDmmImageTitle(td_element, searchurl, response.responseText);
            } else {
                isError = true;
            }

            if (isError) {
                let new_err = document.createElement('a');
                new_err.href = searchurl;
                new_err.innerText = "Error in dmm search request."; //google_searchurl;
                new_err.target = "_blank";
                td_element.appendChild(new_err);

                let new_anchor = document.createElement('a');
                new_anchor.href = searchurl;
                new_anchor.innerText = "Go DMM";
                new_anchor.target = "_blank";
                td_element.appendChild(new_anchor);

                td_element.align = "left";
                
            }
        }
    });
}
function MakeDmmImageTitle(td_element, searchurl, responseText) {

    var isError = false;
    let obj = JSON.parse(responseText);

    if (obj.result.result_count > 0) {

        for (let i = 0; i < Math.min(obj.result.result_count, 1); i++) {

            let new_div = document.createElement('ul');
            let new_li = document.createElement('li');
            let new_a = document.createElement('a');
            let new_imgs = document.createElement('img');
            let new_divimg = document.createElement('div');
            let new_imgl = document.createElement('img');

            new_div.classList.add("hoverbox_dmm");
            new_a.href = "#";
            new_imgs.classList.add("img_dmm");
            new_imgs.src = obj.result.items[i].imageURL.large;
            new_divimg.classList.add("preview");
            new_imgl.classList.add("img_dmm_previewimg");
            new_imgl.src = obj.result.items[i].imageURL.large;

            new_divimg.appendChild(new_imgl);
            new_a.appendChild(new_imgs);
            new_a.appendChild(new_divimg);
            new_li.appendChild(new_a);
            new_div.appendChild(new_li);
            td_element.appendChild(new_div)

        }
    }
    else {
        isError = true;
    }

    return isError;
}

function GetDetailImageTitle_sis001(td_element, titletag, seearchurl) {
    GM_xmlhttpRequest({
        method: "GET",
        url: seearchurl,
        synchronous: true,
        header: {
            "User-Agent": "Mozilla/5.0",
        },
        onload: function (response) {

            var isError = false;

            if (response.status == 200) {
                isError = MakeDetailImageTitle_sis001(td_element, titletag, seearchurl, response.responseText);
            } else {
                isError = true;
            }

            if (isError) {
                var new_err = document.createElement('a');
                new_err.href = seearchurl;
                new_err.innerText = "Error request.";
                new_err.target = "_blank";
                td_element.appendChild(new_err);
                td_element.align = "left";
            }
        }
    });

}
function MakeDetailImageTitle_sis001(td_element, dllink_element, searchurl, responseText) {
    var isError = false;

    //parse document
    let parser = new DOMParser();
    let doc = parser.parseFromString(responseText, "text/html");

    /* Read Image */
    {
        //create UI element
        let new_div = document.createElement('ul');
        new_div.classList.add("hoverbox_dmm");

        //Get Image Source from Google Serch Results
        let imglist = doc.querySelector("div[id^='postmessage_']").querySelectorAll('img')
        if (imglist.length > 0) {
            Array.prototype.forEach.call(imglist, function (el, index) {
                //not gif
                if (el.src.slice(-4) != ".gif") {
                    let new_li = document.createElement('li');
                    let new_a = document.createElement('a');
                    let new_imgs = document.createElement('img');
                    let new_divimg = document.createElement('div');
                    let new_imgl = document.createElement('img');

                    new_a.href = "#";
                    new_imgs.classList.add("img_dmm");
                    new_imgs.src = el.src;
                    new_divimg.classList.add("preview");
                    new_imgl.classList.add("img_dmm_previewimg");
                    new_imgl.src = el.src;

                    new_divimg.appendChild(new_imgl);
                    new_a.appendChild(new_imgs);
                    new_a.appendChild(new_divimg);
                    new_li.appendChild(new_a);
                    new_div.appendChild(new_li);
                }
            });
            td_element.appendChild(new_div)
        } else {
            isError = true;
        }
    }

    /* Read Torrent */
    {
        let dl_icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEE0lEQVRIibWVWWhcZRTH/+ebe2fuTCZOW7uEloY2JkFDqOkgFhRLUITqgxKsLwmh6kM1Fo0U6YPQiqIoVI0W61YLCYn2IbZUoVRUtEWoWg2kMWk1o2nWNhvNZJk7dz8+3KUzmaTqQ89w4VvOOb/vLN83wE0WutGmECHc/8hjInnPfZtIkmtsByUAECJMsm1293WdHzjd+bnjOPb/B+zed0ApunXdE5pp7jFtp9o0rbx9WZIgS6GLiix9qM5Mf/rxmy9r/wlARHjhjUPJrGm3a4ZZxcwgEECcr8i+NUGRpf5oWGp876Xm847jLA8gIjz32rs7MobVaTtOfNm4lwCFhFCjcqjhgwN7T+ZC8gB7Xn07qdl81vKcEwjMjFWJYtxRVprn98KfA8ioWYDI47ALkcQDh/fv/bkA0Pj8PiWycm2XaTtVi9E1lbehuaEuD/DKR+0YvDqxKBqCFKK/7PmZO1vfeV0FAAEAQghEEqufMm2niohARCAQiN0vN4VEOXP29PwfAZbtlIeKEs8IIRAAtmy7V1jMTRSE637eoZaXnMKzZ0EAbOamu2sfFAGgYuu2MpCo9l0TM8AMBwxmDoyZ3bk7BhwGHG8tOAcBIFG+qXprFQBIACApsaTfjuwpRSQJu3c+jI0laxCW5SBFPqi5oQ6WbaF/aAytX34D2+scBgHMIDmSBNArvMUSIrfXyTuebplo/epbaLqJRLwIRBREQERYeUsc6bkMPjv1PSzbDqIE2L8f64MUOY4tgqyT23kEYEFV8VZbJ0bGp4LU+BGkhsfQ0nECmqGDcu4heaXxnw8BAIamjTNfryiD3FBBmFOzOOhBfOkfGkNL+3FkDSPQZSIw+7aAoevjAeDa+JVu8OKn4Pp8PqMGkP6hMbR0HEdWN7xm8HXZu3Ou3ez0RLcfERKr10oP7Xq2T4nFKuEVyY83eHIAxGMxWJYNzdBRIH53gKFr2eHvjh2tmBobNiSXNmllZmeORKKxg/4DFpZDSMSLCh2FZcRjSt7SzNwCLNsBeWfLzKaPTI0NG4DXpgDwR9dPnyRrdzRF48VlDKCidANe3PV4IWAJ2X+4DaMTUwAIupoZTl349X1/L++ebq+rr91YWXVaCoeVFfEi3L65tMDZUtLTfxmqrsE2TGMkdenRsyc6vl4SAAC1Oxvr15dVHpXDikK5u5xjkTv29kxDN65cTj39Q2dba66/0GLA4MWe3+OJVb9EYrHt4YiyIvBJBCK3a9wxAHavV2Y2PTqS6qv/8eSxLxb7KwAAwGjq0sBC+lq7JId1IcTmkCwnhBDuU+FV0rYsLMymR6dGBw/1njvzZO+5Mz1L+brhnz4AROPFSvmWu2oSa9bVRJToBgAwtOzV9PRk9989v3Wr83Pqv/m4qfIPzeTiA5qESWYAAAAASUVORK5CYII="

        let attachlist = doc.querySelectorAll('a[href^="attachment.php"]')
        Array.prototype.forEach.call(attachlist, function (el, index) {

            GM_xmlhttpRequest({
                method: "GET",
                url: el.href,
                synchronous: true,
                header: {
                    "User-Agent": "gmonkeyagent",
                },
                onload: function (response) {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(response.responseText, "text/html");
                    let dllink = doc.querySelector("body > div:nth-child(2) > div > a");

                    let new_anchor = document.createElement('a');
                    let new_img = document.createElement('img')

                    new_anchor.href = dllink.href;
                    new_img.src = dl_icon;
                    new_anchor.target = "_blank";

                    new_anchor.appendChild(new_img);

                    dllink_element.parentNode.insertBefore(new_anchor, dllink_element.nextSibling);
                }
            });
        });
    }

    return isError;
}

function GetProductId(str) {
    let ret;
    ret = str.match(/[3]*[a-zA-Z]+[-]*\d{2,5}/);
    return ret;
}

/*
タイトル文字列から検索に不要な文字を削除する
*/
function ArrangeTitle(title){

    console.log("title  :" + title);

    let ret = title;
    id = GetProductId(title);
    ret = ret.replace('###', '');
    ret = ret.replace('+++', '');
    ret = ret.replace('III-NEW-III ', '');
    let myArray = ret.split(/\[[^\]]+\]/).filter(str => str);
    ret = myArray.join(" ")
    myArray = ret.split(/【[^】]+】/).filter(str => str);
    ret = myArray.join(" ")

    arranged = ret.trim();

    ret = id + " " + arranged;

 //   console.log("title->:" + ret);

    return [ret, arranged, id];
}
// detailType= dmm  detail  detail_link
function CreateImageElements(document, classNameRow, classNameAnchor, colspanCoverimg, colspanThumbimg, startNo, endNo, detailType) {

    console.log("CreateImageElements");
    let cnt = 0;
    let list = document.querySelectorAll(classNameRow);

    list.forEach(function (e, index, array) {


        if (index >= startNo && index <= endNo) {
            cnt = cnt + 1;

            let titletag = e.querySelector(classNameAnchor);

            titletag.target = "_blank";
            
            let [keyword,arranged,id] = ArrangeTitle(titletag.textContent);

            console.log("keyword:"+keyword);
            console.log("arranged:"+arranged);
            console.log("id"+id);
            let dmm_keyword = "";
            if (arranged.indexOf(' ') > 2) {
                dmm_keyword = arranged.substr(arranged.indexOf(' ') + 1);
            }
            else {
                dmm_keyword = arranged;
            }
            dmm_keyword = encodeURI(dmm_keyword);

            let dmm_appid = "tgtffqLHzh222mT2sN59";
            let dmm_affiliateid = "motopixie-991";
            let dmm_searchurl = "https://api.dmm.com/affiliate/v3/ItemList?api_id=" + dmm_appid + "&affiliate_id=" + dmm_affiliateid + "&site=FANZA&hits=10&sort=date&keyword=" + dmm_keyword + "&output=json";
            let dmm_searchurl2 = "https://www.dmm.co.jp/search/=/searchstr=" + dmm_keyword;

            let google_keyword = encodeURI(arranged);
            let google_searchurl = "https://www.google.com/search?q=" + google_keyword + "&tbm=isch";

            var detail_url = titletag.href;

            console.log(arranged);
            console.log("detail:" + detail_url);
            console.log("dmm:" + dmm_searchurl);
            console.log("google:" + google_searchurl);

            //要素の作成
            let new_tr = document.createElement('tr');
            let new_coverimg_td = document.createElement('td');
            new_coverimg_td.colSpan = colspanCoverimg;
            //new_coverimg_td.align = "right";
            new_coverimg_td.classList.add("tmp_cover");

            let new_thumbimg_td = document.createElement('td');
            new_thumbimg_td.colSpan = colspanThumbimg;
            new_thumbimg_td.align = "center";
            new_thumbimg_td.classList.add("tmp_gthumbnail");
            new_tr.appendChild(new_coverimg_td);
            new_tr.appendChild(new_thumbimg_td);
            e.parentNode.insertBefore(new_tr, e.nextSibling);

            switch (detailType) {
                case "dmm":
                        setTimeout(
                            GetDmmImageTitle(new_coverimg_td, dmm_searchurl)
                            , interval * cnt);
                    break;
                case "detail":
                        setTimeout(
                            GetDetailImageTitle_sis001(new_coverimg_td, titletag, detail_url)
                            , interval * cnt);
                    break;
                case "detail_link":
                    break;
            }

            //Google
            setTimeout(
                GetGoogleImageList(new_thumbimg_td, google_searchurl, getGoogle)
                , interval * cnt + 500);
        }
    });
}

function AddStyle() {

    GM_addStyle(`
         .hoverbox_dmm {
            cursor: default;
            list-style: none;
        }
         .hoverbox_dmm ul {
            list-style: none outside none;
            float: left;
            margin: 0 0 0 0;
            padding: 0;
            display: flex;
            justify-content: center;
        }
         .hoverbox_dmm li {
            background: #444;
            border-color: #ddd #bbb #aaa #ccc;
            border-style: solid;
            border-width: 1px;
            color: inherit;
            align: left; 
            margin: 1px;
            padding: 1px;
            position: relative;
            width:165px;
        }
         .hoverbox_dmm a .preview {
            display: none;
        }
         .hoverbox_dmm a:hover .preview {
            display: block;
            z-index:100;
        }
         .hoverbox_dmm .img_dmm { /* left side cover image */
            position:relative;
            -ms-interpolation-mode: bicubic;
            width: 400px;
            max-height: 400px;
	        object-fit:cover;
            object-position: top left;
        }
         .hoverbox_dmm .preview { /* preview image DIV */
            position: absolute;
            top: 60px;
            left: 50px;
            overflow: auto;
            max-height: 600px;
            width: 850px;
        }
         .hoverbox_dmm .img_dmm_previewimg { /* preview image IMG */
            text-align:right;
            border-color: #000;
            max-width:800px;
            width: auto; height: auto;
            border-color: white;
            border-width: medium;
            border-style: ridge;
        }
         .cover {
            vertical-align:top
        }
    ` );

    GM_addStyle(`
        .hoverbox {
            cursor: default;
            list-style: none;
        }
        .hoverbox a .preview {
            display: none;
        }
        .hoverbox a:hover .preview {
            display: block;
            z-index:100;
        }
        .hoverbox ul {
            list-style: none outside none;
            float: left;
            margin: 0 0 0 0;
            padding: 0;
            display: flex;
            justify-content: center;
        }
        .hoverbox li {
            background: #444;
            border-color: #ddd #bbb #aaa #ccc;
            border-style: solid;
            border-width: 1px;
            color: inherit;
            float: left;
            margin: 1px;
            padding: 1px;
            position: relative;
            width:165px;
            height:100px;
        }
        .hoverbox img {
            background: #444;
            border-color: #444;
            border-style: solid;
            border-width: 0px;
            color: inherit;
            padding: 1px;
            vertical-align: middle;
            max-width:165px;
            max-height:100px;
            width: auto;
            height: auto;
        }
        .hoverbox .preview {
            position:absolute;
            top:60px;
            left:0px
        }
        .hoverbox .previewimg {
            text-align:right;
            border-color: #000;
            max-width:600px;
            max-height:800px;
            width: auto;
            height: auto;
        }

    ` );

    GM_addStyle(`
        #nextbutton {
            position:fixed;
            bottom:10px;
            right:10px;
            font-size:16px;
            background-color: green;
            border:3px outset black;
            margin:5px;
            opacity:0.9;
            z-index:1100;
            padding:5px 20px;
        }
        td.tmp_cover {
            left:50px;
            width:350px;
            max-width:350px;
            white-space: normal;
            overflow: visible !important;
            text-align:right;
            padding-left: 20px !important;
        }
        td.tmp_gthumbnail {
            overflow: visible !important;
        }"
    ` );
}