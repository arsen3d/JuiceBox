if(typeof ch_settings == 'undefined') ch_settings = {};

var SELECT = window.SELECT ? window.SELECT : (function(settings) {

    var MM      = 'http://mm.chitika.net/minimall?';

    var HEIGHT  = 100;

    function getSelText() {
        if (navigator.userAgent.indexOf('MSIE') != -1 &&
            document.selection &&
            document.selection.createRange().text !== "") {
            return document.selection.createRange()
        }
        if (window.getSelection &&
            window.getSelection().toString()) {
            return window.getSelection()
        }
        if (document.getSelection &&
            document.getSelection().toString()) {
            return document.getSelection()
        } else {
            return undefined
        }
    }

    function n(a, b) {
        return a != null ? a : b;
    }

    var mouseDown = 0;
    document.body.onmousedown = function() {
        ++mouseDown;
    }
    document.body.onmouseup = function() {
        --mouseDown;
    }

    return {
        settings :{
            currentTargetWidth : null,
            previousAdBeacon : null,
            previousSelection : null,
            client: n(settings.client, window.ch_client ? window.ch_client : 'demo')
        },

        poller : setInterval(function() {
            var textSelection = getSelText();
            if (!mouseDown &&
                textSelection !== undefined &&
                SELECT.settings.previousSelection != SELECT.getRangeContents(textSelection)) {
                SELECT.callAd(textSelection);
                //clearInterval(SELECT.poller);
            }
        },100),

        getParent : function(text) {
            try {
                if (text.anchorNode.parentElement !== undefined) {
                    return text.anchorNode.parentElement;
                }
            } catch (e) {}

            try {
                return text.anchorNode.parentNode; // Firefox
            } catch (e) {}

            try {
                return text.parentElement(); // IE
            } catch (e) {}
        },

        getRangeContents : function(text) {
            try {
                if (text.text !== undefined) {
                    return text.text; // IE
                }
            } catch(e) {}

            return text.toString();
        },

        callAd : function(text) {
            var parent = SELECT.getParent(text);
            var content = SELECT.getRangeContents(text);
            SELECT.settings.currentTargetWidth = parent.clientWidth;
            SELECT.settings.previousSelection = content;
            var idOfNewNode = SELECT.createBeaconAfter(parent);
            if (idOfNewNode){

                var params = [];
                params.push('callback=' + 'SELECT.showAd');
                params.push('cb='       + idOfNewNode);
                params.push('client='   + SELECT.settings.client);
                params.push('cid='      + 'highlight');
                params.push('h='        + HEIGHT);
                params.push('impsrc='   + 'highlight');
                params.push('output='   + 'simplejs');
                params.push('product='  + 'highlight');
                params.push('query='    + encodeURIComponent(content));
                params.push('ref='      + encodeURIComponent(document.referrer));
                params.push('sid='      + 'highlight');
                params.push('url='      + encodeURIComponent(document.location.href));
                params.push('w='        + SELECT.settings.currentTargetWidth);

                var adURL = MM + params.join('&');

                var adScript = document.createElement('script');
                adScript.src = adURL;
                adScript.type = 'text/javascript';
                document.getElementsByTagName('head')[0].appendChild(adScript);
            }
        },

        createBeaconAfter : function(el) {
            try {
                var r = Math.floor(Math.random() * 1000);
                var beacon = document.createElement('div');
                beacon.id = 'chitikaSelectBeacon'+r;
                beacon.style.cssFloat = 'left';
                beacon.style.cssFloat = 'left';
                beacon.style.styleFloat = 'left';
                el.parentNode.insertBefore(beacon, el.nextSibling);
                SELECT.settings.currentAdBeacon = beacon;
                return r;
            } catch (e){
                return false;
            }
        },

        showAd : function() {
            if (SELECT.settings.previousAdBeacon !== null) {
                SELECT.settings.previousAdBeacon.parentNode.removeChild(SELECT.settings.previousAdBeacon);
            }
            var thehtml = window.ch_mmhtml.output;
            var fobj = document.createElement("iframe");
            var _id = "ch_ad_ctr"+window.ch_mmhtml.cb;
            fobj.src = "about:blank";
            try {fobj.contentWindow.document.designMode = "on";} catch (e) {}
            fobj.border = "0";
            fobj.style.margin = fobj.style.padding = fobj.style.border= 0;
            fobj.padding = "0";
            fobj.frameBorder = 0;
            fobj.marginWidth = 0;
            fobj.marginHeight = 0;
            fobj.vspace = 0;
            fobj.hspace = 0;
            fobj.scrolling = "no";
            fobj.setAttribute("class", "chitikaAdBlock");
            fobj.setAttribute("allowTransparency", "allowTransparency");
            fobj.setAttribute("name", _id);
            fobj.setAttribute("id", _id);
            fobj.width = SELECT.settings.currentTargetWidth+'px';
            fobj.height = '100px';
            var bacon = document.getElementById('chitikaSelectBeacon'+window.ch_mmhtml.cb);
            bacon.appendChild(fobj);
            var fdoc = fobj.contentWindow.document;
            fdoc.open();
            fdoc.write(thehtml);
            fdoc.close();
            SELECT.settings.previousAdBeacon = bacon;
        }
    }
}(ch_settings));
