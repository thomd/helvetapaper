// ==UserScript==
// @name          Helvetipaper
// @namespace     http://thomd.net/userscript
// @description   A minimalistic theme for Instapaper (inspired by http://www.helvetireader.com/)
// @include       http://instapaper.com/*
// @include       http://*.instapaper.com/*
// @author        Thomas Duerr
// @version       0.10
// @date          2010-03-23
// @change        created.
// ==/UserScript==



//
// xpath helper
//
// if you want to evaluate XPath expressions on the document of an iframe, then you need to use the iframe's document object and call evaluate on it.
//
$x = function(p, context){
    var contextNode = context || document;
    var i, arr = [], xpr = document.evaluate(p, contextNode, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    for (i = 0; item = xpr.snapshotItem(i); i++) arr.push(item);
    return arr;
}


//
// xpath helper for iframes (if you want to evaluate XPath expressions on the document of an iframe, then you need to use the iframe's document object and call evaluate on it)
//
$ix = function(p, document_object, context){
    var document_object = document_object || document;
    var contextNode = context || document_object;
    var i, arr = [], xpr = document_object.evaluate(p, contextNode, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    for (i = 0; item = xpr.snapshotItem(i); i++) arr.push(item);
    return arr;
}


//
// css helper
//
var attachCSS = function(css){
    if(GM_addStyle){
        GM_addStyle(css);
    } else {
		var head = document.getElementsByTagName("head")[0];
		var style = document.createElement("style");
		style.type = "text/css";
		style.appendChild(document.createTextNode(css));
		head.appendChild(style); 
    }
}




//
// DOM MANIPULATION
//
;(function(){

    // do not run inside an iframe
    if(top != window) return;
    
    
    //
    // SOME HELPER NODES
    //
    var body = $x('//body')[0];
    var header = $x('//*[@id="header"]')[0];
    var logo = $x('//*[@id="logo"]')[0];
    var title = $x('//*[@id="logo"]/a')[0];
    var navigation = $x('//*[@id="categoryHeader"]')[0];
    var currentpage_count = $x('//*[@id="bookmark_list"]//div[@class="titleRow"]').length;
    var username = $x('//div[@id="userpanel"]/b/text()')[0].nodeValue;
    var logout_link = $x('//div[@id="userpanel"]/a')[2];
    var nav_links = $x('//h2[@id="categoryHeader"]/a');
    var rss = $x('//link[@rel="alternate"]')[0];
    var footer = $x('//div[@id="footer"]/div')[0];


    //
    // FOOTER (at bottom of page)
    //
    // add footnote-asterisk to title
    title.appendChild(document.createTextNode(".*"));
    title.setAttribute("href", "#bottom");

    // remove hints
    var hint = $x('//*[@id="bookmark_list"]/following-sibling::div[position()=1]')[0];
    if(hint != undefined){
        hint.style.display = "none";
    }

    // set new footer
    var bottom = document.createElement("div");
    bottom.setAttribute("id", "bottom");
    bottom.appendChild(footer);

    // extend footer with some promotions
    bottom.firstChild.appendChild(document.createElement("br"));
    var ad1 = document.createElement("a");
    ad1.setAttribute("href", "http://thomd.github.com/helvetipaper");
    ad1.setAttribute("class", "gh-page");
    ad1.appendChild(document.createTextNode("* Helvetica Theme"));
    bottom.firstChild.appendChild(ad1);
    bottom.firstChild.appendChild(document.createTextNode(" 2010 by "));
    var ad2 = document.createElement("a");
    ad2.setAttribute("href", "http://thomd.net");
    ad2.appendChild(document.createTextNode("thomd"));
    bottom.firstChild.appendChild(ad2);
    bottom.firstChild.appendChild(document.createTextNode(". Contact: "));
    var ad3 = document.createElement("a");
    ad3.setAttribute("href", "mailto:helvetipaper@thomd.net");
    ad3.appendChild(document.createTextNode("helvetipaper@thomd.net"));
    bottom.firstChild.appendChild(ad3);
    bottom.firstChild.appendChild(document.createTextNode("."));
    body.appendChild(bottom);


    //
    // USERDATA (at top-right of page)
    //
    var userdata = document.createElement("div");
    userdata.setAttribute("id", "userdata");
    var username_span = document.createElement("span");
    username_span.appendChild(document.createTextNode(username));
    userdata.appendChild(username_span);
    logout_link.replaceChild(document.createTextNode("logout"), logout_link.firstChild);
    userdata.appendChild(logout_link);
    header.insertBefore(userdata, logo);


    //
    // CHANGE STRUCTURE OF EVERY PAGE-LINK
    //
    var links = $x('//div[@id="bookmark_list"]//div[starts-with(@id,"tableViewCell")]');
    if(links.length > 0){
        for(i in links){
            var link = links[i];

            // page URL
            var page = $x('.//*[@class="titleRow"]/a', link)[0];
            if(page == undefined) continue;
            var title = page.getAttribute("title");
            var url = document.createElement("div");
            url.setAttribute("class", "titleUrl");
            url.appendChild(document.createTextNode(title));
            page.parentNode.insertBefore(url, page.nextSibling);
        
        
            // action links (edit, delete)
            var controls = $x('.//*[@class="cornerControls"]', link)[0];
            var edit = $x('.//*[@class="secondaryControls"]/a[position()=1]', link)[0];
            if(edit != undefined){
                controls.appendChild(edit);
            }
            var del = $x('.//*[@class="secondaryControls"]/a[last()]', link)[0];
            if(del != undefined){
                controls.appendChild(del);
            }


            // starring
            var unstarred = $x('.//*[@class="starToggleUnstarred"]', link)[0];
            unstarred.replaceChild(document.createTextNode("\u2605"), unstarred.firstChild);
            page.parentNode.insertBefore(unstarred, page);

            var starred = $x('.//*[@class="starToggleStarred"]', link)[0];
            starred.replaceChild(document.createTextNode("\u2605"), starred.firstChild);
            page.parentNode.insertBefore(starred, page);

            var progress = $x('.//*[@class="starToggleProgress"]', link)[0];
            page.parentNode.insertBefore(progress, page);
        }
    }


    //
    // CREATE CATEGORY LINKS
    //
    // fetch count-data from category pages via temporary iframes
    var setCounts = function(href){
        if(top != window) return;    
        var iframe = document.createElement("iframe");
        iframe.setAttribute("src", "http://www.instapaper.com" + href.getAttribute("href"));
        iframe.addEventListener("load", function(ev){
            var count = $ix('//*[@id="bookmark_list"]//div[@class="titleRow"]', this.contentDocument).length;
            if(count > 0){
               var counter = document.createElement("sup");
                counter.appendChild(document.createTextNode(count));
                href.appendChild(counter);
            }
            body.removeChild(iframe);
        }, false);
        body.appendChild(iframe);
    }
	
    // determine number of links on current page
    if(currentpage_count > 0){
        var counter = document.createElement("sup");
        counter.appendChild(document.createTextNode(currentpage_count));
        navigation.appendChild(counter);
    }

    // category pages
    for(var i = 0, n = nav_links.length; i < n; i++){
        navigation.appendChild((function(){
            var href = nav_links[i];
        	setCounts(href);
            var category = document.createElement("div");
            category.setAttribute("class", "categorylink");
            category.appendChild(nav_links[i]);    
            return category;
        })());
    }


    //
    // NEW-FLAG
    //
    // put a 'New'-flag on new links from within the last three days. 
    // For this the RSS feed is parsed.
    //
	var timeslot = 1000*60*60*24*3;
	
    var parseRssFeed = function(response){
        if (!response.responseXML) {
            response.responseXML = new DOMParser().parseFromString(response.responseText, "text/xml");
        }
        var items = response.responseXML.getElementsByTagName("item");
        var newLinks = [];
        for(var i = 0, l = items.length; i < l; i++){
            var pubDate = items[i].getElementsByTagName("pubDate")[0].textContent;
            if((+new Date()) - (+new Date(pubDate)) < timeslot){
                var guid = items[i].getElementsByTagName("guid")[0].textContent;
                newLinks.push(guid.replace(/^http:\/\/www\.instapaper\.com/, ""));
            }
        }
        for(var n = 0, l = newLinks.length; n < l; n++){
            var node = $x('//a[@href="'+newLinks[n]+'"]')[0];
            var newFlag = document.createElement("span");
            newFlag.setAttribute("class", "new");
            newFlag.appendChild(document.createTextNode("New"));
            node.firstChild.insertData(0, " ");
            node.insertBefore(newFlag, node.firstChild);
        }
    }

    // get RSS feed (don't request from within an iframe)
    if(rss && top == window){
        GM_xmlhttpRequest({
             method: "GET",
                url: rss.getAttribute("href"),
            headers: {"User-Agent": "Mozilla/5.0 (compatible) Greasemonkey", "Accept": "text/xml"},
             onload: parseRssFeed
        });
    }



})();




//
// HELVETIPAPER STYLES
//
var css = ''+
'body{background-color:#FFF;color:#444;font-weight:bold;font-size:12px;line-height:1.5;font-family:Helvetica,sans-serif;width:100% !important;margin:0;padding:0;}'+
'#header div{display:none;}'+

'h1#logo{font-weight:bold;font-size:144px;line-height:1;font-family:Helvetica,sans-serif;border:none;letter-spacing:-6px;margin:0;padding:40px 100px;}'+
'h1#logo a{color:red;background:#FFF;text-decoration:none;}'+
'h1#logo a:hover{text-decoration:none;background:red;color:#FFF;padding:0 0.2em;margin:0 -0.2em;}'+

'#header{margin-bottom:0;}'+
'#header div#userdata{display:block;float:right;font-size:16px;margin-top:10px;padding:0;font-weight:bold;}'+
'#header div#userdata span{margin-right:16px;}'+
'#header div#userdata a{color:red;font-weight:bold;display:inline-block;width:110px;}'+
'#header div#userdata a:hover{text-decoration:none;background:red;color:#FFF;padding:2px 0 2px 8px;margin:-2px 0 -2px -8px;}'+

'#content{overflow:hidden;padding-top:10px;}'+
'#content h2#categoryHeader{color:#444;font-weight:bold;font-size:52px;line-height:1.5;font-family:Helvetica,sans-serif;letter-spacing:-2px;margin:0 100px 30px;}'+
'#content h2#categoryHeader span,h2#categoryHeader a{display:none}'+
'#content h2#categoryHeader sup{-moz-border-radius:10px;background:#CCC;color:#FFF;font-weight:normal;letter-spacing:0;margin-left:-8px;padding:5px 8px 0;}'+
'#content h2#categoryHeader div{display:inline-block;font-size:24px;line-height:1.5;font-family:Helvetica,sans-serif;letter-spacing:0;margin-left:40px;}'+
'#content h2#categoryHeader div.categorylink a{color:red;display:block;font-size:36px;}'+
'#content h2#categoryHeader div.categorylink a sup{background:#FAA;color:#FFF;margin-left:3px;}'+
'#content h2#categoryHeader div.categorylink a:hover{text-decoration:none;background:red;color:#FFF;padding:0 8px;margin:0 -8px;}'+

'div#right_column,div#paginationTop{display:none;}'+
'div#left_column,div#bookmark_list{width:100%;}'+

'div#bookmark_list .tableViewCell{-moz-border-radius:0;border:none;border-top:12px solid #FFF;background:#FFF;padding:0;}'+
'div#bookmark_list .tableViewCell:hover{background:#DDD;}'+
'div#bookmark_list .cornerControls{margin-top:2px;}'+
'div#bookmark_list .cornerControls .textButton{display:none;}'+

'div#bookmark_list .cornerControls a{font-weight:bold;font-size:16px;line-height:1.1;font-family:Helvetica,sans-serif;color:red;width:100px;margin:0;background:transparent;border:none;display:inline-block;padding:5px;text-align:left;color:#FFF !important;}'+
'div#bookmark_list .tableViewCell:hover .cornerControls a:hover{text-decoration:none;background:red;color:#FFF !important;padding:7px 13px 5px;margin:-2px -8px 0px;}'+

'div#bookmark_list .starBox{float:right;display:none;}'+

'div#bookmark_list .titleUrl{font-weight:bold;font-size:32px;line-height:1.1;font-family:Helvetica,sans-serif;color:#CCC;width:none;margin:0 0 10px 300px;display:block;}'+
'div#bookmark_list .tableViewCell:hover .titleUrl{color:#F9F9F9}'+
'div#bookmark_list .tableViewCell:hover .cornerControls a{color:red !important;-moz-border-radius:0;}'+

'div#bookmark_list #tableViewCell0 div{color:#444;padding-top:6px;font-size:36px;margin-top:0 !important;}'+

'div#bookmark_list .titleRow{width:100%;margin-left:-200px;padding:0;position:relative;}'+
'div#bookmark_list .titleRow div.pagelink{width:none;margin-left:190px;display:inline;}'+
'div#bookmark_list .titleRow a.starToggleStarred{font-size:42px;line-height:1.1;font-family:Helvetica,sans-serif;color:red;width:none;display:inline;position:absolute;left:240px;top:14px;outline:none;}'+
'div#bookmark_list .titleRow a.starToggleStarred:hover{text-decoration:none;}'+
'div#bookmark_list .titleRow a.starToggleUnstarred{font-size:42px;line-height:1.1;font-family:Helvetica,sans-serif;color:#DDD;width:none;display:inline;position:absolute;left:240px;top:14px;outline:none;}'+
'div#bookmark_list .titleRow a.starToggleProgress{display:inline;position:absolute;left:240px;top:14px;outline:none;}'+
'div#bookmark_list .titleRow a.starToggleProgress img{display:none;}'+
'div#bookmark_list .tableViewCell:hover .titleRow a.starToggleUnstarred:hover{text-decoration:none;color:red;}'+
'div#bookmark_list .tableViewCell:hover a.starToggleUnstarred{color:#F9F9F9}'+
'div#bookmark_list .titleRow a.tableViewCellTitleLink{font-weight:bold;font-size:32px;line-height:1.1;font-family:Helvetica,sans-serif;color:#444;width:none;display:block;margin:20px 0 0 300px;outline:none;}'+
'div#bookmark_list .titleRow a.tableViewCellTitleLink:hover{text-decoration:none;}'+

'div#bookmark_list .tableViewCell:hover .titleRow a.tableViewCellTitleLink{text-decoration:none;color:red;}'+
'div#bookmark_list .titleRow a.tableViewCellTitleLink span.new{-moz-border-radius:10px;background:#444;color:#FFF;padding:5px 10px 0;}'+
'div#bookmark_list .tableViewCell:hover .titleRow a.tableViewCellTitleLink span.new{color:#F9F9F9;}'+
'div#bookmark_list .titleRow div.summary{display:none;}'+
'div#bookmark_list .secondaryControls{display:none;}'+

'div#footer{display:none;}'+
'div#bottom{}'+
'div#bottom div{margin:12em 0 4em 100px !important;}'+
'div#bottom div a{color:red;text-decoration:none;}'+
'div#bottom div a.gh-page{margin-left:-9px;}'+

'#adlabel, #ad, #deckpromo, #adclear{display:none;}'+

'iframe{display:none;}'+

'#content h2#categoryHeader{float:none;}'+
'#feature_column{float:none;width:100%;margin:0 100px;}'+
'#side_column{float:none;width:100%;padding:0;margin:0 100px;}'+

'';

attachCSS(css);





