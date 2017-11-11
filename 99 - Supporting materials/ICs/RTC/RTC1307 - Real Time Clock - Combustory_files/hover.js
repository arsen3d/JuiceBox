if(typeof ch_settings == 'undefined') ch_settings = {};

var HOVER = window.HOVER ? window.HOVER : (function () {
    "use strict";
    var already_fired           = false;
    var animation_delay         = 1000;
    var animation_frame         = 0;
    var animation_frames        = 50;
    var animation_offset        = 0;
    var container_name          = 'chitikaAdBlock-HOVER';
    var frame_name              = 'ch_adHOVER';
    var height                  = 200;
    var impsrc_version          = "2.0";
    var snippet_count           = 1;
    var snippet_length          = 100;
    var snippet_priority        = ['title', 'h1', 'keywords', 'description'];
    var width                   = 500;

    function animate() {
        setTimeout(function() {
            var container = document.getElementById(container_name);
            var delta = width + 10;
            animation_offset = (delta * ease_in_cubic(animation_frame, 0, 1, animation_frames));
            container.style.right = (-width + animation_offset) + "px";
            animation_frame++;
            if (animation_frame <= animation_frames) { animate(); }
        }, 1000/animation_frames);
    }

    function check_cookie() {
        return document.cookie.indexOf("ch_hover_first_load") > -1;
    }

    function drop_cookie() {
        document.cookie = "ch_hover_first_load=1; expires=0; path=/";
    }

    function ease_in_cubic(t, b, c, d) {
        return c*(t/=d)*t*t + b;
    }

    function make_it_so() {
        if (already_fired == true) return;
        already_fired = true;
        if (check_cookie()) return;

        // 1: Setup the div and iframe, leaving time for them to make it into
        //    The DOM before the response comes.
        var container = document.createElement('div');
        container.id = container_name;
        container.name = container_name;
        container.style.width = width;
        container.style.height = height;
        container.style.position = "fixed";
        container.style.bottom = '10px';
        container.style.right = -(width) + "px";
        container.style.zIndex = 99999;
        CHITIKA_ADS.attach_close(
            container,
            {
                style               : {
                    right         : '5px',
                    top           : '8px'
                }
            },
            function() {
                container.style.visibility = "hidden";
                drop_cookie();
                return false;
            }
        );

        var frame = CHITIKA_ADS.create_iframe({
            allowTransparency       : 'allowTransparency',
            'class'                 : 'chitikaAdBlock',
            height                  : height,
            id                      : frame_name,
            name                    : frame_name,
            width                   : width
        });
        container.appendChild(frame);
        document.getElementsByTagName('body')[0].appendChild(container);

        // 2: Figure out if we are in hover or adhesion mode.
        var cid             = 'hover';
        var product         = 'hover';
        var sid             = 'hover app';
        var url_data        = CHITIKA_ADS.get_url_data();
        if (CHITIKA_ADS.mobile_type() > 0) {
            cid = 'adhesion';
            product = 'adhesion';
            sid = 'mobile adhesion ad';
        }

        // 3: Construct the ad request URL.
        var adUrl = 'http://mm.chitika.net/minimall?callback=HOVER.renderAd&output=simplejs&impsrc=hover';
        adUrl = CHITIKA_ADS.param_concat_escape(adUrl, 'vsn', impsrc_version);
        adUrl = CHITIKA_ADS.param_concat_escape(adUrl, 'product', product);
        adUrl = CHITIKA_ADS.param_concat_escape(adUrl, 'publisher', CHITIKA_ADS.publisher);
        adUrl = CHITIKA_ADS.param_concat_escape(adUrl, 'cid', cid);
        adUrl = CHITIKA_ADS.param_concat_escape(adUrl, 'sid', sid);
        adUrl = CHITIKA_ADS.param_concat_escape(adUrl, 'h', height);
        adUrl = CHITIKA_ADS.param_concat_escape(adUrl, 'w', width);

        // Add info about where we are on the internet
        for (var k in url_data) {
            var v = url_data[k];
            adUrl = CHITIKA_ADS.param_concat_escape(adUrl, k, v);
        }

        var count = 0;
        var snippet_data = CHITIKA_ADS.get_snippet_data();
        for (var i = 0; i < snippet_priority.length && count < snippet_count; i++) {
            var id = snippet_priority[i];
            if (snippet_data[id]) {
                adUrl = CHITIKA_ADS.param_concat_escape(adUrl, 'snip_' + id, snippet_data[id].substring(0, snippet_length));
                ++count;
            }
        }

        // 4: Make the ad request.
        CHITIKA_ADS.add_script(adUrl);
    }

    function renderAd(response) {
        if (response === undefined) { response = window.ch_mmhtml; }
        if (!response || !response.output) { return; }

        var frame = document.getElementById(frame_name);
        frame.contentWindow.document.open();
        frame.contentWindow.document.write(response.output);
        frame.contentWindow.document.close();

        setTimeout(animate, animation_delay);
    }

    return {
        animation_delay     : animation_delay,
        animation_frames    : animation_frames,
        make_it_so          : make_it_so,
        height              : height,
        renderAd            : renderAd,
        width               : width
    }
}());

if (CHITIKA_ADS.mobile_type() == 0) {
    HOVER.make_it_so();
}
