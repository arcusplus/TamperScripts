
var nowPos = 0;
var readStep = 10;
var interval = 300;
var getGoogle = 9;


function getFromTable() {
    console.log("getFromTable");
    var counter = 0;
    var line    = [];
    $("table tbody tr").map(function(index, val){
      line[counter] = {"date":$(val).children().eq(0).text()
                  , "name":$(val).children().eq(1).text()
                  , "price":$(val).children().eq(2).text()};
      counter += 1;
    });
    
    //配列形式
    console.log(line);
    //JSON形式
    console.log(JSON.stringify(line));
  }

function ReadNext() {
    ReadImage(readStep);
}
function ReadImage(readCnt) {
    var startNo = nowPos; //初期値0
    var endNo = nowPos + readCnt - 1; //初期値0 + 20 -1 = 19;
    nowPos = endNo + 1;

    console.log("START:" + startNo);
    console.log("END  :" + endNo);

    CreateImageElements(document, "tr.tmp-title-row", "a.tmp-title-anchor", 3, 6, startNo, endNo, "dmm");
}

function getImageUrl_Imglink(text) {

    console.log("getImageUrl_Imglink:" + text);

    const regexp = /document\.getElementById\(\"soDaBug\"\)\.src = \"([^\"]+)\"/
    const myArray = text.match(regexp);

    console.log(myArray);
    if (myArray) {
        console.log(decodeURIComponent(myArray[1]));
        return decodeURIComponent(myArray[1]);
    }
}

(function () {

    //add style sheet
    AddStyle();
    

    if (window.location.href.match(/view/)) {

        GM_addStyle(`
        #torrent-description img {
            max-width: 200% !important;
        }
        `);

        const vegetable = {
            'img169.com': {
                target_tag: 'img',
                replace_protocol: 'http',
            },
        };
        const fruits = {
            'imageshtorm.com': {
                query_method: 'POST',
                target_tag: '#image_details',
                target_type: 'parent',
                post_param: 'imgContinue'
            },
            'xxxwebdlxxx.org': {
                query_method: 'POST',
                target_tag: '#image_details',
                target_type: 'parent',
                post_param: 'imgContinue'
            },
            'ecoimages.xyz': {
                query_method: 'POST',
                target_tag: '#image_details',
                target_type: 'parent',
                post_param: 'imgContinue'
            },
            'dalezobux.xyz': {
                query_method: 'POST',
                target_tag: '#container > a > img',
                target_type: 'itself',
                post_param: 'imgContinue'
            },
            'imgdawgknuttz.com': {
                query_method: 'GET',
                target_tag: '#image_details',
                target_type: 'parent',
            },
            'imgblaze.net': {
                query_method: 'GET',
                replace_domain: 'imgsky.net',
                replace_protocol: 'http',
                target_type: 'function',
                function_call: 'getImageUrl_Imglink',
            },
            'imgflare.com': {
                query_method: 'GET',
                target_tag: '#this_image',
                target_type: 'itself',
            },
            '365shares.net': {
                query_method: 'GET',
                target_tag: '#body > p > img',
                target_type: 'itself',
            },
            'imagetwist.com': {
                query_method: 'GET',
                target_tag: '#body > p > img',
                target_type: 'itself',
            },
            'img599.net': {
                query_method: 'GET',
                target_tag: '#image-viewer-container > img',
                target_type: 'itself',
            },
            'picbaron.com': {
                query_method: 'POST',
                target_tag: 'body > img',
                target_type: 'itself',
                post_param: 'imgContinue'
            },
            'uvonahaze.xyz': {
                query_method: 'POST',
                target_tag: '#image_details',
                target_type: 'parent',
                post_param: 'imgContinue'
            },
            'imgdrive.net': {
                query_method: 'GET',
                target_tag: '#container > div.left-column > div.showcase > a > img',
                target_type: 'itself',
            },
            'imagexport.com': {
                query_method: 'GET',
                target_tag: '#container > div.left-column > div.showcase > a > img',
                target_type: 'itself',
            },
        };

        let imglist = document.querySelector("#torrent-description").querySelectorAll('a');
        Array.prototype.forEach.call(imglist, function (el, index) {

            let _data = new FormData();
            let target_url = el.href;
            let domain = GetDomain(target_url);
            let parsed_url = parseURL(target_url);
            let target_tag = "";
            let target_type = "";
            let query_method = "GET";

            let new_ul = document.createElement('ul');

            console.log("<" + domain + ">");

            if (vegetable[domain]) {

                target_tag = vegetable[domain]["target_tag"];
                img_link = el.querySelector(target_tag).src;
                console.log("img_link:" + img_link);
                console.log(img_link);
                if (img_link != "") {

                    let parsed_url = parseURL(img_link);
                    if (vegetable[domain]["replace_protocol"]) {
                        img_link = img_link.replace(parsed_url.protocol, vegetable[domain]["replace_protocol"]);
                    }

                    let new_li = document.createElement('li');
                    let new_a = document.createElement('a');
                    let new_imgs = document.createElement('img');
                    let new_ulimg = document.createElement('div');
                    let new_imgl = document.createElement('img');
                    new_a.href = "#";
                    new_ul.classList.add("hoverbox_dmm");
                    new_imgs.classList.add("img_dmm");
                    new_ulimg.classList.add("preview");
                    new_imgl.classList.add("img_dmm_previewimg");

                    toBase64Url2(img_link, function (base64Url) {
                        new_imgs.src = base64Url;
                        new_imgl.src = base64Url;
                    });

                    new_ulimg.appendChild(new_imgl);
                    new_a.appendChild(new_imgs);
                    new_a.appendChild(new_ulimg);
                    new_li.appendChild(new_a);
                    new_ul.appendChild(new_li);

                }
            }
            else if (fruits[domain]) {
                target_tag = fruits[domain]["target_tag"];
                target_type = fruits[domain]["target_type"];
                query_method = fruits[domain]["query_method"];
                console.log(parsed_url.protocol);
                console.log(target_tag);
                console.log(target_type);
                console.log(query_method);
                console.log(fruits[domain]["post_param"]);

                //add POST parameter
                _data.append(fruits[domain]["post_param"], "");

                if (domain == "picbaron.com") {
                    _data.append("op", "view");
                    _data.append("id", target_url.split('/').slice(3, -1));
                    _data.append("pre", "1");
                }

                //Change Url Domain
                if (fruits[domain]["replace_domain"]) {
                    target_url = target_url.replace(parsed_url.root_domain, fruits[domain]["replace_domain"]);
                }
                if (fruits[domain]["replace_protocol"]) {
                    target_url = target_url.replace(parsed_url.protocol, fruits[domain]["replace_protocol"]);
                }

                GM_xmlhttpRequest({
                    method: query_method,
                    url: target_url,
                    synchronous: true,
                    headers: {
                        'Referer': parsed_url.protocol + '://' + domain + '/',
                        'Cookie': 'sucuri_cloudproxy_uuid_a7d058878=07e727a1b141883146f949300407b0a4; PHPSESSID=q69jqk3aer251oak2fautinm36; ibpuc=1369896266-ee0894721970fc21258ea148f433f4f8; img_c_d=3-1575084782; blkpop=49%3D1575084782%2C54%3D-1%2C52%3D1575171053%2C10%3D1575171044%2C56%3D-1; img_i_d=1'
                    },
                    data: _data,
                    onload: function (response) {
                        let parser = new DOMParser();
                        let doc = parser.parseFromString(response.responseText, "text/html");

                        console.log("▼");
                        console.log(target_url);
                        console.log(doc);
                        var img_link = '';

                        switch (target_type) {
                            case "itself":
                                img_link = doc.querySelector(target_tag).src;
                                break;

                            case "parent":
                                img_link = doc.querySelector(target_tag).parentNode.querySelector("img").src;
                                break;

                            case "function":
                                console.log("■■ Function ■■");
                                //img_link = getImageUrl_Imglink(response.responseText);
                                eval('img_link = ' + fruits[domain]["function_call"] + '(response.responseText)');

                                // let func_name = 'getImageUrl_Imglink';
                                // let func_obj = new Function(this, 'x', "return this." + func_name + "(x)");
                                // func_obj(response.responseText);
                                // img_link = func_obj(response.responseText);

                                //var Callback = new Function('x', 'return ' + fruits[domain]["function_call"] + ';');
                                //img_link = Callback(response.responseText);
                                break;

                        }

                        // switch (parsed_url.root_domain) {
                        //     case "365shares.net":
                        //         img_link = doc.querySelector("#body > p > img").src;
                        //         break;

                        //     case "imgbabes.com":
                        //         img_link = doc.querySelector("#this_image").src;

                        //         if (img_link == null) {
                        //             var btn = doc.querySelector("body > center > div > input[type=submit]:nth-child(1)");
                        //             console.log("btn:" + btn.getAttribute("onclick"));
                        //             btn.click();
                        //         }
                        //         break;

                        //     case "imgflare.com":
                        //         img_link = doc.querySelector("#this_image").src;
                        //         break;

                        //     case "imagetwist.com":
                        //         img_link = doc.querySelector("#body > p > img").src;
                        //         //                                                     history.pushState(null,null,"list.php");
                        //         break;

                        //     case "imgflare.com":
                        //         img_link = doc.querySelector("#this_image").src;
                        //         break;

                        //     case "img599.net":
                        //         img_link = doc.querySelector("#image-viewer-container > img").src;
                        //         break;

                        //     case "imgblaze.net":
                        //         img_link = getImageUrl_Imglink(response.responseText);
                        //         break;

                        //     case "imageshtorm.com":
                        //         // img_link = doc.querySelector("body > center > center > center > center > center > center > center > center > img").src;
                        //         img_link = doc.querySelector("#image_details").parentNode.querySelector("img").src;;
                        //         break;

                        //     case "xxxwebdlxxx.org":
                        //         // img_link = doc.querySelector("body > center > center > a > img").src;
                        //         console.log(doc.querySelector("#image_details").parentNode);
                        //         img_link = doc.querySelector("#image_details").parentNode.querySelector("img").src;;
                        //         break;

                        //     case "imgdawgknuttz.com":
                        //         img_link = doc.querySelector("#image_details").nextElementSibling.nextElementSibling.src;
                        //         break;

                        //     case "ecoimages.xyz":
                        //         img_link = doc.querySelector("#container > img").src;
                        //         break;

                        //     case "dalezobux.xyz":
                        //         img_link = doc.querySelector("#container > a > img").src;
                        //         break;

                        //     default:
                        //         console.log("[ERROR]UNKNOWN DOMAIN:" + domain);
                        //         console.log("URL:" + target_url);
                        // }

                        console.log("▲");

                        console.log("img_link:" + img_link);
                        if (img_link != "") {

                            let new_li = document.createElement('li');
                            let new_a = document.createElement('a');
                            let new_imgs = document.createElement('img');
                            let new_ulimg = document.createElement('div');
                            let new_imgl = document.createElement('img');
                            new_a.href = "#";
                            new_ul.classList.add("hoverbox_dmm");
                            new_imgs.classList.add("img_dmm");
                            new_ulimg.classList.add("preview");
                            new_imgl.classList.add("img_dmm_previewimg");

                            toBase64Url2(img_link, function (base64Url) {
                                new_imgs.src = base64Url;
                                new_imgl.src = base64Url;
                                // console.log('base64Url : ', base64Url);
                                // console.log("img:" + new_imgs);
                                // console.log("img.src" + new_imgs.src);
                            });

                            new_ulimg.appendChild(new_imgl);
                            new_a.appendChild(new_imgs);
                            new_a.appendChild(new_ulimg);
                            new_li.appendChild(new_a);
                            new_ul.appendChild(new_li);

                        }
                        //                                             titletag.parentNode.insertBefore(new_anchor, titletag.nextSibling);
                    }
                });

                el.appendChild(new_ul);

            } else {
                console.log("[ERROR]UNKNOWN DOMAIN:" + domain);
                //         console.log("URL:" + target_url);
                var element = document.createElement("div");
                ElementSetTextContent(element, "[ERROR]UNKNOWN DOMAIN:" + domain);
                el.parentElement.insertBefore(element, el.nextSibling)
            }


        });

    } else {

        console.log("▲");
        debugger;
        getFromTable();

        //add style sheet
        AddStyle();

        //overwrite style
        GM_addStyle(".torrent-list > tbody > tr > td {max-width:350px;}");
        GM_addStyle(`.table>tbody>tr>td,.table>tbody>tr>th,.table>tfoot>tr>td,.table>tfoot>tr>th,.table>thead>tr>td,.table>thead>tr>th{padding: 0px; } `);
        GM_addStyle("ul{margin-top:0; margin-bottom:0px; padding: 0px;}");
        GM_addStyle(".hdr-name {width:100px !important;}");

        //set class for this userscript
        let trlist = document.querySelectorAll("tr.default, tr.success");
        trlist.forEach(function (e, index, array) {
            e.classList.add("tmp-title-row");
        });
        let titlelist = document.querySelectorAll("tr.tmp-title-row > td:nth-child(2) > a");
        titlelist.forEach(function (e, index, array) {
            e.classList.add("tmp-title-anchor");
        });

        //read image
        ReadNext();
        //show next button
        AddNextButton();
    }

})();