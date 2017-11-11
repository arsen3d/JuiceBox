var CHITIKA_ADS = window.CHITIKA_ADS ? window.CHITIKA_ADS : (function() {
    "use strict";
    var already_bridged     = false;
    var already_fired       = false;
    var ch_amm_version      = "3.3.0";
    var mobile              = undefined;
    var previous_format     = [];
    var publisher           = undefined;
    var size_screen         = undefined;
    var size_scroll         = undefined;
    var size_viewport       = undefined;
    var snippet_cache       = undefined;
    var snippet_count       = 1;
    var snippet_length      = 100;
    var snippet_priority    = ['title', 'h1', 'keywords', 'description'];
    var url_data_cache      = undefined;

    function add_script(url, d) {
        if (d === undefined) {d = document;}
        if (typeof(url) !== 'string') {return undefined;}
        var h = d.getElementsByTagName('head')[0];
        if (!h) {return undefined;}
        var s = d.createElement('script');
        s.type = 'text/javascript';
        s.src = url;
        h.appendChild(s);
        return s;
    }

    var amm_getads_map = {
        'ch_alternate_ad_url'       : 'alternate_ad_url',
        'ch_alternate_css_url'      : 'alternate_css_url',
        'ch_cid'                    : 'cid',
        'ch_city'                   : 'city',
        'ch_client'                 : 'client',
        'ch_color_bg'               : 'color_bg',
        'ch_color_border'           : 'color_border',
        'ch_color_site_link'        : 'color_site_link',
        'ch_color_text'             : 'color_text',
        'ch_color_title'            : 'color_title',
        'ch_fluidH'                 : 'fluidH',
        'ch_fluidW'                 : 'fluidW',
        'ch_font_text'              : 'font_text',
        'ch_font_title'             : 'font_title',
        'ch_height'                 : 'height',
        'ch_hq'                     : 'hq',
        'ch_nump'                   : 'nump',
        'ch_queries'                : 'queries',
        'ch_query'                  : 'query',
        'ch_sid'                    : 'sid',
        'ch_state'                  : 'state',
        'ch_target'                 : 'target',
        'ch_third_party_tracker'    : 'third_party_tracker',
        'ch_type'                   : 'type',
        'ch_where'                  : 'where',
        'ch_width'                  : 'width',
        'ch_zip'                    : 'zip'
    };

    function append_func(obj, event, fun) {
        if (obj.addEventListener) {
            obj.addEventListener(event, fun, false);
        } else {
            obj.attachEvent('on' + event, fun);
        }
    }

    function attach_close(container, properties, fun) {
        var button = document.createElement('a');
        button.href = "#chitika_close_button";
        button.style.background = "url(http://images.chitika.net/buttons/close_round_white_on_red.png)";
        button.style["background-repeat"] = 'no-repeat';
        button.style.height = "14px";
        button.style.position = "absolute";
        button.style.right = "0px";
        button.style.top = "0px";
        button.style.width = "16px";
        button.style.zIndex = "999999";

        // Set optional properties on the new button.
        if (typeof(properties) == 'object') { set_properties(button, properties); }

        append_func(button, 'click', fun);
        container.appendChild(button);
    }

    // Backwards compat for amm.js
    function bridge_amm() {
        var w = window;
        // 0: Bail out if backcompat not necessary
        if (w.ch_client === undefined) return;

        // 1: Make sure we have a units array.
        w.chitika_units = w.chitika_units ? w.chitika_units : [];
        var unit = {};

        // 2: Map parameters into a unit instruction.
        for (var n in amm_getads_map) {
            var mapped = amm_getads_map[n];
            var value = w[n];
            if (typeof(value) !== 'function') {
                unit[mapped] = value;
            }
        }

        // 3: Identify the impsrc specially.
        unit['impsrc'] = def(w.ch_impsrc, 'amm-getads-bridge');

        // 4: Save the unit instruction.
        var r = w.chitika_units.length;
        w.chitika_units[r] = unit;

        // 5: Write the div beacon.
        document.write('<div id="chitikaAdBlock-'+r+'"></div>');

        // 6: Clear global variables.
        w.ch_alternate_ad_url = undefined;
        w.ch_alternate_css_url = undefined;
        w.ch_cid = undefined;
        w.ch_city = undefined;
        w.ch_fluidH = undefined;
        w.ch_fluidW = undefined;
        w.ch_height = undefined;
        w.ch_impsrc = undefined;
        w.ch_metro_id = undefined;
        w.ch_nump = undefined;
        w.ch_query = undefined;
        w.ch_sid = undefined;
        w.ch_state = undefined;
        w.ch_type = undefined;
        w.ch_where = undefined;
        w.ch_width = undefined;
        w.ch_zip = undefined;
    }

    // Set the callback function within the iframe.
    function create_callback(frame) {
        frame.contentWindow.render_ad = function(response) {
            if (response === undefined) {response = frame.contentWindow.ch_mmhtml;}
            if (response === undefined) {
                frame.style.display = 'none';
                // Make sure you always close your iframe no matter what!
                frame.contentWindow.document.close();
                return;
            }

            var unit_id = response.unit_id || response.cb;
            var unit = window.chitika_units[unit_id];
            unit['impId'] = response.impId;

            if (unit_id === 0) {
                append_func(window, 'scroll', visibility_check);
            }

            if (response.hover) {
                try {
                    top.window.ch_mmhtml = {};
                    top.window.ch_mmhtml.hover = response.hover;
                    top.window.ch_mmhtml.publisher = response.publisher;
                    add_script('http://maps-static.chitika.net/js/m.js',
                               top.window.document);
                } catch(e) {
                }
            }

            if (response.js) {
                for (var i = 0; i < response.js.length; i++) {
                    var url = response.js[i];
                    add_script(url, top.window.document);
                }
            }

            if (response.pixels) {
                for (var i = 0; i < response.pixels.length; i++) {
                    var url = response.pixels[i];
                    var fimg = document.createElement("img");
                    fimg.border = 0;
                    fimg.style.border = 'none';
                    fimg.style.display = 'none';
                    fimg.width = 1;
                    fimg.height = 1;
                    fimg.src = url;
                    document.body.appendChild(fimg);
                }
            }

            // Validate the response.
            if (response.output) {
                try {
                    // Fall back to writing the content, which breaks in most browsers, just not IE6
                    frame.contentWindow.document.open();
                    frame.contentWindow.document.write(response.output);
                    frame.contentWindow.document.close();

                    // If fluid height has been enabled, enact it.
                    if (frame.resize_height !== undefined) {
                        // We need to monitor for a few events, including
                        // window and iframe resizing. This helps to ensure
                        // fluid height plays nicely with fluid width.
                        setTimeout(frame.resize_height, 20);
                    }
                } catch (e) {
                    // Try setting the innerHTML; this works for most browsers, just not IE6
                    frame.contentWindow.document.innerHTML = response.output;
                }
                visibility_check();
            } else if (response.alturl) {
                frame.src = response.alturl;
            } else {
                frame.style.display = 'none';
                frame.contentWindow.document.close();
            }
        }
    }

    ////////////////////////////////////////////////////////////////
    // Shorthand for creating an iframe element.
    function create_iframe(parameters) {
        // Make sure we have a parameters object, even if it's empty.
        if (parameters === undefined) {
            parameters = {};
        }

        // Set default parameter values; use def here to avoid overriding supplied parameters
        parameters.src              = def(parameters.src,           'about:blank');
        parameters.border           = def(parameters.border,        '0');
        parameters.padding          = def(parameters.padding,       '0');
        parameters.frameBorder      = def(parameters.frameBorder,   '0');
        parameters.marginWidth      = def(parameters.marginWidth,   '0');
        parameters.marginHeight     = def(parameters.margineHeight, '0');
        parameters.vspace           = def(parameters.vspace,        '0');
        parameters.hspace           = def(parameters.hspace,        '0');
        parameters.scrolling        = def(parameters.scrolling,     'no');
        parameters.className        = def(parameters.className,     '');
        parameters.width            = def(parameters.width,         '0');
        parameters.height           = def(parameters.height,        '0');
        parameters.style            = def(parameters.style,         {});
        parameters.style.margin     = def(parameters.style.margin,  '0');
        parameters.style.padding    = def(parameters.style.padding, '0');

        // Create the iframe
        var i = document.createElement('iframe');

        // Set the parameters
        set_properties(i, parameters);

        // Return the iframe.
        return i;
    }

    function create_resize_function(frame, unit_id) {
        frame.resize_height = function () {
            if (!frame ||
                !frame.contentWindow ||
                !frame.contentWindow.document) {
                return;
            }
            var h1 = frame.contentWindow.document.documentElement.scrollHeight ||
                     frame.contentWindow.document.body.scrollHeight;
            var h2 = window.chitika_units[unit_id]['height'];
            if (h1 != h2) {
                window.chitika_units[unit_id]['height'] = h1;
                frame.style.height = h1 + "px";
            }
        }
        append_func(window, 'resize', frame.resize_height);
    }

    // def() - If defined, return v, else return def(ault)
    function def(v, def) {
        if (v !== null && v !== undefined) {
            return v;
        }
        else {
            return def;
        }
    }

    // dq() - Return input surrounded by double-quotes
    function dq(s) { return (s !== null) ? '"' + s + '"' : '""'; }

    function get_screen_size() {
        if (size_screen !== undefined) { return size_screen; }
        size_screen = {
            h: screen.height,
            w: screen.width
        }
        return size_screen;
    }

    function get_scroll_size() {
        if (size_scroll !== undefined) { return size_scroll; }
        size_scroll = {
            h: document.documentElement.scrollHeight ||
               document.body.scrollHeight,
            w: document.documentElement.scrollWidth ||
               document.body.scrollWidth
        }
        return size_scroll;
    }

    // get_snippet_data - Gathers snippets of text from the page which can
    // be used for targeting.
    function get_snippet_data() {
        if (snippet_cache) { return snippet_cache; }
        var meta    = undefined,
            h1      = undefined;
        snippet_cache = {};

        // 1. Gather snippets from on-page elements.
        if (document.getElementsByTagName) {
            // 1a. Meta tags (only keywords/description are considered)
            meta = document.getElementsByTagName('meta');
            for (var i = 0; i < meta.length; i++) {
                var name    = meta[i].getAttribute('name'),
                    content = meta[i].getAttribute('content');

                if (name && content) {
                    snippet_cache[name.toLowerCase()] = content;
                }
            }

            // 1b. First H1 tag
            h1 = document.getElementsByTagName('h1');
            if (h1.length > 0) {
                snippet_cache['h1'] = get_text(h1[0]);
            }
        }

        // 2. Grab the title if possible.
        if (document.title) {
            snippet_cache['title'] = document.title;
        }

        // 3. Return it.
        return snippet_cache;
    }

    // Shorthand method of grabbing the text content of an element.
    // Required because IE writes its own standard.
    function get_text(node) {
        var r = '';

        if (node.innerText !== undefined) {
            r = node.innerText;
        } else if (node.textContent !== undefined) {
            r = node.textContent;
        }

        return r;
    }

    function get_url_data() {
        if (url_data_cache !== undefined) { return url_data_cache; }
        var frm, ref, serveUrl, url;
        // Detect iframes and pass appropriate frm & url values
        try {
            // Are win in an iframe?
            if (window.top.document.location.href == document.location.href) {
                // Nope. Nothing special here to do.
                ref             = document.referrer;
                url             = document.location.href;
            } else {
                // Yes, we are
                frm             = 1;
                ref             = window.top.document.referrer;
                url             = window.top.document.location.href;
                serveUrl        = document.location.href;
            }
        } catch (x) { // Security exception
            // Security problem. Try something else. Hope this works...
            frm                 = 2;
            url                 = document.referrer;
            serveUrl            = document.location.href;
        }

        if (serveUrl &&
            serveUrl.match(/^javascript:/)) {
            serveUrl = undefined;
        }
        url_data_cache = {
            frm         : frm,
            ref         : ref,
            serveUrl    : serveUrl,
            url         : url
        };
        return url_data_cache;
    }

    function get_viewport_size() {
        if (size_viewport !== undefined) { return size_viewport; }

        var w;
        try {
            w = window.top;
        } catch (e) {
            w = window;
        }

        size_viewport = {
            h   : w.innerHeight ||
                 document.documentElement.clientHeight ||
                 document.body.clientHeight,
            w   : w.innerWidth ||
                  document.documentElement.clientWidth ||
                  document.body.clientWidth
        };
        return size_viewport;
    }

    // ldef() - Return the first argument that isn't undefined
    function ldef() {
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] !== undefined) {
                return arguments[i];
            }
        }
        return undefined;
    }

    // locate_obj() - walks the DOM tree from obj, accumulating offset left
    // and top to find X, Y position for obj
    function locate_obj(obj) {
        var _x = 0;
        var _y = 0;
        var _w = 0;
        var _h = 0;
        _w = obj.offsetWidth;
        _h = obj.offsetHeight;
        while (obj &&
               !isNaN(obj.offsetLeft) &&
               !isNaN(obj.offsetTop)) {
            _x += obj.offsetLeft - obj.scrollLeft;
            _y += obj.offsetTop - obj.scrollTop;
            obj = obj.offsetParent;
        }
        return { y: _y, x: _x, w: _w, h: _h };
    }

    // Main function; generates Chitika request
    function make_it_so() {
        // This is to deal with the setTimeout emergency handler to avoid
        // double-calling for ads.
        if (already_fired === true) { return; }
        already_fired = true;

        // Shorthand accessor for window
        var ch_ad_url           = null,
            ch_host             = "mm.chitika.net",
            ch_test             = null,
            screen_size_data    = get_screen_size(),
            scroll_size_data    = get_scroll_size(),
            snippet_data        = get_snippet_data(),
            url_data            = get_url_data(),
            viewport_size_data  = get_viewport_size();

        var ch_au = function(p, v) {
            ch_ad_url = param_concat(ch_ad_url, p, v);
        }

        var ch_aue = function(p, v) {
            ch_ad_url = param_concat_escape(ch_ad_url, p, v);
        }

        var ch_aun = function(p, v) {
            ch_ad_url = param_concat_words(ch_ad_url, p, v);
        }

        var units = window.chitika_units;
        for (var unit_id in units) {
            var w = units[unit_id];
            if (w === null || typeof(w) != 'object') { continue; }

            if (w.client == 'epodunk') {
                ch_aue('dcc1', 1);
                if (m = w.location.hostname.match(/([^\.]+)\.(com|net|org|info|mobi|co\.uk|org\.uk|ac\.uk|uk)$/)) {
                    w.sid = 'epodunk_' + m[1];
                }
            }

            if (w.client.match(/^epodunk_/)) {
                ch_aue('dcc3', 1);
                w.sid = w.client;
                w.client = 'epodunk';
            }

            CHITIKA_ADS.publisher = w.client;

            // Get Configuration ID; default to unit-N or SID, if unavailable
            if (!w.cid) {
                if (!w.sid ||
                    w.sid == 'Chitika Default') {
                    w.cid = 'unit-'+unit_id;
                }
                else {
                    w.cid = w.sid;
                }
            }
            w.impsrc = def(w.impsrc, "getads");

            // Use ch_host if defined; default to mm.chitika.net
            if (w.ch_host) ch_host = w.ch_host
            ch_ad_url = 'http://' + ch_host + '/minimall?output=simplejs&callback=render_ad';

            // Fake URLs are only for testing purposes.
            if (w.url) {
                url_data.url = w.url;
                ch_test = 1;
                ch_aue('dcc2', 1);
            }

            // For a long time we gave silly instructions to tell is by
            // parameter some default colors. That's a waste of time.
            // Skip them.
            var defaults = {
                'color_bg'          : '^#?ffffff',
                'color_border'      : '^#?ffffff',
                'color_site_link'   : '^#?0000cc',
                'color_text'        : '^#?000000',
                'color_title'       : '^#?0000cc',
                'type'              : '^mpu$'
            };
            for (var p in defaults) {
                var c = defaults[p];
                if (!w[p]) { continue; }
                if (w[p].match(c)) { w[p] = undefined; }
            }

            // Add info about where we are on the internet
            for (var k in url_data) {
                var v = url_data[k];
                ch_aue(k, v);
            }

            ////////////////////////////////////////////////////////////////
            // This is where we start appending the necessary parameters
            // for the ad server.
            ch_aue('w',             w.width);               // Unit's width
            ch_aue('h',             w.height);              // Unit's height
            ch_aue('publisher',     CHITIKA_ADS.publisher);
            ch_aue('sid',           w.sid);
            ch_aun('cid',           w.cid);
            ch_aue('nump',          w.nump);                 // Number of ads to be requested
            ch_aue('query',         w.query);                // Publisher-specified targeting
            ch_aue('type',          w.type);                 // "type" of ad unit; mpu, local, mobile, map, etc.

            // If multiple queries have been specified, add them to request URL as
            // mquery; mquery defaults to ch_query
            if (w.queries &&
                w.queries.constructor.toString().indexOf("Array") !== -1) {
                ch_aue('mquery', w.queries.join('|'));
            }

            ch_aue('tptracker',             w.third_party_tracker);  // Third-party tracking URL; Chitika clicks will be routed through this URL
            ch_aue('cttarget',              w.target);               // Set the arget window of Chitika clicks
            ch_aue('cl_border',             w.color_border);         // Border color (default #cccccc)
            ch_aue('cl_bg',                 w.color_bg);             // Background color (default #ffffff)
            ch_aue('cl_title',              w.color_title);          // Font-color for ad Title (default #0000cc)
            ch_aue('cl_text',               w.color_text);           // Font-color for ad Text (default #000000)
            ch_aue('cl_site_link',          w.color_site_link);      // Font-color for ad Tagline (default #0000cc)
            ch_aue('fn_title',              w.font_title);           // Font-family for ad Title (default Arial, Helvetica, sans-serif)
            ch_aue('fn_text',               w.font_text);            // Font-family for ad Text/Tagline (default Arial, Helvetica, sans-serif)
            ch_aue('alturl',                w.alternate_ad_url);     // If Chitika has no ads, create iframe with this URL instead
            ch_aue('altcss',                w.alternate_css_url);    // Used by Chitika; if specified, CSS file will be included via "link" tag in Chitika's HTML
            ch_aue('previous_format',       previous_format.join(','));// Historical method for detecting previous ads
            ch_aue('where',                 w.where);                // City, State for search; used for local/map units

            // Detects whether or not we're in a frame
            ch_aue('history',               history.length);            // Number of pages viewed BEFORE this view
            ch_aue('city',                  w.city);                    // More reliable than ch_where; specify city name
            ch_aue('state',                 w.state);                   // More reliable than ch_where; specify state (2 letter code or full name)
            ch_aue('zip',                   w.zip);                     // More reliable than ch_where; specify zip/postal code
            ch_aue('impsrc',                w.impsrc);                  // Indicate which version of AMM.js is running
            ch_aue('extra_subid_info',      w.extra_subid_info);        // Arbitrary string for generating subid patterns
            ch_aue('vsn',                   ch_amm_version);
            ch_au('cb',                     unit_id);                   // Random number to associate with this unit.
            ch_au('dpr',                    window.devicePixelRatio);
            ch_au('test',                   ch_test);

            ch_aue('size_screen',           screen_size_data.w+'x'+screen_size_data.h);
            ch_aue('size_scroll',           scroll_size_data.w+'x'+scroll_size_data.h);
            ch_aue('size_viewport',         viewport_size_data.w+'x'+viewport_size_data.h);

            if (w.minimall !== undefined) {
                for (var i = 0; i < w.minimall.length; i++) {
                    var a = w.minimall[i];
                    ch_aue(a.k, a.v);
                }
            }

            if (navigator.userAgent.match(/Chrome/) &&
                document.webkitVisibilityState !== undefined &&
                document.webkitVisibilityState == "prerender") {
                ch_au('prerender', 1);
            }

            if (document.location.href.indexOf('##chitika_ab=') !== -1) {
                ch_au('ab_overlay_which', document.location.href.match(/##chitika_ab=([^&]+)/)[1]);
            }

            // Take the first snippet_count snippets and append them to the
            // URL, taken in the order of snippet_priority
            var count = 0;
            for (var i = 0; i < snippet_priority.length && count < snippet_count; i++) {
                var id = snippet_priority[i];
                if (snippet_data[id]) {
                    ch_aue('snip_' + id, snippet_data[id].substring(0, snippet_length));
                    ++count;
                }
            }

            previous_format.push(w.width + "x" + w.height);

            var ad_beacon = document.getElementById('chitikaAdBlock-' + unit_id);
            w.loc = locate_obj(ad_beacon);
            ch_aue("loc", w.loc.x + "," + w.loc.y);

            ch_ad_url = ch_ad_url.substring(0, 2048);       // Trim request URL to 2048 characters
            ch_ad_url = ch_ad_url.replace(/%\w?$/, '');     // Remove any trailing malformed URL encoded character

            var fid     = "ch_ad" + unit_id;
            var fobj    = create_iframe({
                'id':                   fid,
                'class':                'chitikaAdBlock',
                'allowTransparency':    'allowTransparency',    // Enables transparent BG in iframes for IE6
                'name':                 fid,
                'width':                w.width,
                'height':               (typeof w.height === 'string' ? 0 : def(w.height, 0))
            });

            if (w.fluidW) {
                ad_beacon.style.width = "auto";
                ad_beacon.style.overflow = "hidden";
                fobj.style.width = "100%";
            }

            // FLUID HEIGHT (h=auto) FUNCTIONALITY
            // Causes the iframe to grow to the size of the body that is
            // returned for it.
            if (w.fluidH) {
                create_resize_function(fobj, unit_id);
            }

            ad_beacon.appendChild(fobj);

            // We need to write an empty document into our iframe, else
            // you won't be able to inject a <script> into its head. Only
            // a problem with certain ::cough MSIE:: browsers.
            // NOTE: The contentWindow doesn't exist until the object is in
            //       the DOM.
            fobj.contentWindow.document.write('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><head></head><body></body></html>');

            create_callback(fobj);

            if (w.adurl_fixup !== undefined) {
                ch_ad_url = w.adurl_fixup(ch_ad_url);
            }

            if (w.hq) {
                for (var k in w.hq) {
                    fobj.contentWindow[k] = w.hq[k];
                }
                var hq_file = ldef(w.hq_file, w.client, 'default');
                var s = document.createElement('script');
                s.type = 'text/javascript';
                s.src = 'http://tags.chitika.net/hq/' + hq_file + '.js';
                s.ch_ad_url = ch_ad_url;
                s._target = fobj.contentWindow;
                s._fired = false;

                s.onload = function() {
                    if (this.has_fired) return;
                    window.ch_target_window = this._target;
                    window.ch_real_ad_url = this.ch_ad_url;
                    window.ch_hq_execute();
                    this.has_fired = true;
                }
                s.onreadystatechange = function() {
                    if (this.has_fired) return;
                    if (this.readyState == "complete" || this.readyState == "loaded") {
                        window.ch_target_window = this._target;
                        window.ch_real_ad_url = this.ch_ad_url;
                        window.ch_hq_execute();
                        this.has_fired = true;
                    }
                }

                document.getElementsByTagName('head')[0].appendChild(s);
            } else {
                add_script(ch_ad_url, fobj.contentWindow.document);
            }
        }
    }

    function mobile_type() {
        if (mobile !== undefined) { return mobile; }
        if (/i[Pp]ad/.test(navigator.userAgent)) {
            mobile = 2;
        }
        else if (/i[Pp]od/.test(navigator.userAgent)) {
            mobile = 4;
        }
        else if (/i[Pp]hone/.test(navigator.userAgent)) {
            mobile = 1;
        }
        else if (/[Aa]ndroid/.test(navigator.userAgent)) {
            mobile = 3;
        }
        else if (/BlackBerry|RIM/.test(navigator.userAgent)) {
            mobile = 5;
        }
        else {
            mobile = 0;
        }
        return mobile;
    }

    function param_concat(url, p, v) {
        if (!v && v !== 0) { return url; }
        return url + '&' + p + '=' + v;
    }

    function param_concat_escape(url, p, v) {
        if (!v && v !== 0) { return url; }
        return url + '&' + p + '=' + encodeURIComponent(v);
    }

    function param_concat_words(url, p, v) {
        if (!v && v !== 0) { return url; }
        v = v.replace(/[\W]+/, '_');
        return url + '&' + p + '=' + encodeURIComponent(v);
    }

    function send_event(event_name, impId, metadata) {
        var url_data = get_url_data();
        var url = 'http://mm.chitika.net/chewey?type='+event_name;
        url = param_concat_escape(url, 'publisher', CHITIKA_ADS.publisher);
        url = param_concat_escape(url, 'impId', impId);
        url = param_concat_escape(url, 'url', url_data.url);
        if (metadata) {
            for (var k in metadata) {
                var v = metadata[k];
                url = param_concat_escape(url, k, v);
            }
        }
if (Math.random() < 0.3) {
        var pixel = new Image(1, 1);
        pixel.src = url;
        pixel.style.display = 'none';
}
    }

    // Define a function for setting iframe attributes from a hash. Needs to function
    // recursively for properties like style.
    function set_properties(o, p) {
        var k = null;
        for (k in p) {
            var v = p[k];
            if (typeof v === 'function') { continue; }
            if (typeof v === 'object') {
                set_properties(o[k], v);
            } else {
                o[k] = v;
            }
        }
    }

    function visibility_check() {
        var offset_h = document.documentElement.scrollTop ||
                       document.body.scrollTop;
        var viewport_size_data = get_viewport_size();
        for (var c = 0; c < window.chitika_units.length; c++) {
            var unit = window.chitika_units[c];
            // 1: Get info about where we are and where the unit is.
            if (unit['already_visible']) { continue; }
            var h = unit['height'];
            if (h == 'auto') { h = 200; } // protect from h=auto
            var y = unit['loc']['y'];

            // 2: Skip if we're not 50% in that visible area.
            if (y < (offset_h - (0.5*h)) ||
                y > (offset_h + viewport_size_data['h'] - (0.5*h))) {
                continue;
            }

            // 3: Send event.
            var metadata = {
                unit_id     : c,
                h           : h,
                offset_h    : offset_h,
                sid         : unit['sid'],
                viewport_h  : viewport_size_data['h'],
                y           : y
            };
            send_event('imp_visible', unit['impId'], metadata);

            // 4: Mark as already visible.
            unit['already_visible'] = true;
        }
    }

    return {
        add_script          : add_script,
        already_bridged     : already_bridged,
        already_fired       : already_fired,
        append_func         : append_func,
        attach_close        : attach_close,
        bridge_amm          : bridge_amm,
        create_iframe       : create_iframe,
        def                 : def,
        dq                  : dq,
        get_screen_size     : get_screen_size,
        get_scroll_size     : get_scroll_size,
        get_snippet_data    : get_snippet_data,
        get_text            : get_text,
        get_url_data        : get_url_data,
        get_viewport_size   : get_viewport_size,
        ldef                : ldef,
        locate_obj          : locate_obj,
        make_it_so          : make_it_so,
        mobile_type         : mobile_type,
        param_concat_escape : param_concat_escape,
        param_concat        : param_concat,
        param_concat_words  : param_concat_words,
        publisher           : publisher,
        set_properties      : set_properties
    };
}());

// Schedule execution.
CHITIKA_ADS.bridge_amm();
if (!CHITIKA_ADS.already_bridged) {
    CHITIKA_ADS.already_bridged = true;
    CHITIKA_ADS.append_func(window, 'load', CHITIKA_ADS.make_it_so);
    setTimeout(CHITIKA_ADS.make_it_so, 2000);
}

function ex_normal_op() {
    // Add a javascript tag to the header of the iframe.
    var s = ch_target_window.document.createElement('script');
    s.type = 'text/javascript';
    s.src = ch_real_ad_url;
    ch_target_window.document.getElementsByTagName('head')[0].appendChild(s);
}
